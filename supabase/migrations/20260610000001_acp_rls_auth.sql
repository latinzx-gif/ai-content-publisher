-- INT-06: RLS + user_id for acp_posts

-- 1. user_id column
ALTER TABLE public.acp_posts
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.acp_posts
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. Enable RLS
ALTER TABLE public.acp_posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acp_post_content  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acp_post_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acp_audit_logs    ENABLE ROW LEVEL SECURITY;

-- 3. acp_posts policies
CREATE POLICY "acp_posts_select" ON public.acp_posts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "acp_posts_insert" ON public.acp_posts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "acp_posts_update" ON public.acp_posts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "acp_posts_delete" ON public.acp_posts
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- 4. acp_post_content policies
CREATE POLICY "acp_post_content_all" ON public.acp_post_content
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.acp_posts p
      WHERE p.post_id = acp_post_content.post_id
        AND (p.user_id = auth.uid() OR p.user_id IS NULL)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.acp_posts p
      WHERE p.post_id = acp_post_content.post_id
        AND (p.user_id = auth.uid() OR p.user_id IS NULL)
    )
  );

-- 5. acp_post_images policies
CREATE POLICY "acp_post_images_all" ON public.acp_post_images
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.acp_posts p
      WHERE p.post_id = acp_post_images.post_id
        AND (p.user_id = auth.uid() OR p.user_id IS NULL)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.acp_posts p
      WHERE p.post_id = acp_post_images.post_id
        AND (p.user_id = auth.uid() OR p.user_id IS NULL)
    )
  );

-- 6. acp_audit_logs policies
CREATE POLICY "acp_audit_logs_select" ON public.acp_audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.acp_posts p
      WHERE p.post_id = acp_audit_logs.post_id
        AND (p.user_id = auth.uid() OR p.user_id IS NULL)
    )
  );

CREATE POLICY "acp_audit_logs_insert" ON public.acp_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
