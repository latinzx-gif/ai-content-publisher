import assert from "node:assert/strict";
import test from "node:test";

import type { Database } from "@/lib/database.types";
import {
  INCIDENT_SEVERITIES,
  INCIDENT_SOURCES,
  INCIDENT_STATUSES,
  type IncidentInput,
  type ResolvedIncidentInput,
} from "./types";

test("incident shared constants cover the planned source/severity/status enums", () => {
  assert.deepEqual(INCIDENT_SOURCES, ["monitor", "webhook", "manual", "line"]);
  assert.deepEqual(INCIDENT_SEVERITIES, ["P0", "P1", "P2", "P3"]);
  assert.deepEqual(INCIDENT_STATUSES, ["open", "investigating", "resolved", "closed"]);
});

test("IncidentInput and Database aas_incidents insert shape compile with the expected fields", () => {
  const metadata = { status: 500, region: "ap-southeast-1" };

  const input: IncidentInput = {
    clientId: "client-1",
    clientSlug: "chinesevibe",
    clientName: "ChineseVibe",
    source: "monitor",
    sourceRef: "cron:queue-monitor",
    service: "cron",
    severity: "P1",
    subject: "Queue monitor failed",
    body: "Healthcheck returned 500",
    fingerprint: "queue-monitor:p1",
    metadata,
  };

  const resolved: ResolvedIncidentInput = {
    ...input,
    fingerprint: input.fingerprint ?? "queue-monitor:p1",
  };

  const insert: Database["public"]["Tables"]["aas_incidents"]["Insert"] = {
    client_id: "client-1",
    source: resolved.source,
    source_ref: resolved.sourceRef,
    service: resolved.service,
    severity: resolved.severity,
    subject: resolved.subject,
    body: resolved.body,
    fingerprint: resolved.fingerprint,
    last_payload: metadata,
  };

  assert.equal(insert.source, "monitor");
  assert.equal(insert.service, "cron");
  assert.equal(insert.subject, "Queue monitor failed");
});
