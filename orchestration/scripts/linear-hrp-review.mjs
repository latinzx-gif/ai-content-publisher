#!/usr/bin/env node
/**
 * Post task review result to Linear (hr-payroll-client).
 * Updates issue state from Taskmaster + adds review comment.
 *
 * Usage:
 *   node orchestration/scripts/linear-hrp-review.mjs \
 *     --id 7 \
 *     --verdict approved \
 *     --summary "build/typecheck/lint pass; 5/5 functional tests"
 *
 *   node orchestration/scripts/linear-hrp-review.mjs \
 *     --id 7 \
 *     --verdict rejected \
 *     --summary "duplicate guard missing" \
 *     --fixes "Add ICT day range check in check-in.ts"
 *
 * Env: LINEAR_API_KEY in orchestration/.env.local
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const ORCH = resolve(ROOT, "orchestration");
const TASKS_JSON = resolve(
  ROOT,
  "PROJECTS/hr-payroll-client/.taskmaster/tasks/tasks.json"
);

const API = "https://api.linear.app/graphql";
const TEAM_ID = "97c4697c-7aad-4a5e-8f1b-88b18c7bdc97";
const PROJECT_ID = "bf810005-ccb4-400f-a3d3-ad28b99db4be";

const STATE = {
  done: "72bb01f2-4b7e-4548-8943-78139879f715",
  "in-progress": "6770ceff-0bfc-4db8-a207-7c6519ca1ba4",
  review: "24b8db96-b80e-4436-8fc2-986103bf5693",
  pending: "a30065c4-b64a-400d-854d-998b14789c2b",
  cancelled: "7b8d63bb-490c-4aea-8ae6-58bab9c70e96",
  canceled: "7b8d63bb-490c-4aea-8ae6-58bab9c70e96",
};

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(resolve(ORCH, ".env.local"));

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { id: "", verdict: "approved", summary: "", fixes: "" };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--id") out.id = args[++i] ?? "";
    else if (a === "--verdict") out.verdict = args[++i] ?? "approved";
    else if (a === "--summary") out.summary = args[++i] ?? "";
    else if (a === "--fixes") out.fixes = args[++i] ?? "";
  }
  if (!out.id) {
    console.error("Missing --id (Taskmaster task id, e.g. 7)");
    process.exit(1);
  }
  return out;
}

function taskLabel(id) {
  return `T${String(id).padStart(2, "0")}`;
}

async function gql(apiKey, query, variables = {}) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors?.length) {
    throw new Error(JSON.stringify(json.errors ?? { status: res.status }, null, 2));
  }
  return json.data;
}

async function findIssue(apiKey, searchKey) {
  const data = await gql(
    apiKey,
    `query($teamId: String!, $q: String!) {
      team(id: $teamId) {
        issues(filter: { title: { containsIgnoreCase: $q } }, first: 10) {
          nodes { id identifier title url state { id name } }
        }
      }
    }`,
    { teamId: TEAM_ID, q: searchKey }
  );
  return data.team.issues.nodes.find((i) => i.title.includes(searchKey));
}

function formatComment({ tid, verdict, summary, fixes }) {
  const emoji = verdict === "approved" ? "✅" : "❌";
  const lines = [
    `${emoji} **Cursor Review — ${tid}**`,
    "",
    `**Verdict:** ${verdict.toUpperCase()}`,
    `**Date:** ${new Date().toISOString()}`,
    "",
    summary || "_No summary provided._",
  ];
  if (fixes) {
    lines.push("", "**Required fixes:**", fixes);
  }
  lines.push("", "---", "_Auto-posted by `linear-hrp-review.mjs`_");
  return lines.join("\n");
}

async function addComment(apiKey, issueId, body) {
  await gql(
    apiKey,
    `mutation($input: CommentCreateInput!) {
      commentCreate(input: $input) { success }
    }`,
    { input: { issueId, body } }
  );
}

async function updateIssueState(apiKey, issueId, stateId) {
  const data = await gql(
    apiKey,
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) { success issue { identifier state { name } url } }
    }`,
    { id: issueId, input: { stateId, projectId: PROJECT_ID } }
  );
  return data.issueUpdate;
}

async function main() {
  const opts = parseArgs();
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    console.error("LINEAR_API_KEY not set in orchestration/.env.local");
    process.exit(2);
  }

  const tid = taskLabel(opts.id);
  const searchKey = `[HRP] ${tid}`;

  let taskStatus = opts.verdict === "approved" ? "done" : "in-progress";
  if (existsSync(TASKS_JSON)) {
    const raw = JSON.parse(readFileSync(TASKS_JSON, "utf8"));
    const tasks = raw.tasks ?? raw.master?.tasks ?? [];
    const task = tasks.find((t) => String(t.id) === String(opts.id));
    if (task?.status) taskStatus = task.status;
  }

  const issue = await findIssue(apiKey, searchKey);
  if (!issue) {
    console.error(`Linear issue not found for ${searchKey}. Run linear-sync-hr-payroll.mjs first.`);
    process.exit(1);
  }

  const stateId = STATE[taskStatus] ?? STATE.pending;
  const updated = await updateIssueState(apiKey, issue.id, stateId);
  const comment = formatComment({ tid, verdict: opts.verdict, summary: opts.summary, fixes: opts.fixes });
  await addComment(apiKey, issue.id, comment);

  console.log(
    `Linear updated: ${updated.issue.identifier} → ${updated.issue.state.name}`
  );
  console.log(`Review comment posted: ${updated.issue.url ?? issue.url}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
