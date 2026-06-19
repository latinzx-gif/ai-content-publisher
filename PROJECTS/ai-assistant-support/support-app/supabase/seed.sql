-- =============================================================================
-- Seed data for AI Assistant Support
-- Inserts default clients (idempotent via ON CONFLICT)
-- =============================================================================

INSERT INTO aas_clients (name, slug, linear_project_id, active)
VALUES
  ('ChineseVibe', 'chinesevibe', NULL, true),
  ('CNV WorkHub', 'cnv-workhub', NULL, true)
ON CONFLICT (slug) DO NOTHING;
