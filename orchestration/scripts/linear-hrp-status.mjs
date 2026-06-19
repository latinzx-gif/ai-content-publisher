#!/usr/bin/env node
/**
 * Post hr-payroll orchestration events to Linear (non-review).
 *
 * Usage:
 *   node orchestration/scripts/linear-hrp-status.mjs \
 *     --id 29 --event task_set --summary "T29 in-progress; PLAN phase"
 *
 *   node orchestration/scripts/linear-hrp-status.mjs \
 *     --id 29 --event plan_approved --summary "Fast-track EXECUTE from CURRENT_TASK.md"
 *
 * Events: task_set | plan_approved | plan_rejected | note
 *
 * Always runs linear-sync-hr-payroll.mjs first (unless --no-sync).
 * Env: LINEAR_API_KEY in orchestration/.env.local
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const ORCH = resolve(ROOT, "orchestration");
const SYNC_SCRIPT = resolve(ORCH, "scripts/linear-sync-hr-payroll.mjs");

const API = "https://api.linear.app/graphql";
const TEAM_ID = "97c4697c-7aad-4a5e-8f1b-88b18c7bdc97";
const PROJECT_ID = "bf810005-ccb4-400f-a3d3-ad28b99db4be";

const EVENT_LABEL = {
  task_set: "Task set — in progress",
  plan_approved: "Plan approved — EXECUTE",
  plan_rejected: "Plan rejected",
  note: "Orchestrator note",
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
  const out = { id: "", event: "note", summary: "", noSync: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--id") out.id = args[++i] ?? "";
    else if (a === "--event") out.event = args[++i] ?? "note";
    else if (a === "--summary") out.summary = args[++i] ?? "";
    else if (a === "--no-sync") out.noSync = true;
  }
  if (!out.id) {
    console.error("Missing --id (Taskmaster task id, e.g. 29)");
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
          nodes { id identifier title url }
        }
      }
    }`,
    { teamId: TEAM_ID, q: searchKey }
  );
  return data.team.issues.nodes.find((i) => i.title.includes(searchKey));
}

function formatComment({ tid, event, summary }) {
  const label = EVENT_LABEL[event] ?? EVENT_LABEL.note;
  return [
    `📋 **Cursor — ${tid}**`,
    "",
    `**Event:** ${label}`,
    `**Date:** ${new Date().toISOString()}`,
    "",
    summary || "_No summary provided._",
    "",
    "---",
    "_Auto-posted by `linear-hrp-status.mjs`_",
  ].join("\n");
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

async function main() {
  const opts = parseArgs();
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    console.error("LINEAR_API_KEY not set in orchestration/.env.local");
    process.exit(2);
  }

  if (!opts.noSync) {
    const sync = spawnSync("node", [SYNC_SCRIPT], {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
    });
    if (sync.status !== 0) {
      process.exit(sync.status ?? 1);
    }
    console.log("");
  }

  const tid = taskLabel(opts.id);
  const searchKey = `[HRP] ${tid}`;
  const issue = await findIssue(apiKey, searchKey);
  if (!issue) {
    console.error(`Linear issue not found for ${searchKey}. Run linear-sync-hr-payroll.mjs first.`);
    process.exit(1);
  }

  const body = formatComment({ tid, event: opts.event, summary: opts.summary });
  await addComment(apiKey, issue.id, body);

  console.log(`Linear comment posted on ${issue.identifier}: ${issue.url}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
