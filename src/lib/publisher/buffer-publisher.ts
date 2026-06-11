"use server";

import { getStoredBufferAccessToken } from "@/lib/publishing/integration-connection-store";
import { hasPublisherSession } from "@/lib/publisher/auth-guard";
import { createServiceClient } from "@/lib/publisher/supabase/server";
import { getPostContent, upsertPost } from "@/lib/publisher/db";
import type { GeneratedContent } from "./content-generator";
import type { AcpPostStatus } from "@/lib/publisher/supabase/types";

const BUFFER_API = "https://api.bufferapp.com/1";

export type BufferResult = {
  success: boolean;
  publish_id?: string;
  schedule_id?: string;
  error?: string;
  mock?: boolean;
};

export type BufferMode = "live" | "mock";

// ----- public exports -----

export async function getBufferMode(): Promise<BufferMode> {
  const token = await getStoredBufferAccessToken();
  return token ? "live" : "mock";
}

export async function bufferPublish(
  post_id: string,
  content: GeneratedContent | null
): Promise<BufferResult> {
  // Audit C3: unauthorized calls return early — no status write, no log.
  if (!(await hasPublisherSession())) {
    return { success: false, error: "Unauthorized. Sign in before publishing." };
  }
  if (!content?.primary) {
    return fail(post_id, "Publish Now", "Missing primary post content.");
  }

  const token = await getStoredBufferAccessToken();
  if (!token) {
    await serverLog(post_id, "Publish Now", "[MOCK] Buffer publish completed. Connect Buffer in Settings to enable live publishing.", "warn");
    return { success: true, publish_id: `mock_publish_${Date.now()}`, mock: true };
  }

  try {
    const profileId = await resolveProfileId(token);
    const text = buildPostText(content);

    const res = await fetch(`${BUFFER_API}/updates/create.json`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        access_token: token,
        "profile_ids[]": profileId,
        text,
        now: "true",
      }),
    });

    if (!res.ok) {
      const errBody = await parseBufferError(res);
      return fail(post_id, "Publish Now", errBody);
    }

    const data = await res.json() as { id?: string };
    const publish_id = data.id ?? `buffer_${Date.now()}`;
    await saveStatus(post_id, "published");
    await serverLog(post_id, "Publish Now", `Buffer published. ID: ${publish_id}`, "success");
    return { success: true, publish_id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Buffer API unreachable.";
    return fail(post_id, "Publish Now", message);
  }
}

export async function bufferSchedule(
  post_id: string,
  content: GeneratedContent | null,
  scheduled_at: string
): Promise<BufferResult> {
  if (!(await hasPublisherSession())) {
    return { success: false, error: "Unauthorized. Sign in before publishing." };
  }
  if (!content?.primary) {
    return fail(post_id, "Schedule", "Missing primary post content.");
  }
  if (!scheduled_at) {
    return fail(post_id, "Schedule", "Select a scheduled date and time.");
  }

  const token = await getStoredBufferAccessToken();
  if (!token) {
    await upsertPost({ post_id, scheduled_at });
    await serverLog(post_id, "Schedule", `[MOCK] Scheduled for ${scheduled_at}. Connect Buffer in Settings to enable live scheduling.`, "warn");
    return { success: true, schedule_id: `mock_schedule_${Date.now()}`, mock: true };
  }

  try {
    const profileId = await resolveProfileId(token);
    const text = buildPostText(content);

    const bufferScheduledAt = toBufferScheduledAt(scheduled_at);

    const res = await fetch(`${BUFFER_API}/updates/create.json`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        access_token: token,
        "profile_ids[]": profileId,
        text,
        scheduled_at: bufferScheduledAt,
      }),
    });

    if (!res.ok) {
      const errBody = await parseBufferError(res);
      return fail(post_id, "Schedule", errBody);
    }

    const data = await res.json() as { id?: string };
    const schedule_id = data.id ?? `buffer_sched_${Date.now()}`;
    await upsertPost({ post_id, scheduled_at, status: "scheduled" });
    await serverLog(post_id, "Schedule", `Buffer scheduled for ${scheduled_at}. ID: ${schedule_id}`, "success");
    return { success: true, schedule_id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Buffer API unreachable.";
    return fail(post_id, "Schedule", message);
  }
}

export async function bufferRetry(post_id: string): Promise<BufferResult> {
  if (!(await hasPublisherSession())) {
    return { success: false, error: "Unauthorized. Sign in before publishing." };
  }
  const dbContent = await getPostContent(post_id);
  const content = dbContent?.content as GeneratedContent | null;
  return bufferPublish(post_id, content);
}

// ----- private helpers -----

async function resolveProfileId(token: string): Promise<string> {
  const override = process.env.BUFFER_PROFILE_ID;
  if (override) return override;

  const res = await fetch(`${BUFFER_API}/profiles.json?access_token=${token}`);
  if (!res.ok) {
    const err = await parseBufferError(res);
    throw new Error(err);
  }
  const profiles = await res.json() as Array<{ id?: string; service?: string }>;
  const first = profiles[0]?.id;
  if (!first) throw new Error("No Buffer profiles found for this token.");
  return first;
}

function toBufferScheduledAt(scheduled_at: string): string {
  const ms = Date.parse(scheduled_at);
  if (Number.isNaN(ms)) {
    throw new Error("Invalid schedule date and time.");
  }
  return String(Math.floor(ms / 1000));
}

function buildPostText(content: GeneratedContent): string {
  const p = content.primary;
  return [p.headline, p.subheadline, p.long_form, p.hashtags, p.disclaimer]
    .filter(Boolean)
    .join("\n\n");
}

async function parseBufferError(res: Response): Promise<string> {
  try {
    const body = await res.json() as { error?: string; message?: string };
    return body.error ?? body.message ?? `Buffer API error: ${res.status}`;
  } catch {
    return `Buffer API error: ${res.status}`;
  }
}

async function fail(post_id: string, action: string, error: string): Promise<BufferResult> {
  await saveStatus(post_id, "failed");
  await serverLog(post_id, action, error, "error");
  return { success: false, error };
}

async function saveStatus(post_id: string, status: "scheduled" | "published" | "failed") {
  await upsertPost({ post_id, status: status as AcpPostStatus });
}

async function serverLog(
  post_id: string,
  action: string,
  details: string,
  status: "success" | "warn" | "error"
): Promise<void> {
  try {
    const db = createServiceClient();
    await db.from("acp_audit_logs").insert({
      type: "publish",
      action,
      post_id,
      details,
      status,
      agent: "Publish Agent",
    } as never);
  } catch {
    // fire-and-forget
  }
}
