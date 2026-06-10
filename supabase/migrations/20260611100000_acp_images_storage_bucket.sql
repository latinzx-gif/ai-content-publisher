-- acp-images storage bucket for durable generated-image storage.
-- DALL-E 3 returns short-lived URLs (~1-2h); generated images are copied
-- into this bucket so posts keep a permanent public image reference.
-- Pairs with src/lib/publisher/image-storage.ts.

-- 1. Bucket (idempotent)
insert into storage.buckets (id, name, public)
values ('acp-images', 'acp-images', true)
on conflict (id) do nothing;

-- 2. Public read policy (idempotent)
-- Anyone may read objects in the acp-images bucket (public image URLs).
DROP POLICY IF EXISTS "acp_images_public_read" ON storage.objects;
CREATE POLICY "acp_images_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'acp-images');

-- No insert/update/delete policies: writes go through the service-role
-- client (src/lib/publisher/image-storage.ts), which bypasses RLS.
