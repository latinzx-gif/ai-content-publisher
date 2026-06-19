import assert from "node:assert/strict";
import test from "node:test";

import {
  buildIngestionEndpoint,
  buildSimulatedQueueMonitorAlert,
  postIncidentToIngestion,
} from "./queue-monitor-relay";

test("buildSimulatedQueueMonitorAlert fills required incident fields", () => {
  const payload = buildSimulatedQueueMonitorAlert();

  assert.equal(payload.source, "monitor");
  assert.equal(payload.service, "cron:queue-monitor");
  assert.equal(payload.severity, "P1");
  assert.equal(payload.clientSlug, "system");
  assert.equal(typeof payload.sourceRef, "string");
  assert.ok(payload.subject.length > 0);
  assert.equal(typeof payload.body, "string");
  assert.equal(payload.metadata?.queue, "system");
});

test("buildIngestionEndpoint appends /api/internal/incidents when missing", () => {
  assert.equal(
    buildIngestionEndpoint("https://support-app-brown.vercel.app"),
    "https://support-app-brown.vercel.app/api/internal/incidents",
  );
  assert.equal(
    buildIngestionEndpoint("https://support-app-brown.vercel.app/"),
    "https://support-app-brown.vercel.app/api/internal/incidents",
  );
});

test("postIncidentToIngestion posts expected headers and parses JSON", async () => {
  const payload = buildSimulatedQueueMonitorAlert({ sourceRef: "manual:smoke" });

  const fakeResponseBody = {
    success: true,
    disposition: "created",
    incidentId: "inc-task5-demo",
    linearIssueUrl: "https://linear.app/demo/issue/incident-1",
  };

  const fakeFetch = async (_input: string, init?: RequestInit) => {
    assert.ok(init);
    assert.equal(init.method, "POST");

    const headers = init.headers as Record<string, string>;
    assert.equal(headers["content-type"], "application/json");
    assert.equal(headers["x-aas-incident-secret"], "secret-abc");

    assert.equal(_input, "https://support-app-brown.vercel.app/api/internal/incidents");

    const sent = JSON.parse((init.body as string) ?? "{}");
    assert.equal(sent.source, payload.source);
    assert.equal(sent.sourceRef, "manual:smoke");

    return new Response(JSON.stringify(fakeResponseBody), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const result = await postIncidentToIngestion({
    endpoint: "https://support-app-brown.vercel.app/api/internal/incidents",
    secret: "secret-abc",
    payload,
    fetcher: fakeFetch,
  });

  assert.equal(result.success, true);
  assert.equal(result.disposition, "created");
  assert.equal(result.incidentId, "inc-task5-demo");
  assert.equal(result.linearIssueUrl, "https://linear.app/demo/issue/incident-1");
});

test("postIncidentToIngestion throws on API error responses", async () => {
  const fakeFetch = async () =>
    new Response(JSON.stringify({ error: "bad request" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });

  await assert.rejects(
    () =>
      postIncidentToIngestion({
        endpoint: "https://support-app-brown.vercel.app/api/internal/incidents",
        secret: "secret-abc",
        payload: buildSimulatedQueueMonitorAlert(),
        fetcher: fakeFetch,
      }),
    /Incident relay failed \(400\):/,
  );
});

