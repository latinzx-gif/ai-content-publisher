#!/usr/bin/env node
/**
 * Sync all Taskmaster tasks from hr-payroll-client to Linear.
 *
 * Creates/updates issues titled `[HRP] T{NN} — {title}` under project
 * "LINE OA HR & Payroll".
 *
 * Usage:
 *   node orchestration/scripts/linear-sync-hr-payroll.mjs
 *   node orchestration/scripts/linear-sync-hr-payroll.mjs --dry-run
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

const PRIORITY = { high: 2, medium: 3, low: 4 };

function loadEnvFile(path, { override = true } = {}) {
  if (!existsSync(path)) return false;
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
    val = val.trim();
    if (override || process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = val;
    }
  }
  return true;
}

const envArg = process.argv.find((a) => a.startsWith("--env-file="));
const envPath = envArg
  ? resolve(envArg.slice("--env-file=".length))
  : resolve(ORCH, ".env.local");

if (!loadEnvFile(envPath)) {
  console.error(`Env file not found: ${envPath}`);
  console.error("Create orchestration/.env.local with LINEAR_API_KEY=lin_api_...");
  process.exit(2);
}

const dryRun = process.argv.includes("--dry-run");

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

function taskId(num) {
  return `T${String(num).padStart(2, "0")}`;
}

function issueTitle(task) {
  return `[HRP] ${taskId(task.id)} — ${task.title}`;
}

function issueDescription(task) {
  const deps = task.dependencies?.length
    ? task.dependencies.map((d) => taskId(d)).join(", ")
    : "—";
  return [
    `## ${task.title}`,
    "",
    `**Taskmaster ID:** #${task.id}`,
    `**Milestone:** ${task.milestone ?? "—"}`,
    `**Status:** ${task.status}`,
    `**Priority:** ${task.priority ?? "—"}`,
    `**Agent:** ${task.agent ?? "—"}`,
    `**Dependencies:** ${deps}`,
    "",
    "### Description",
    task.description ?? "",
    "",
    "### Details",
    task.details ?? "",
    "",
    "### Test Strategy",
    task.testStrategy ?? "",
    "",
    "---",
    "_Synced from `hr-payroll-client/.taskmaster/tasks/tasks.json`_",
  ].join("\n");
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

async function createIssue(apiKey, task) {
  const tid = taskId(task.id);
  const title = issueTitle(task);
  const description = issueDescription(task);
  const stateId = STATE[task.status] ?? STATE.pending;
  const priority = PRIORITY[task.priority] ?? 3;

  if (dryRun) {
    console.log(`[dry-run] CREATE ${tid}: ${title} (${task.status})`);
    return { identifier: tid, url: "(dry-run)" };
  }

  const data = await gql(
    apiKey,
    `mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) { success issue { id identifier title url } }
    }`,
    {
      input: {
        teamId: TEAM_ID,
        projectId: PROJECT_ID,
        title,
        description,
        stateId,
        priority,
      },
    }
  );
  return data.issueCreate.issue;
}

async function updateIssue(apiKey, issue, task) {
  const title = issueTitle(task);
  const description = issueDescription(task);
  const stateId = STATE[task.status] ?? STATE.pending;
  const priority = PRIORITY[task.priority] ?? 3;

  if (dryRun) {
    console.log(`[dry-run] UPDATE ${issue.identifier}: ${title} (${task.status})`);
    return issue;
  }

  const data = await gql(
    apiKey,
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) { success issue { id identifier title url state { name } } }
    }`,
    {
      id: issue.id,
      input: {
        title,
        description,
        stateId,
        priority,
        projectId: PROJECT_ID,
      },
    }
  );
  return data.issueUpdate.issue;
}

async function verifyAuth(apiKey) {
  const data = await gql(apiKey, `{ viewer { id name } }`);
  return data.viewer;
}

async function main() {
  const apiKey = (process.env.LINEAR_API_KEY ?? "").trim();
  if (!apiKey) {
    console.error(`LINEAR_API_KEY not set in ${envPath}`);
    console.error("Get a key: https://linear.app/settings/account/security/api");
    process.exit(2);
  }

  try {
    const viewer = await verifyAuth(apiKey);
    console.log(`Linear auth OK — ${viewer.name}\n`);
  } catch {
    console.error(
      "LINEAR_API_KEY rejected (401). Shell env may have overridden a stale key.",
    );
    console.error(`Using env file: ${envPath}`);
    console.error("Fix: update LINEAR_API_KEY in orchestration/.env.local");
    process.exit(2);
  }

  if (!existsSync(TASKS_JSON)) {
    console.error(`Tasks file not found: ${TASKS_JSON}`);
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(TASKS_JSON, "utf8"));
  const tasks = raw.tasks ?? raw.master?.tasks ?? [];
  if (!Array.isArray(tasks) || tasks.length === 0) {
    console.error("No tasks array in tasks.json (expected root.tasks or master.tasks)");
    process.exit(1);
  }
  console.log(`Syncing ${tasks.length} tasks to Linear project "LINE OA HR & Payroll"...\n`);

  let created = 0;
  let updated = 0;

  for (const task of tasks) {
    const tid = taskId(task.id);
    const existing = await findIssue(apiKey, `[HRP] ${tid}`);

    if (existing) {
      const issue = await updateIssue(apiKey, existing, task);
      updated++;
      console.log(`✓ Updated ${issue.identifier}: ${issue.title} [${issue.state?.name ?? task.status}]`);
      console.log(`  ${issue.url ?? existing.url}\n`);
    } else {
      const issue = await createIssue(apiKey, task);
      created++;
      console.log(`+ Created ${issue.identifier}: ${issue.title}`);
      console.log(`  ${issue.url}\n`);
    }
  }

  console.log(`Done: ${created} created, ${updated} updated (${tasks.length} total)`);
  console.log(`Project: https://linear.app/jakarinosk/project/line-oa-hr-and-payroll-a03cf785a6ee`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
