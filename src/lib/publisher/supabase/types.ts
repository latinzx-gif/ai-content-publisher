// INT-01: hand-written types mirroring the acp_ schema.
// Replace with generated types (supabase gen types) after INT-01 migrations are applied.

export type AcpPostStatus =
  | "draft"
  | "revision_requested"
  | "approved"
  | "rejected"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed";

export type AcpLogType = "generation" | "image" | "publish" | "error";
export type AcpLogStatus = "success" | "warn" | "error";

export type AcpPost = {
  post_id: string;
  user_id: string | null;
  status: AcpPostStatus;
  brand: string | null;
  platform: string | null;
  primary_lang: string;
  secondary_lang: string;
  scheduled_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AcpPostContent = {
  id: string;
  post_id: string;
  brief: Record<string, unknown> | null;
  rules: Record<string, unknown> | null;
  content: Record<string, unknown> | null;
  image_prompts: Record<string, unknown> | null;
  generated_at: string;
  updated_at: string;
};

export type AcpPostImage = {
  id: string;
  post_id: string;
  type: "primary" | "secondary";
  version: number;
  visual_concept_id: string | null;
  image_url: string;
  is_placeholder: boolean;
  prompt: Record<string, unknown> | null;
  generated_at: string;
};

export type AcpAuditLog = {
  id: string;
  type: AcpLogType;
  action: string;
  post_id: string;
  details: string | null;
  status: AcpLogStatus;
  agent: string | null;
  created_at: string;
};

// Insert shapes (all non-pk fields optional — DB has defaults for most)
export type AcpPostInsert = {
  post_id: string;
  user_id?: string | null;
  status?: AcpPostStatus;
  brand?: string | null;
  platform?: string | null;
  primary_lang?: string;
  secondary_lang?: string;
  scheduled_at?: string | null;
  metadata?: Record<string, unknown>;
};

export type AcpPostContentInsert = {
  post_id: string;
  brief?: Record<string, unknown> | null;
  rules?: Record<string, unknown> | null;
  content?: Record<string, unknown> | null;
  image_prompts?: Record<string, unknown> | null;
};

export type AcpPostImageInsert = Omit<AcpPostImage, "id" | "generated_at"> &
  Partial<Pick<AcpPostImage, "version" | "is_placeholder">>;

export type AcpAuditLogInsert = Omit<AcpAuditLog, "id" | "created_at">;

// Database shape for supabase-js generics
export type Database = {
  public: {
    Tables: {
      acp_posts: {
        Row: AcpPost;
        Insert: AcpPostInsert;
        Update: Partial<AcpPostInsert>;
      };
      acp_post_content: {
        Row: AcpPostContent;
        Insert: AcpPostContentInsert;
        Update: Partial<AcpPostContentInsert>;
      };
      acp_post_images: {
        Row: AcpPostImage;
        Insert: AcpPostImageInsert;
        Update: Partial<AcpPostImageInsert>;
      };
      acp_audit_logs: {
        Row: AcpAuditLog;
        Insert: AcpAuditLogInsert;
        Update: never;
      };
    };
  };
};
