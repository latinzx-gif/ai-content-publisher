import assert from "node:assert/strict";
import test from "node:test";

import { normalize, deriveIncidentFingerprint } from "./fingerprint";

test("normalize trims, lowercases, and collapses whitespace", () => {
  assert.equal(normalize("  Hello   World  "), "hello world");
  assert.equal(normalize("P0"), "p0");
  assert.equal(normalize("  login  page  "), "login page");
});

test("deriveIncidentFingerprint is stable for identical inputs", () => {
  const fp1 = deriveIncidentFingerprint("myclient", "api", "P1", "High CPU");
  const fp2 = deriveIncidentFingerprint("myclient", "api", "P1", "High CPU");
  assert.equal(fp1, fp2);
});

test("deriveIncidentFingerprint is stable across casing differences", () => {
  const fp1 = deriveIncidentFingerprint("MyClient", "API", "p1", "HIGH CPU");
  const fp2 = deriveIncidentFingerprint("myclient", "api", "P1", "high cpu");
  assert.equal(fp1, fp2);
});

test("deriveIncidentFingerprint is stable across whitespace differences", () => {
  const fp1 = deriveIncidentFingerprint(
    "  myclient  ",
    "api",
    "P1",
    "  High   CPU  ",
  );
  const fp2 = deriveIncidentFingerprint("myclient", "api", "P1", "High CPU");
  assert.equal(fp1, fp2);
});

test("deriveIncidentFingerprint uses 'system' fallback when clientSlug is null", () => {
  const fp1 = deriveIncidentFingerprint(
    null,
    "service-x",
    "P2",
    "Disk full",
  );
  const fp2 = deriveIncidentFingerprint(
    "system",
    "service-x",
    "P2",
    "disk full",
  );
  assert.equal(fp1, fp2);
});

test("deriveIncidentFingerprint produces different fingerprints for different subjects", () => {
  const fp1 = deriveIncidentFingerprint("c", "s", "P0", "Subject A");
  const fp2 = deriveIncidentFingerprint("c", "s", "P0", "Subject B");
  assert.notEqual(fp1, fp2);
});

test("deriveIncidentFingerprint produces different fingerprints for different services", () => {
  const fp1 = deriveIncidentFingerprint("c", "service-a", "P0", "Subj");
  const fp2 = deriveIncidentFingerprint("c", "service-b", "P0", "Subj");
  assert.notEqual(fp1, fp2);
});

test("deriveIncidentFingerprint produces different fingerprints for different severities", () => {
  const fp1 = deriveIncidentFingerprint("c", "s", "P1", "Subj");
  const fp2 = deriveIncidentFingerprint("c", "s", "P2", "Subj");
  assert.notEqual(fp1, fp2);
});

test("deriveIncidentFingerprint produces different fingerprints for different clients", () => {
  const fp1 = deriveIncidentFingerprint("client-a", "s", "P1", "Subj");
  const fp2 = deriveIncidentFingerprint("client-b", "s", "P1", "Subj");
  assert.notEqual(fp1, fp2);
});

test("deriveIncidentFingerprint uses 'system' fallback when clientSlug is empty string", () => {
  const fp1 = deriveIncidentFingerprint("", "service-x", "P2", "Disk full");
  const fp2 = deriveIncidentFingerprint("system", "service-x", "P2", "disk full");
  assert.equal(fp1, fp2);
});

test("deriveIncidentFingerprint uses 'system' fallback when clientSlug is whitespace-only", () => {
  const fp1 = deriveIncidentFingerprint("   ", "service-x", "P2", "Disk full");
  const fp2 = deriveIncidentFingerprint("system", "service-x", "P2", "disk full");
  assert.equal(fp1, fp2);
});