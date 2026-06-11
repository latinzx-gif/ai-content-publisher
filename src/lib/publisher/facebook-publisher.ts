"use server";

import { getStoredFacebookConnection } from "@/lib/publishing/integration-connection-store";
import { hasPublisherSession } from "@/lib/publisher/auth-guard";
import { getPostContent, upsertPost } from "@/lib/publisher/db";
import type { GeneratedContent } from "@/lib/publisher/content-generator";
import { createServiceClient } from "@/lib/publisher/supabase/server";

const FACEBOOK_GRAPH_URL = "https://graph.facebook.com/v21.0";

export type FacebookPublishResult = {
  success: boolean;
  post_id?: string;
  schedule_id?: string;
  error?: string;
  mock?: boolean;
};

export type FacebookPublishMode = "live" | "mock";

export async function getFacebookPublishMode(): Promise<FacebookPublishMode> {
  try {
    const connection = await getStoredFacebookConnection();
    return connection?.accessToken && connection.externalAccountId ? "live" : "mock";
  } catch (error) {
    console.warn("getFacebookPublishMode: falling back to mock", error);
    return "mock";
  }
}

export async function facebookPublish(
  post_id: string,
  content: GeneratedContent | null
): Promise<FacebookPublishResult> {
  // Audit C3: unauthorized calls return early — no status write, no log.
  if (!(await hasPublisherSession())) {
    return { success: false, error: "Unauthorized. Sign in before publishing." };
  }
  if (!content?.primary) {
    return fail(post_id, "Publish Now", "Missing primary post content.");
  }

  const connection = await getStoredFacebookConnection();
  if (!connection?.accessToken || !connection.externalAccountId) {
    await serverLog(
      post_id,
      "Publish Now",
      "[MOCK] Facebook publish saved locally. Connect Facebook in Settings to publish live.",
      "warn"
    );
    return { success: true, post_id: `mock_fb_${Date.now()}`, mock: true };
  }

  try {
    const message = buildPostText(content);
    const url = new URL(`${FACEBOOK_GRAPH_URL}/${connection.externalAccountId}/feed`);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        message,
        access_token: connection.accessToken,
        published: "true",
      }),
    });

    const payload = (await response.json()) as { id?: string; error?: { message?: string } };
    if (!response.ok || !payload.id) {
      return fail(post_id, "Publish Now", payload.error?.message ?? `Facebook API error (${response.status}).`);
    }

    await saveStatus(post_id, "published");
    await serverLog(
      post_id,
      "Publish Now",
      `Facebook published. ID: ${payload.id}`,
      "success"
    );
    return { success: true, post_id: payload.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Facebook API unreachable.";
    return fail(post_id, "Publish Now", message);
  }
}

export async function facebookSchedule(
  post_id: string,
  content: GeneratedContent | null,
  scheduled_at: string
): Promise<FacebookPublishResult> {
  if (!(await hasPublisherSession())) {
    return { success: false, error: "Unauthorized. Sign in before publishing." };
  }
  if (!content?.primary) {
    return fail(post_id, "Schedule", "Missing primary post content.");
  }
  if (!scheduled_at) {
    return fail(post_id, "Schedule", "Select a scheduled date and time.");
  }

  const scheduledUnix = Math.floor(Date.parse(scheduled_at) / 1000);
  if (Number.isNaN(scheduledUnix)) {
    return fail(post_id, "Schedule", "Invalid schedule date and time.");
  }

  const minFuture = Math.floor(Date.now() / 1000) + 600;
  if (scheduledUnix < minFuture) {
    return fail(post_id, "Schedule", "Facebook requires schedule time at least 10 minutes in the future.");
  }

  const connection = await getStoredFacebookConnection();
  if (!connection?.accessToken || !connection.externalAccountId) {
    await upsertPost({ post_id, scheduled_at });
    await serverLog(
      post_id,
      "Schedule",
      `[MOCK] Scheduled for ${scheduled_at}. Connect Facebook in Settings to schedule live.`,
      "warn"
    );
    return { success: true, schedule_id: `mock_fb_schedule_${Date.now()}`, mock: true };
  }

  try {
    const message = buildPostText(content);
    const url = new URL(`${FACEBOOK_GRAPH_URL}/${connection.externalAccountId}/feed`);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        message,
        access_token: connection.accessToken,
        published: "false",
        scheduled_publish_time: String(scheduledUnix),
      }),
    });

    const payload = (await response.json()) as { id?: string; error?: { message?: string } };
    if (!response.ok || !payload.id) {
      return fail(post_id, "Schedule", payload.error?.message ?? `Facebook API error (${response.status}).`);
    }

    await upsertPost({ post_id, scheduled_at, status: "scheduled" });
    await serverLog(
      post_id,
      "Schedule",
      `Facebook scheduled for ${scheduled_at}. ID: ${payload.id}`,
      "success"
    );
    return { success: true, schedule_id: payload.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Facebook API unreachable.";
    return fail(post_id, "Schedule", message);
  }
}

export async function facebookRetry(post_id: string): Promise<FacebookPublishResult> {
  if (!(await hasPublisherSession())) {
    return { success: false, error: "Unauthorized. Sign in before publishing." };
  }
  const row = await getPostContent(post_id);
  const content = row?.content as GeneratedContent | null;
  return facebookPublish(post_id, content);
}

function buildPostText(content: GeneratedContent): string {
  const primary = content.primary;
  return [primary.headline, primary.subheadline, primary.long_form, primary.hashtags, primary.disclaimer]
    .filter(Boolean)
    .join("\n\n");
}

async function fail(post_id: string, action: string, error: string): Promise<FacebookPublishResult> {
  await saveStatus(post_id, "failed");
  await serverLog(post_id, action, error, "error");
  return { success: false, error };
}

async function saveStatus(post_id: string, status: "scheduled" | "published" | "failed") {
  await upsertPost({ post_id, status });
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
      agent: "Facebook Publisher",
    } as never);
  } catch {
    // fire-and-forget
  }
}
