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

const postsKey = "ai-content-publisher:local-posts";
const contentKey = "ai-content-publisher:local-post-content";
const imagesKey = "ai-content-publisher:local-post-images";
const auditKey = "ai-content-publisher:local-audit-logs";

function readMap<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, T>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap<T>(key: string, value: Record<string, T>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

export function localGetPost(postId: string): AcpPost | null {
  return readMap<AcpPost>(postsKey)[postId] ?? null;
}

export function localUpsertPost(data: AcpPostInsert): void {
  const posts = readMap<AcpPost>(postsKey);
  const existing = posts[data.post_id];
  const next: AcpPost = {
    post_id: data.post_id,
    status: (data.status as AcpPostStatus) ?? existing?.status ?? "draft",
    brand: data.brand ?? existing?.brand ?? null,
    platform: data.platform ?? existing?.platform ?? null,
    primary_lang: data.primary_lang ?? existing?.primary_lang ?? "Thai",
    secondary_lang: data.secondary_lang ?? existing?.secondary_lang ?? "English",
    scheduled_at: data.scheduled_at ?? existing?.scheduled_at ?? null,
    metadata: { ...(existing?.metadata ?? {}), ...(data.metadata ?? {}) },
    user_id: existing?.user_id ?? null,
    created_at: existing?.created_at ?? nowIso(),
    updated_at: nowIso(),
  };
  posts[data.post_id] = next;
  writeMap(postsKey, posts);
}

export function localListAllPosts(): AcpPost[] {
  return Object.values(readMap<AcpPost>(postsKey)).sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
}

export function localListPostsByStatus(
  status: AcpPostStatus | AcpPostStatus[]
): AcpPost[] {
  const statuses = new Set(Array.isArray(status) ? status : [status]);
  return localListAllPosts().filter((post) => statuses.has(post.status));
}

export function localGetPostContent(postId: string): AcpPostContent | null {
  return readMap<AcpPostContent>(contentKey)[postId] ?? null;
}

export function localUpsertPostContent(data: AcpPostContentInsert): void {
  const rows = readMap<AcpPostContent>(contentKey);
  const existing = rows[data.post_id];
  const next: AcpPostContent = {
    id: existing?.id ?? crypto.randomUUID(),
    post_id: data.post_id,
    brief: data.brief ?? existing?.brief ?? null,
    rules: data.rules ?? existing?.rules ?? null,
    content: data.content ?? existing?.content ?? null,
    image_prompts: data.image_prompts ?? existing?.image_prompts ?? null,
    generated_at: existing?.generated_at ?? nowIso(),
    updated_at: nowIso(),
  };
  rows[data.post_id] = next;
  writeMap(contentKey, rows);
}

export function localListAllPostContent(): Pick<AcpPostContent, "post_id" | "content">[] {
  return Object.values(readMap<AcpPostContent>(contentKey)).map((row) => ({
    post_id: row.post_id,
    content: row.content,
  }));
}

export function localGetPostImages(postId: string): AcpPostImage[] {
  return readMap<AcpPostImage[]>(imagesKey)[postId] ?? [];
}

export function localInsertPostImage(data: AcpPostImageInsert): void {
  const all = readMap<AcpPostImage[]>(imagesKey);
  const current = all[data.post_id] ?? [];
  const next: AcpPostImage = {
    id: crypto.randomUUID(),
    post_id: data.post_id,
    type: data.type,
    version: data.version ?? current.length + 1,
    visual_concept_id: data.visual_concept_id ?? null,
    image_url: data.image_url,
    is_placeholder: data.is_placeholder ?? false,
    prompt: data.prompt ?? null,
    generated_at: nowIso(),
  };
  all[data.post_id] = [...current, next];
  writeMap(imagesKey, all);
}

export function localInsertAuditLog(data: AcpAuditLogInsert): void {
  const logs = readArray<AcpAuditLog>(auditKey);
  logs.unshift({
    id: crypto.randomUUID(),
    type: data.type,
    action: data.action,
    post_id: data.post_id,
    details: data.details ?? null,
    status: data.status,
    agent: data.agent ?? null,
    created_at: nowIso(),
  });
  writeArray(auditKey, logs);
}

export function localGetAuditLogs(filters: LogFilters = {}): AcpAuditLog[] {
  let rows = readArray<AcpAuditLog>(auditKey);
  if (filters.type && filters.type !== "all") {
    rows = rows.filter((row) => row.type === filters.type);
  }
  if (filters.postId?.trim()) {
    const needle = filters.postId.trim().toLowerCase();
    rows = rows.filter((row) => row.post_id.toLowerCase().includes(needle));
  }
  if (filters.agent && filters.agent !== "all") {
    rows = rows.filter((row) => row.agent === filters.agent);
  }
  const since = dateSince(filters.dateRange ?? "all");
  if (since) {
    rows = rows.filter((row) => new Date(row.created_at) >= since);
  }
  rows.sort((a, b) => {
    const cmp = a.created_at.localeCompare(b.created_at);
    return filters.sort === "asc" ? cmp : -cmp;
  });
  return rows;
}

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
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
