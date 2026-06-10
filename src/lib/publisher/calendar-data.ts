import type { AcpPost } from "@/lib/publisher/supabase/types";
import { listAllPostContent, listAllPosts, listScheduledPosts } from "@/lib/publisher/db";
import type { ReviewStatus } from "./review-actions";

export type PostSummary = {
  post_id: string;
  headline: string;
  platform: string;
  brand: string;
  status: ReviewStatus;
  scheduled_at: string;
  warnings: string[];
};

export type CalendarFilters = {
  status?: ReviewStatus | "all";
  platform?: string;
  brand?: string;
};

export async function getScheduledPosts(filters: CalendarFilters = {}): Promise<PostSummary[]> {
  const all = await getAllPostSummaries();
  return all
    .filter((post) =>
      ["approved", "scheduled", "published", "failed"].includes(post.status)
    )
    .filter(
      (post) =>
        !filters.status || filters.status === "all" || post.status === filters.status
    )
    .filter(
      (post) =>
        !filters.platform || filters.platform === "all" || post.platform === filters.platform
    )
    .filter(
      (post) =>
        !filters.brand || filters.brand === "all" || post.brand === filters.brand
    )
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
}

export async function getAllPostSummaries(): Promise<PostSummary[]> {
  const [posts, contentRows] = await Promise.all([listAllPosts(), listAllPostContent()]);

  const contentMap = new Map(contentRows.map((row) => [row.post_id, row.content]));

  return posts.map((post) => mapToSummary(post, contentMap.get(post.post_id) ?? null));
}

export async function getPostWarnings(post_id: string): Promise<string[]> {
  // Warnings are derived from acp_posts.metadata.qc (written by QualityChecker)
  // Image check is skipped here to avoid per-post queries in list views
  const { getPost } = await import("@/lib/publisher/db");
  const post = await getPost(post_id);
  return extractWarnings(post);
}

// ----- helpers -----

function mapToSummary(
  post: AcpPost,
  content: Record<string, unknown> | null
): PostSummary {
  const contentRecord = content as null | {
    primary?: { headline?: string };
    generated_at?: string;
  };
  const headline =
    contentRecord?.primary?.headline || post.post_id;

  return {
    post_id: post.post_id,
    headline,
    platform: post.platform || "Facebook",
    brand: post.brand || "Default Brand",
    status: post.status as ReviewStatus,
    scheduled_at: post.scheduled_at || contentRecord?.generated_at || "",
    warnings: extractWarnings(post),
  };
}

function extractWarnings(post: AcpPost | null): string[] {
  if (!post) return [];
  const qc = (post.metadata?.qc as { results?: { status: string; check: string }[] }) ?? null;
  return (qc?.results ?? [])
    .filter((r) => r.status === "warn" || r.status === "fail")
    .map((r) => r.check);
}

// Re-export for PublishQueue which uses getAllPostSummaries directly
export { listScheduledPosts as listScheduledPostsFromDb };
