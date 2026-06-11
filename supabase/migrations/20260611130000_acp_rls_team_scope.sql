-- P1-SEC-01 (security audit 2026-06-11: C2 + M4 + M5)
-- Replaces every acp_ policy from 20260610000001_acp_rls_auth.sql.
--
-- Why: the old policies all carried `OR user_id IS NULL`. Posts created via
-- the service role (pipeline, mock publish) have user_id = NULL, so ANY
-- authenticated user in the shared auth pool — including self-registered
-- accounts — could read/modify/delete all of them, and could "launder"
-- ownership by setting user_id to NULL or to themselves.
--
-- New model: shared team workspace. Access to acp_ data requires an ACTIVE
-- team membership, checked via the existing SECURITY DEFINER helper
-- public.current_user_role() (NULL for non-members). NULL-owner rows stay
-- valid as workspace-owned rows; no backfill needed.
--
-- M4 (partial): acp_audit_logs INSERT tightened from any-authenticated to
-- active team members. Full server-only logging is deferred to the M2 round —
-- client-side review actions still write logs directly today, and dropping
-- the policy entirely would silently lose the approve/reject audit trail.
--
-- M5: idempotent — DROP POLICY IF EXISTS before every CREATE POLICY; safe to
-- re-run.

-- acp_posts -----------------------------------------------------------------

DROP POLICY IF EXISTS "acp_posts_select" ON public.acp_posts;
CREATE POLICY "acp_posts_select" ON public.acp_posts
  FOR SELECT TO authenticated
  USING (public.current_user_role() IS NOT NULL);

DROP POLICY IF EXISTS "acp_posts_insert" ON public.acp_posts;
CREATE POLICY "acp_posts_insert" ON public.acp_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() IS NOT NULL
    AND (user_id = auth.uid() OR user_id IS NULL)
  );

DROP POLICY IF EXISTS "acp_posts_update" ON public.acp_posts;
CREATE POLICY "acp_posts_update" ON public.acp_posts
  FOR UPDATE TO authenticated
  USING (public.current_user_role() IS NOT NULL)
  WITH CHECK (
    public.current_user_role() IS NOT NULL
    AND (user_id = auth.uid() OR user_id IS NULL)
  );

DROP POLICY IF EXISTS "acp_posts_delete" ON public.acp_posts;
CREATE POLICY "acp_posts_delete" ON public.acp_posts
  FOR DELETE TO authenticated
  USING (public.current_user_role() IS NOT NULL);

-- acp_post_content ------------------------------------------------------------

DROP POLICY IF EXISTS "acp_post_content_all" ON public.acp_post_content;
CREATE POLICY "acp_post_content_all" ON public.acp_post_content
  FOR ALL TO authenticated
  USING (public.current_user_role() IS NOT NULL)
  WITH CHECK (public.current_user_role() IS NOT NULL);

-- acp_post_images -------------------------------------------------------------

DROP POLICY IF EXISTS "acp_post_images_all" ON public.acp_post_images;
CREATE POLICY "acp_post_images_all" ON public.acp_post_images
  FOR ALL TO authenticated
  USING (public.current_user_role() IS NOT NULL)
  WITH CHECK (public.current_user_role() IS NOT NULL);

-- acp_audit_logs --------------------------------------------------------------

DROP POLICY IF EXISTS "acp_audit_logs_select" ON public.acp_audit_logs;
CREATE POLICY "acp_audit_logs_select" ON public.acp_audit_logs
  FOR SELECT TO authenticated
  USING (public.current_user_role() IS NOT NULL);

DROP POLICY IF EXISTS "acp_audit_logs_insert" ON public.acp_audit_logs;
CREATE POLICY "acp_audit_logs_insert" ON public.acp_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IS NOT NULL);
