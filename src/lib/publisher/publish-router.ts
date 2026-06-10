"use server";

import {
  bufferPublish,
  bufferRetry,
  bufferSchedule,
  type BufferResult,
} from "@/lib/publisher/buffer-publisher";
import {
  facebookPublish,
  facebookRetry,
  facebookSchedule,
  type FacebookPublishResult,
} from "@/lib/publisher/facebook-publisher";
import type { GeneratedContent } from "@/lib/publisher/content-generator";
import { getPost } from "@/lib/publisher/db";

export type PublishActionResult = BufferResult | FacebookPublishResult;

const PUBLISHABLE_STATUSES = ["approved", "scheduled", "failed"] as const;

function isFacebookPlatform(platform: string | null | undefined) {
  return (platform ?? "").toLowerCase().includes("facebook");
}

async function checkPublishable(post_id: string): Promise<PublishActionResult | null> {
  const post = await getPost(post_id);
  if (!post) {
    return { success: false, error: "Post not found. Save and approve the post before publishing." };
  }
  if (!(PUBLISHABLE_STATUSES as readonly string[]).includes(post.status)) {
    return { success: false, error: `Post must be approved before publishing. Current status: ${post.status}.` };
  }
  return null;
}

export async function publishPost(
  post_id: string,
  content: GeneratedContent | null,
  platform: string | null | undefined
): Promise<PublishActionResult> {
  const blocked = await checkPublishable(post_id);
  if (blocked) return blocked;
  if (isFacebookPlatform(platform)) {
    return facebookPublish(post_id, content);
  }
  return bufferPublish(post_id, content);
}

export async function schedulePost(
  post_id: string,
  content: GeneratedContent | null,
  scheduled_at: string,
  platform: string | null | undefined
): Promise<PublishActionResult> {
  const blocked = await checkPublishable(post_id);
  if (blocked) return blocked;
  if (isFacebookPlatform(platform)) {
    return facebookSchedule(post_id, content, scheduled_at);
  }
  return bufferSchedule(post_id, content, scheduled_at);
}

export async function retryPost(
  post_id: string,
  platform: string | null | undefined
): Promise<PublishActionResult> {
  const blocked = await checkPublishable(post_id);
  if (blocked) return blocked;
  if (isFacebookPlatform(platform)) {
    return facebookRetry(post_id);
  }
  return bufferRetry(post_id);
}
