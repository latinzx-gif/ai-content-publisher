import assert from "node:assert/strict";
import test from "node:test";

import { parseIncidentInput } from "./route";

test("parseIncidentInput parses a valid incident payload", () => {
  const result = parseIncidentInput({
    source: "monitor",
    service: "api-gateway",
    severity: "P1",
    subject: "High latency",
    clientId: "client-1",
    clientSlug: "chinesevibe",
    clientName: "ChineseVibe",
    sourceRef: "evt-123",
    body: "Error spike from region us-east-1",
    fingerprint: "fp-1",
    metadata: { region: "us-east-1" },
  });

  assert.equal(result.source, "monitor");
  assert.equal(result.service, "api-gateway");
  assert.equal(result.severity, "P1");
  assert.equal(result.subject, "High latency");
  assert.equal(result.clientId, "client-1");
  assert.equal(result.clientSlug, "chinesevibe");
  assert.equal(result.clientName, "ChineseVibe");
  assert.equal(result.fingerprint, "fp-1");
  assert.deepEqual(result.metadata, { region: "us-east-1" });
});

test("parseIncidentInput trims and normalizes empty optional strings to null", () => {
  const result = parseIncidentInput({
    source: " webhook ",
    service: " worker ",
    severity: " p2 ",
    subject: "  Queue stuck  ",
    clientId: "   ",
    clientSlug: null,
    clientName: "",
    body: "   ",
    sourceRef: "\n",
    fingerprint: "\t",
  });

  assert.equal(result.source, "webhook");
  assert.equal(result.service, "worker");
  assert.equal(result.severity, "P2");
  assert.equal(result.subject, "Queue stuck");
  assert.equal(result.clientId, null);
  assert.equal(result.clientSlug, null);
  assert.equal(result.clientName, null);
  assert.equal(result.body, null);
  assert.equal(result.sourceRef, null);
  assert.equal(result.fingerprint, null);
  assert.equal(result.metadata, undefined);
});

test("parseIncidentInput requires valid source", () => {
  assert.throws(
    () =>
      parseIncidentInput({
        source: "unknown",
        service: "api",
        severity: "P1",
        subject: "test",
      }),
    /Invalid or missing source/,
  );
});

test("parseIncidentInput requires valid severity", () => {
  assert.throws(
    () =>
      parseIncidentInput({
        source: "monitor",
        service: "api",
        severity: "P9",
        subject: "test",
      }),
    /Invalid or missing severity/,
  );
});

test("parseIncidentInput rejects non-string optional fields", () => {
  assert.throws(
    () =>
      parseIncidentInput({
        source: "monitor",
        service: "api",
        severity: "P1",
        subject: "test",
        clientName: 123,
      }),
    /clientName must be a string when provided/,
  );

  assert.throws(
    () =>
      parseIncidentInput({
        source: "monitor",
        service: "api",
        severity: "P1",
        subject: "test",
        metadata: [],
      }),
    /metadata must be a JSON object when provided/,
  );
});

test("parseIncidentInput accepts null metadata", () => {
  const result = parseIncidentInput({
    source: "line",
    service: "liff",
    severity: "P3",
    subject: "line mention",
    metadata: null,
  });

  assert.equal(result.metadata, null);
});

test("POST /api/internal/incidents rejects calls when secret is missing", async () => {
  delete process.env.AAS_INCIDENT_INGEST_SECRET;

  const req = new Request("https://example.com/api/internal/incidents", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const { POST } = await import("./route");
  const response = await POST(req);

  assert.equal(response.status, 500);

  const body = await response.json();
  assert.equal(body.error.includes("AAS_INCIDENT_INGEST_SECRET"), true);
});

test("POST /api/internal/incidents rejects invalid secret", async () => {
  process.env.AAS_INCIDENT_INGEST_SECRET = "good-secret";

  const req = new Request("https://example.com/api/internal/incidents", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-aas-incident-secret": "bad-secret",
    },
    body: JSON.stringify({}),
  });

  const { POST } = await import("./route");
  const response = await POST(req);

  assert.equal(response.status, 401);

  const body = await response.json();
  assert.equal(body.error, "Unauthorized");
});

test("POST /api/internal/incidents validates request body", async () => {
  process.env.AAS_INCIDENT_INGEST_SECRET = "good-secret";

  const req = new Request("https://example.com/api/internal/incidents", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-aas-incident-secret": "good-secret",
    },
    body: JSON.stringify({
      source: "monitor",
      service: "api",
      severity: "P9",
      subject: "oops",
    }),
  });

  const { POST } = await import("./route");
  const response = await POST(req);

  assert.equal(response.status, 400);

  const body = await response.json();
  assert.equal(body.error, "Invalid or missing severity");
});
