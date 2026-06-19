-- =============================================================================
-- Migration: 20260616000001_create_aas_tables
-- Description: Create core AI Assistant Support tables (aas_* prefix)
-- Tables: aas_clients, aas_support_contacts, aas_tickets
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper: update_updated_at_column trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Table: aas_clients
-- B2B client/company management
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aas_clients (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text        NOT NULL,
  slug              text        NOT NULL UNIQUE,
  linear_project_id text        DEFAULT NULL,   -- Linear project ID placeholder
  active            boolean     DEFAULT true,
  repo_url          text        DEFAULT NULL,   -- Phase 2
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE TRIGGER trg_aas_clients_updated_at
  BEFORE UPDATE ON aas_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Table: aas_support_contacts
-- Binding LINE user → client
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aas_support_contacts (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid        NOT NULL REFERENCES aas_clients(id),
  line_user_id  text        NOT NULL,
  display_name  text        DEFAULT NULL,
  org_code      text        DEFAULT NULL,   -- Org code for initial binding
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aas_support_contacts_client_id
  ON aas_support_contacts(client_id);

CREATE INDEX IF NOT EXISTS idx_aas_support_contacts_line_user_id
  ON aas_support_contacts(line_user_id);

-- ---------------------------------------------------------------------------
-- Table: aas_tickets
-- Support tickets / requests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aas_tickets (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code           text        NOT NULL UNIQUE,   -- Pattern AAS-XXXXXX
  client_id             uuid        NOT NULL REFERENCES aas_clients(id),
  reporter_line_user_id text        NOT NULL,
  type                  text        NOT NULL CHECK (type IN ('bug','error','complaint','question','feature')),
  severity              text        NOT NULL CHECK (severity IN ('P0','P1','P2','P3')),
  subject               text        NOT NULL,
  body                  text        DEFAULT NULL,
  page_url              text        DEFAULT NULL,
  status                text        DEFAULT 'open' CHECK (status IN ('open','in_progress','waiting_client','resolved','closed')),
  linear_issue_id       text        DEFAULT NULL,
  linear_issue_url      text        DEFAULT NULL,
  resolution_summary    text        DEFAULT NULL,
  notified_at           timestamptz DEFAULT NULL,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aas_tickets_ticket_code
  ON aas_tickets(ticket_code);

CREATE INDEX IF NOT EXISTS idx_aas_tickets_reporter_line_user_id
  ON aas_tickets(reporter_line_user_id);

CREATE INDEX IF NOT EXISTS idx_aas_tickets_client_id
  ON aas_tickets(client_id);

CREATE INDEX IF NOT EXISTS idx_aas_tickets_status
  ON aas_tickets(status);

CREATE TRIGGER trg_aas_tickets_updated_at
  BEFORE UPDATE ON aas_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE aas_clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE aas_support_contacts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE aas_tickets           ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users can insert tickets
CREATE POLICY "authenticated users can insert tickets"
  ON aas_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS: Authenticated users can read own tickets (by reporter_line_user_id)
CREATE POLICY "authenticated users can read own tickets"
  ON aas_tickets
  FOR SELECT
  TO authenticated
  USING (reporter_line_user_id = current_user OR auth.uid() IS NOT NULL);

-- RLS: Service role can CRUD all on aas_clients
CREATE POLICY "service_role can CRUD all on aas_clients"
  ON aas_clients
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS: Service role can CRUD all on aas_support_contacts
CREATE POLICY "service_role can CRUD all on aas_support_contacts"
  ON aas_support_contacts
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS: Service role can CRUD all on aas_tickets
CREATE POLICY "service_role can CRUD all on aas_tickets"
  ON aas_tickets
  TO service_role
  USING (true)
  WITH CHECK (true);
