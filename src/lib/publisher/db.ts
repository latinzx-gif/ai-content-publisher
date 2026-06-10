// Thin async helpers wrapping the Supabase browser client.
// All functions are client-side only (browser context required).
import { isPublicApiAuthBypassEnabled } from "@/lib/auth-bypass";
import { createClient } from "@/lib/publisher/supabase/client";
import * as localDb from "@/lib/publisher/local-db";
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

function localFallbackEnabled() {
  return isPublicApiAuthBypassEnabled();
}

function localStoreOnly() {
  return localFallbackEnabled();
}

function warnLocalFallback(operation: string, detail: string) {
  console.warn(`[publisher-db] ${operation} fell back to localStorage: ${detail.slice(0, 160)}`);
}

// ----- Posts -----

export async function getPost(postId: string): Promise<AcpPost | null> {
  if (localStoreOnly()) return localDb.localGetPost(postId);

  const db = createClient();
  const { data, error } = await db
    .from("acp_posts")
    .select()
    .eq("post_id", postId)
    .maybeSingle();
  if (!error && data) return data;
  if (error) console.error("db.getPost:", error.message);
  if (localFallbackEnabled()) return localDb.localGetPost(postId);
  return data ?? null;
}

export async function upsertPost(data: AcpPostInsert): Promise<void> {
  if (localStoreOnly()) {
    localDb.localUpsertPost(data);
    return;
  }

  const db = createClient();
  const { error } = await db
    .from("acp_posts")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(data as any, { onConflict: "post_id" });
  if (!error) return;
  console.error("db.upsertPost:", error.message);
  if (localFallbackEnabled()) {
    warnLocalFallback("upsertPost", error.message);
    localDb.localUpsertPost(data);
    return;
  }
  throw error;
}

export async function listAllPosts(): Promise<AcpPost[]> {
  if (localStoreOnly()) return localDb.localListAllPosts();

  const db = createClient();
  const { data, error } = await db
    .from("acp_posts")
    .select()
    .order("created_at", { ascending: false });
  if (!error && data) return data;
  if (error) console.error("db.listAllPosts:", error.message);
  if (localFallbackEnabled()) return localDb.localListAllPosts();
  return data ?? [];
}

export async function listScheduledPosts(): Promise<AcpPost[]> {
  if (localStoreOnly()) {
    return localDb
      .localListPostsByStatus(["approved", "scheduled", "published", "failed"])
      .sort((a, b) => (a.scheduled_at ?? "").localeCompare(b.scheduled_at ?? ""));
  }

  const db = createClient();
  const { data, error } = await db
    .from("acp_posts")
    .select()
    .in("status", ["approved", "scheduled", "published", "failed"] as AcpPostStatus[])
    .order("scheduled_at", { ascending: true, nullsFirst: false });
  if (!error && data) return data;
  if (error) console.error("db.listScheduledPosts:", error.message);
  if (localFallbackEnabled()) {
    return localDb
      .localListPostsByStatus(["approved", "scheduled", "published", "failed"])
      .sort((a, b) => (a.scheduled_at ?? "").localeCompare(b.scheduled_at ?? ""));
  }
  return data ?? [];
}

export async function listPostsByStatus(
  status: AcpPostStatus | AcpPostStatus[]
): Promise<AcpPost[]> {
  if (localStoreOnly()) return localDb.localListPostsByStatus(status);

  const db = createClient();
  const statuses = Array.isArray(status) ? status : [status];
  const { data, error } = await db
    .from("acp_posts")
    .select()
    .in("status", statuses);
  if (!error && data) return data;
  if (error) console.error("db.listPostsByStatus:", error.message);
  if (localFallbackEnabled()) return localDb.localListPostsByStatus(status);
  return data ?? [];
}

// ----- Post Content -----

export async function getPostContent(postId: string): Promise<AcpPostContent | null> {
  if (localStoreOnly()) return localDb.localGetPostContent(postId);

  const db = createClient();
  const { data, error } = await db
    .from("acp_post_content")
    .select()
    .eq("post_id", postId)
    .maybeSingle();
  if (!error && data) return data;
  if (error) console.error("db.getPostContent:", error.message);
  if (localFallbackEnabled()) return localDb.localGetPostContent(postId);
  return data ?? null;
}

export async function listAllPostContent(): Promise<
  Pick<AcpPostContent, "post_id" | "content">[]
> {
  if (localStoreOnly()) return localDb.localListAllPostContent();

  const db = createClient();
  const { data, error } = await db
    .from("acp_post_content")
    .select("post_id, content");
  if (!error && data) return data as Pick<AcpPostContent, "post_id" | "content">[];
  if (error) console.error("db.listAllPostContent:", error.message);
  if (localFallbackEnabled()) return localDb.localListAllPostContent();
  return (data ?? []) as Pick<AcpPostContent, "post_id" | "content">[];
}

export async function upsertPostContent(data: AcpPostContentInsert): Promise<void> {
  if (localStoreOnly()) {
    localDb.localUpsertPostContent(data);
    return;
  }

  const db = createClient();
  const { error } = await db
    .from("acp_post_content")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(data as any, { onConflict: "post_id" });
  if (!error) return;
  console.error("db.upsertPostContent:", error.message);
  if (localFallbackEnabled()) {
    warnLocalFallback("upsertPostContent", error.message);
    localDb.localUpsertPostContent(data);
    return;
  }
  throw error;
}

// ----- Post Images -----

export async function getPostImages(postId: string): Promise<AcpPostImage[]> {
  if (localStoreOnly()) return localDb.localGetPostImages(postId);

  const db = createClient();
  const { data, error } = await db
    .from("acp_post_images")
    .select()
    .eq("post_id", postId)
    .order("generated_at", { ascending: true });
  if (!error && data) return data;
  if (error) console.error("db.getPostImages:", error.message);
  if (localFallbackEnabled()) return localDb.localGetPostImages(postId);
  return data ?? [];
}

export async function insertPostImage(data: AcpPostImageInsert): Promise<void> {
  if (localStoreOnly()) {
    localDb.localInsertPostImage(data);
    return;
  }

  const db = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await db.from("acp_post_images").insert(data as any);
  if (!error) return;
  console.error("db.insertPostImage:", error.message);
  if (localFallbackEnabled()) {
    warnLocalFallback("insertPostImage", error.message);
    localDb.localInsertPostImage(data);
    return;
  }
  throw error;
}

// ----- Audit Logs -----

export async function insertAuditLog(data: AcpAuditLogInsert): Promise<void> {
  if (localStoreOnly()) {
    localDb.localInsertAuditLog(data);
    return;
  }

  const db = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await db.from("acp_audit_logs").insert(data as any);
  if (!error) return;
  if (error) console.error("db.insertAuditLog:", error.message);
  if (localFallbackEnabled()) {
    localDb.localInsertAuditLog(data);
    return;
  }
}

export async function getAuditLogs(filters: LogFilters = {}): Promise<AcpAuditLog[]> {
  if (localStoreOnly()) return localDb.localGetAuditLogs(filters);

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
  if (!error && data?.length) return data;
  if (error) console.error("db.getAuditLogs:", error.message);
  if (localFallbackEnabled()) return localDb.localGetAuditLogs(filters);
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
