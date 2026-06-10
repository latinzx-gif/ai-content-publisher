// Server-side only.
// Persists ephemeral DALL-E 3 image URLs (~1-2h lifetime) into Supabase
// Storage (bucket "acp-images") so posts keep a durable image reference.
// Pairs with supabase/migrations/20260611100000_acp_images_storage_bucket.sql.

import { createServiceClient } from "@/lib/publisher/supabase/server";

const BUCKET = "acp-images";

// Downloads the image at sourceUrl and uploads it to Supabase Storage at
// `${post_id}/${type}-v${version}.png`. Returns the public URL on success.
// Never throws — all failures return null so callers can fall back to the
// ephemeral source URL.
export async function persistImageToStorage(
  sourceUrl: string,
  post_id: string,
  type: "primary" | "secondary",
  version: number
): Promise<string | null> {
  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) {
      console.error(`Image fetch failed (${res.status}) for post ${post_id}`);
      return null;
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/png";
    const path = `${post_id}/${type}-v${version}.png`;

    const db = createServiceClient();
    const { error } = await db.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType, upsert: true });

    if (error) {
      console.error(`Image upload failed for ${path}: ${error.message}`);
      return null;
    }

    return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`persistImageToStorage failed for post ${post_id}: ${message}`);
    return null;
  }
}
