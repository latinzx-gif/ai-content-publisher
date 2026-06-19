import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTicketLinearIssue,
  buildIncidentLinearIssue,
} from "./linear";

test("buildTicketLinearIssue formats the existing customer ticket Linear payload", () => {
  const result = buildTicketLinearIssue({
    ticketCode: "AAS-123456",
    clientSlug: "chinesevibe",
    clientName: "ChineseVibe",
    reporterLineUserId: "U1234567890",
    type: "bug",
    severity: "P1",
    subject: "Login page crashes",
    body: "Steps to reproduce go here",
    pageUrl: "https://example.com/login",
  });

  assert.deepEqual(result, {
    title: "[AAS][chinesevibe] P1 · bug · Login page crashes",
    description: [
      "**Ticket:** AAS-123456",
      "**Client:** ChineseVibe",
      "**Reporter:** U1234567890",
      "**Type:** bug",
      "**Severity:** P1",
      "**Subject:** Login page crashes",
      "",
      "**Description:**",
      "Steps to reproduce go here",
      "",
      "**URL:** https://example.com/login",
      "",
      "---",
      "*Internal — LINE User ID: U1234567890*",
    ].join("\n"),
    labels: ["client:chinesevibe", "type:bug", "severity:P1"],
  });
});

test("buildTicketLinearIssue keeps fallback text for optional description and URL", () => {
  const result = buildTicketLinearIssue({
    ticketCode: "AAS-654321",
    clientSlug: "cnv-workhub",
    clientName: "CNV WorkHub",
    reporterLineUserId: "U0987654321",
    type: "question",
    severity: "P3",
    subject: "Need help",
    body: null,
    pageUrl: null,
  });

  assert.equal(result.description.includes("(no description)"), true);
  assert.equal(result.description.includes("**URL:** (no URL)"), true);
  assert.deepEqual(result.labels, [
    "client:cnv-workhub",
    "type:question",
    "severity:P3",
  ]);
});

test("buildIncidentLinearIssue formats incident title with client slug", () => {
  const result = buildIncidentLinearIssue({
    clientSlug: "chinesevibe",
    source: "monitor",
    service: "api-gateway",
    severity: "P1",
    subject: "High latency",
    fingerprint: "abc123",
    occurrenceCount: 1,
  });

  assert.equal(
    result.title,
    "[AAS][chinesevibe] P1 · monitor · api-gateway · High latency",
  );
  assert.deepEqual(result.labels, [
    "client:chinesevibe",
    "source:monitor",
    "service:api-gateway",
    "severity:P1",
  ]);
  assert.ok(result.description.includes("abc123"));
});

test("buildIncidentLinearIssue uses system fallback when no client slug", () => {
  const result = buildIncidentLinearIssue({
    source: "webhook",
    service: "worker",
    severity: "P2",
    subject: "Queue stuck",
    fingerprint: "def456",
    occurrenceCount: 3,
  });

  assert.equal(
    result.title,
    "[AAS][system] P2 · webhook · worker · Queue stuck",
  );
  // No client: label when no slug
  const labels = result.labels ?? [];
  assert.equal(labels.some((l) => l.startsWith("client:")), false);
});

test("buildIncidentLinearIssue includes optional fields in description", () => {
  const result = buildIncidentLinearIssue({
    clientSlug: "test",
    source: "manual",
    sourceRef: "SRC-001",
    service: "db",
    severity: "P0",
    subject: "Down",
    body: "Database is unreachable",
    fingerprint: "xyz789",
    occurrenceCount: 5,
    metadata: { region: "us-east-1" },
  });

  assert.ok(result.description.includes("SRC-001"));
  assert.ok(result.description.includes("Database is unreachable"));
  assert.ok(result.description.includes("us-east-1"));
});

test("buildIncidentLinearIssue includes clientName in description when provided", () => {
  const result = buildIncidentLinearIssue({
    clientSlug: "chinesevibe",
    clientName: "ChineseVibe",
    source: "monitor",
    service: "api",
    severity: "P1",
    subject: "Latency",
    fingerprint: "aaa",
    occurrenceCount: 1,
  });

  assert.ok(result.description.includes("ChineseVibe"));
});

test("buildIncidentLinearIssue uses 'system' fallback when clientSlug is empty string", () => {
  const result = buildIncidentLinearIssue({
    clientSlug: "",
    source: "webhook",
    service: "worker",
    severity: "P2",
    subject: "Queue stuck",
    fingerprint: "def456",
    occurrenceCount: 3,
  });

  assert.equal(
    result.title,
    "[AAS][system] P2 · webhook · worker · Queue stuck",
  );
  // No client: label when slug is empty
  const labels = result.labels ?? [];
  assert.equal(labels.some((l) => l.startsWith("client:")), false);
});

test("buildIncidentLinearIssue uses 'system' fallback when clientSlug is whitespace-only", () => {
  const result = buildIncidentLinearIssue({
    clientSlug: "   ",
    source: "webhook",
    service: "worker",
    severity: "P2",
    subject: "Queue stuck",
    fingerprint: "def456",
    occurrenceCount: 3,
  });

  assert.equal(
    result.title,
    "[AAS][system] P2 · webhook · worker · Queue stuck",
  );
  const labels = result.labels ?? [];
  assert.equal(labels.some((l) => l.startsWith("client:")), false);
});

test("buildTicketLinearIssue handles empty clientSlug safely", () => {
  const result = buildTicketLinearIssue({
    ticketCode: "AAS-999",
    clientSlug: "",
    clientName: "Test",
    reporterLineUserId: "U123",
    type: "bug",
    severity: "P1",
    subject: "Test",
  });

  assert.equal(
    result.title,
    "[AAS][] P1 · bug · Test",
  );
  assert.deepEqual(result.labels, ["client:", "type:bug", "severity:P1"]);
});