import assert from "node:assert/strict";
import test from "node:test";
import type { Json } from "@/lib/database.types";

import { createOrBumpIncident } from "./incidents";
import type {
  IncidentInput,
  IncidentRecord,
  IncidentSeverity,
  IncidentSource,
  IncidentStatus,
} from "@/lib/incidents/types";
import type { CreateLinearIssueParams, CreateLinearIssueResult } from "@/lib/linear/client";

// ---------------------------------------------------------------------------
// Stub types
// ---------------------------------------------------------------------------

export interface IncidentRepository {
  findByFingerprint(
    fingerprint: string,
  ): Promise<IncidentRecord | null>;
  insert(
    input: IncidentRecord,
  ): Promise<IncidentRecord>;
  bump(
    id: string,
    updates: {
      occurrence_count: number;
      last_seen_at: string;
      last_payload: Json | null;
      severity?: string;
    },
  ): Promise<void>;
  updateLinearRefs(
    id: string,
    linearIssueId: string,
    linearIssueUrl: string,
  ): Promise<void>;
}

export interface LinearClient {
  createIssue(
    params: CreateLinearIssueParams,
  ): Promise<CreateLinearIssueResult>;
  commentOnIssue(issueId: string, body: string): Promise<void>;
  updateIssuePriority(issueId: string, priority: number): Promise<void>;
}

// ---------------------------------------------------------------------------
// Default stubs
// ---------------------------------------------------------------------------

function stubRepository(
  overrides?: Partial<IncidentRepository>,
): IncidentRepository {
  return {
    findByFingerprint: async () => null,
    insert: async (input) => ({
      ...input,
      id: "inc-test-1",
      created_at: new Date().toISOString(),
      updated_at: null,
    }),
    bump: async () => {},
    updateLinearRefs: async () => {},
    ...overrides,
  };
}

function makeLinearClient(
  overrides?: Partial<LinearClient>,
): LinearClient {
  return {
    createIssue: async () => ({
      issue_id: "lin-test-1",
      issue_url: "https://linear.app/issue/LIN-1",
    }),
    commentOnIssue: async () => {},
    updateIssuePriority: async () => {},
    ...overrides,
  };
}

function makeExistingIncident(
  overrides?: Partial<IncidentRecord>,
): IncidentRecord {
  return {
    id: "inc-existing-1",
    client_id: null,
    source: "monitor",
    source_ref: null,
    service: "api-gateway",
    severity: "P1" as IncidentSeverity,
    status: "open" as IncidentStatus,
    subject: "High latency",
    body: null,
    fingerprint: "some-fingerprint",
    occurrence_count: 2,
    first_seen_at: "2025-01-01T00:00:00Z",
    last_seen_at: "2025-01-02T00:00:00Z",
    last_payload: null,
    linear_issue_id: "lin-existing-1",
    linear_issue_url: "https://linear.app/issue/LIN-EXISTING",
    ticket_id: null,
    created_at: null,
    updated_at: null,
    ...overrides,
  };
}

const sampleInput: IncidentInput = {
  source: "monitor" as IncidentSource,
  service: "api-gateway",
  severity: "P1" as IncidentSeverity,
  subject: "High latency",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test("createOrBumpIncident creates new incident and Linear issue on first occurrence", async () => {
  const repo = stubRepository();
  const linear = makeLinearClient();

  const capturedParams: Array<{ title: string }> = [];
  linear.createIssue = async (params) => {
    capturedParams.push({ title: params.title });
    return { issue_id: "lin-new", issue_url: "https://linear.app/issue/LIN-NEW" };
  };

  const result = await createOrBumpIncident(sampleInput, {
    repo,
    linear,
  });

  assert.equal(result.disposition, "created");
  assert.equal(result.linearIssueId, "lin-new");
  assert.equal(result.linearIssueUrl, "https://linear.app/issue/LIN-NEW");
  assert.ok(result.incidentId);
  assert.equal(capturedParams.length, 1, "createIssue should have been called once");
  assert.ok(
    capturedParams[0]!.title.includes("[AAS]"),
    "title should include [AAS] prefix",
  );
});

test("createOrBumpIncident bumps existing open incident on repeat occurrence", async () => {
  const existing = makeExistingIncident();

  const repo = stubRepository({
    findByFingerprint: async () => existing,
  });

  let bumped = false;
  let commentCalled = false;
  let commentBody = "";

  repo.bump = async (_id, updates) => {
    bumped = true;
    assert.equal(updates.occurrence_count, 3);
  };

  const linear = makeLinearClient({
    commentOnIssue: async (_id, body) => {
      commentCalled = true;
      commentBody = body;
    },
  });

  const result = await createOrBumpIncident(
    {
      ...sampleInput,
      body: "Recurring — happening again",
    },
    { repo, linear },
  );

  assert.equal(result.disposition, "bumped");
  assert.equal(result.linearIssueId, "lin-existing-1");
  assert.equal(result.linearIssueUrl, "https://linear.app/issue/LIN-EXISTING");
  assert.equal(result.incidentId, "inc-existing-1");
  assert.ok(bumped, "bump should have been called");
  assert.ok(commentCalled, "commentOnIssue should have been called");
  assert.ok(commentBody.includes("Recurring"));
});

test("createOrBumpIncident bumps existing investigating incident on repeat occurrence", async () => {
  const existing = makeExistingIncident({ status: "investigating" });

  const repo = stubRepository({
    findByFingerprint: async () => existing,
  });

  let bumped = false;
  repo.bump = async () => {
    bumped = true;
  };

  const result = await createOrBumpIncident(sampleInput, {
    repo,
    linear: makeLinearClient(),
  });

  assert.equal(result.disposition, "bumped");
  assert.ok(bumped);
});

test("createOrBumpIncident generates fingerprint when not provided", async () => {
  let capturedFingerprint = "";

  const repo = stubRepository({
    insert: async (input) => {
      capturedFingerprint = input.fingerprint;
      return {
        ...input,
        id: "inc-fp-1",
        created_at: new Date().toISOString(),
        updated_at: null,
      };
    },
  });

  await createOrBumpIncident(sampleInput, {
    repo,
    linear: makeLinearClient(),
  });

  assert.ok(capturedFingerprint.length > 0, "fingerprint should be derived");
});

test("createOrBumpIncident returns incident even when Linear creation fails (graceful)", async () => {
  const repo = stubRepository();
  const linear = makeLinearClient({
    createIssue: async () => {
      throw new Error("Linear API unreachable");
    },
  });

  const result = await createOrBumpIncident(sampleInput, {
    repo,
    linear,
  });

  assert.equal(result.disposition, "created");
  assert.equal(result.linearIssueId, null);
  assert.equal(result.linearIssueUrl, null);
});

test("createOrBumpIncident does not create second Linear issue on bump", async () => {
  const existing = makeExistingIncident();

  const repo = stubRepository({
    findByFingerprint: async () => existing,
  });

  let createCallCount = 0;
  const linear = makeLinearClient({
    createIssue: async () => {
      createCallCount++;
      return { issue_id: "should-not", issue_url: "should-not" };
    },
  });

  await createOrBumpIncident(sampleInput, { repo, linear });

  assert.equal(createCallCount, 0, "createIssue should NOT be called on bump");
});

test("createOrBumpIncident uses provided fingerprint when given", async () => {
  let capturedFingerprint = "";

  const repo = stubRepository({
    findByFingerprint: async (fp) => {
      capturedFingerprint = fp;
      return null;
    },
    insert: async (input) => ({
      ...input,
      id: "inc-provided-fp",
      created_at: new Date().toISOString(),
      updated_at: null,
    }),
  });

  await createOrBumpIncident(
    { ...sampleInput, fingerprint: "explicit-fingerprint-value" },
    { repo, linear: makeLinearClient() },
  );

  // findByFingerprint should have been called with the explicit fingerprint
  assert.equal(capturedFingerprint, "explicit-fingerprint-value");
});

// ---------------------------------------------------------------------------
// Finding 3: Active-status semantics — resolved/closed incidents cause
// a new incident creation, not a bump
// ---------------------------------------------------------------------------

test("createOrBumpIncident creates new incident when existing is resolved", async () => {
  const existing = makeExistingIncident({ status: "resolved" });

  let findByFingerprintCalled = false;
  let bumpCalled = false;
  let insertCalled = false;

  const repo = stubRepository({
    findByFingerprint: async () => {
      findByFingerprintCalled = true;
      return existing;
    },
    bump: async () => {
      bumpCalled = true;
    },
    insert: async (input) => {
      insertCalled = true;
      return {
        ...input,
        id: "inc-resolved-new",
        created_at: new Date().toISOString(),
        updated_at: null,
      };
    },
  });

  const result = await createOrBumpIncident(sampleInput, {
    repo,
    linear: makeLinearClient(),
  });

  assert.equal(result.disposition, "created");
  assert.ok(findByFingerprintCalled, "findByFingerprint should have been called");
  assert.ok(!bumpCalled, "bump should NOT have been called for a resolved incident");
  assert.ok(insertCalled, "insert should have been called to create a new incident");
});

test("createOrBumpIncident creates new incident when existing is closed", async () => {
  const existing = makeExistingIncident({ status: "closed" });

  let bumpCalled = false;
  let insertCalled = false;

  const repo = stubRepository({
    findByFingerprint: async () => existing,
    bump: async () => {
      bumpCalled = true;
    },
    insert: async (input) => {
      insertCalled = true;
      return {
        ...input,
        id: "inc-closed-new",
        created_at: new Date().toISOString(),
        updated_at: null,
      };
    },
  });

  const result = await createOrBumpIncident(sampleInput, {
    repo,
    linear: makeLinearClient(),
  });

  assert.equal(result.disposition, "created");
  assert.ok(!bumpCalled, "bump should NOT have been called for a closed incident");
  assert.ok(insertCalled, "insert should have been called to create a new incident");
});

// ---------------------------------------------------------------------------
// Finding 1: updateLinearRefs failures propagate (no silent orphaning)
// ---------------------------------------------------------------------------

test("createOrBumpIncident propagates updateLinearRefs failure (not silent)", async () => {
  const repo = stubRepository({
    updateLinearRefs: async () => {
      throw new Error("DB write failed");
    },
  });

  const linear = makeLinearClient();

  await assert.rejects(
    () => createOrBumpIncident(sampleInput, { repo, linear }),
    /DB write failed/,
    "updateLinearRefs failure should propagate, not be silently caught",
  );
});