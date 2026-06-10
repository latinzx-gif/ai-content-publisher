// Thin async helpers wrapping the Supabase browser client.
// All functions are client-side only (browser context required).
import { createClient } from "@/lib/publisher/supabase/client";
import type {
  AcpAuditLog,
  AcpAuditLogInsert,
  AcpPost,
  AcpPostContent,
  AcpPostContentInsert,
  AcpPostImage,
  AcpPostImageInsert,
  AcpPostInsert,
  AcpPostStatus,
} from "@/lib/publisher/supabase/types";
import type { LogDateRange, LogFilters } from "@/lib/publisher/log-system";

// ----- Posts -----

export async function getPost(postId: string): Promise<AcpPost | null> {
  const db = createClient();
  const { data, error } = await db
    .from("acp_posts")
    .select()
    .eq("post_id", postId)
    .maybeSingle();
  if (error) console.error("db.getPost:", error.message);
  return data ?? null;
}

export async function upsertPost(data: AcpPostInsert): Promise<void> {
  const db = createClient();
  const { error } = await db
    .from("acp_posts")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(data as any, { onConflict: "post_id" });
  if (error) {
    console.error("db.upsertPost:", error.message);
    throw error;
  }
}

export async function listAllPosts(): Promise<AcpPost[]> {
  const db = createClient();
  const { data, error } = await db
    .from("acp_posts")
    .select()
    .order("created_at", { ascending: false });
  if (error) console.error("db.listAllPosts:", error.message);
  return data ?? [];
}

export async function listScheduledPosts(): Promise<AcpPost[]> {
  const db = createClient();
  const { data, error } = await db
    .from("acp_posts")
    .select()
    .in("status", ["approved", "scheduled", "published", "failed"] as AcpPostStatus[])
    .order("scheduled_at", { ascending: true, nullsFirst: false });
  if (error) console.error("db.listScheduledPosts:", error.message);
  return data ?? [];
}

export async function listPostsByStatus(
  status: AcpPostStatus | AcpPostStatus[]
): Promise<AcpPost[]> {
  const db = createClient();
  const statuses = Array.isArray(status) ? status : [status];
  const { data, error } = await db
    .from("acp_posts")
    .select()
    .in("status", statuses);
  if (error) console.error("db.listPostsByStatus:", error.message);
  return data ?? [];
}

// ----- Post Content -----

export async function getPostContent(postId: string): Promise<AcpPostContent | null> {
  const db = createClient();
  const { data, error } = await db
    .from("acp_post_content")
    .select()
    .eq("post_id", postId)
    .maybeSingle();
  if (error) console.error("db.getPostContent:", error.message);
  return data ?? null;
}

export async function listAllPostContent(): Promise<
  Pick<AcpPostContent, "post_id" | "content">[]
> {
  const db = createClient();
  const { data, error } = await db
    .from("acp_post_content")
    .select("post_id, content");
  if (error) console.error("db.listAllPostContent:", error.message);
  return (data as Pick<AcpPostContent, "post_id" | "content">[]) ?? [];
}

export async function upsertPostContent(data: AcpPostContentInsert): Promise<void> {
  const db = createClient();
  const { error } = await db
    .from("acp_post_content")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(data as any, { onConflict: "post_id" });
  if (error) {
    console.error("db.upsertPostContent:", error.message);
    throw error;
  }
}

// ----- Post Images -----

export async function getPostImages(postId: string): Promise<AcpPostImage[]> {
  const db = createClient();
  const { data, error } = await db
    .from("acp_post_images")
    .select()
    .eq("post_id", postId)
    .order("generated_at", { ascending: true });
  if (error) console.error("db.getPostImages:", error.message);
  return data ?? [];
}

export async function insertPostImage(data: AcpPostImageInsert): Promise<void> {
  const db = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await db.from("acp_post_images").insert(data as any);
  if (error) {
    console.error("db.insertPostImage:", error.message);
    throw error;
  }
}

// ----- Audit Logs -----

export async function insertAuditLog(data: AcpAuditLogInsert): Promise<void> {
  const db = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await db.from("acp_audit_logs").insert(data as any);
  if (error) console.error("db.insertAuditLog:", error.message);
}

export async function getAuditLogs(filters: LogFilters = {}): Promise<AcpAuditLog[]> {
  const db = createClient();
  let q = db.from("acp_audit_logs").select();

  if (filters.type && filters.type !== "all") {
    q = q.eq("type", filters.type);
  }
  if (filters.postId?.trim()) {
    q = q.ilike("post_id", `%${filters.postId.trim()}%`);
  }
  if (filters.agent && filters.agent !== "all") {
    q = q.eq("agent", filters.agent);
  }

  const since = dateSince(filters.dateRange ?? "all");
  if (since) q = q.gte("created_at", since.toISOString());

  q = q.order("created_at", { ascending: filters.sort === "asc" });

  const { data, error } = await q;
  if (error) console.error("db.getAuditLogs:", error.message);
  return data ?? [];
}

function dateSince(dateRange: LogDateRange): Date | null {
  const now = new Date();
  if (dateRange === "all") return null;
  if (dateRange === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const days = dateRange === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}
