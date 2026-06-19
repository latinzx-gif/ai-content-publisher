-- =============================================================================
-- Migration: 20260616211000_create_aas_incidents
-- Description: Create operational incidents table for monitor/webhook/manual inputs
-- Table: aas_incidents
-- =============================================================================

CREATE TABLE IF NOT EXISTS aas_incidents (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid        DEFAULT NULL REFERENCES aas_clients(id),
  source           text        NOT NULL CHECK (source IN ('monitor','webhook','manual','line')),
  source_ref       text        DEFAULT NULL,
  service          text        NOT NULL,
  severity         text        NOT NULL CHECK (severity IN ('P0','P1','P2','P3')),
  status           text        NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','closed')),
  subject          text        NOT NULL,
  body             text        DEFAULT NULL,
  fingerprint      text        NOT NULL,
  occurrence_count integer     NOT NULL DEFAULT 1 CHECK (occurrence_count >= 1),
  first_seen_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at     timestamptz NOT NULL DEFAULT now(),
  last_payload     jsonb       DEFAULT NULL,
  linear_issue_id  text        DEFAULT NULL,
  linear_issue_url text        DEFAULT NULL,
  ticket_id        uuid        DEFAULT NULL REFERENCES aas_tickets(id),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aas_incidents_client_id
  ON aas_incidents(client_id);

CREATE INDEX IF NOT EXISTS idx_aas_incidents_status
  ON aas_incidents(status);

CREATE INDEX IF NOT EXISTS idx_aas_incidents_fingerprint
  ON aas_incidents(fingerprint);

CREATE INDEX IF NOT EXISTS idx_aas_incidents_last_seen_at
  ON aas_incidents(last_seen_at);

DROP TRIGGER IF EXISTS trg_aas_incidents_updated_at ON aas_incidents;
CREATE TRIGGER trg_aas_incidents_updated_at
  BEFORE UPDATE ON aas_incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE aas_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role can CRUD all on aas_incidents" ON aas_incidents;
CREATE POLICY "service_role can CRUD all on aas_incidents"
  ON aas_incidents
  TO service_role
  USING (true)
  WITH CHECK (true);
