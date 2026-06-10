#!/usr/bin/env node
/**
 * Post task completion / blockers to Linear (comment on issue or create issue).
 *
 * Env (orchestration/.env.local or shell):
 *   LINEAR_API_KEY=lin_api_...
 *   LINEAR_TEAM_ID=...          # optional if LINEAR_TEAM_KEY set
 *   LINEAR_TEAM_KEY=JAK         # team key slug, default: first team
 *
 * Usage:
 *   node orchestration/scripts/linear-task-update.mjs \
 *     --task QA-01 \
 *     --status done|blocked|in_progress \
 *     --title "End-to-End Verification" \
 *     --summary "Build passed; auth gate OK" \
 *     --blockers "RLS migration not applied on remote"
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const ORCH = resolve(ROOT, "orchestration");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(resolve(ORCH, ".env.local"));
loadEnvFile(resolve(ROOT, ".env.local"));
loadEnvFile(resolve(ROOT, "head-office-app/.env.local"));

const API = "https://api.linear.app/graphql";

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { task: "", status: "done", title: "", summary: "", blockers: "" };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--task") out.task = args[++i] ?? "";
    else if (a === "--status") out.status = args[++i] ?? "done";
    else if (a === "--title") out.title = args[++i] ?? "";
    else if (a === "--summary") out.summary = args[++i] ?? "";
    else if (a === "--blockers") out.blockers = args[++i] ?? "";
  }
  if (!out.task) {
    console.error("Missing --task (e.g. QA-01)");
    process.exit(1);
  }
  return out;
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

async function getTeamId(apiKey) {
  if (process.env.LINEAR_TEAM_ID) return process.env.LINEAR_TEAM_ID;
  const data = await gql(
    apiKey,
    `query { teams { nodes { id key name } } }`
  );
  const teams = data.teams.nodes;
  const key = process.env.LINEAR_TEAM_KEY;
  if (key) {
    const t = teams.find((x) => x.key.toLowerCase() === key.toLowerCase());
    if (t) return t.id;
  }
  if (!teams.length) throw new Error("No Linear teams found");
  return teams[0].id;
}

async function findIssue(apiKey, teamId, identifier) {
  const data = await gql(
    apiKey,
    `query($teamId: String!, $q: String!) {
      team(id: $teamId) {
        issues(filter: { title: { containsIgnoreCase: $q } }, first: 5) {
          nodes { id identifier title url }
        }
      }
    }`,
    { teamId, q: identifier }
  );
  return data.team.issues.nodes.find(
    (i) => i.title.includes(identifier) || i.identifier === identifier
  );
}

function formatBody({ task, status, title, summary, blockers }) {
  const emoji =
    status === "done" ? "✅" : status === "blocked" ? "🚫" : "🔄";
  const lines = [
    `${emoji} **${task}${title ? ` — ${title}` : ""}**`,
    "",
    `**Status:** ${status}`,
    `**Updated:** ${new Date().toISOString()}`,
    "",
    summary || "_No summary provided._",
  ];
  if (blockers) {
    lines.push("", "**Blockers / issues for you:**", blockers);
  }
  lines.push("", "---", "_Auto-posted by `orchestration/scripts/linear-task-update.mjs`_");
  return lines.join("\n");
}

async function createIssue(apiKey, teamId, taskId, title, body) {
  const issueTitle = title
    ? `[ACP] ${taskId} — ${title}`
    : `[ACP] ${taskId}`;
  const data = await gql(
    apiKey,
    `mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) { success issue { id identifier url } }
    }`,
    {
      input: {
        teamId,
        title: issueTitle,
        description: body,
        labelIds: [],
      },
    }
  );
  return data.issueCreate.issue;
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
    console.error(
      "LINEAR_API_KEY not set. Add to orchestration/.env.local (see orchestration/LINEAR_TASK_SYNC.md)"
    );
    process.exit(2);
  }

  const teamId = await getTeamId(apiKey);
  const body = formatBody(opts);
  const searchKey = `[ACP] ${opts.task}`;

  let issue = await findIssue(apiKey, teamId, opts.task);
  if (!issue) {
    issue = await createIssue(apiKey, teamId, opts.task, opts.title, body);
    console.log(`Created issue ${issue.identifier}: ${issue.url}`);
  } else {
    await addComment(apiKey, issue.id, body);
    const url = issue.url ?? `https://linear.app/issue/${issue.identifier}`;
    console.log(`Commented on ${issue.identifier}: ${url}`);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
