#!/usr/bin/env node
/**
 * Pre-commit working-tree review via @cursor/sdk (local runtime).
 *
 * Usage:
 *   export CURSOR_API_KEY="cursor_..."   # https://cursor.com/dashboard/cloud-agents
 *   npm run review:changes
 *
 * Exit codes: 0 finished, 1 startup failure, 2 run ended with error, 75 retryable.
 */
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Agent, CursorAgentError } from "@cursor/sdk";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apiKey = process.env.CURSOR_API_KEY?.trim();

if (!apiKey) {
  console.error(
    "Missing CURSOR_API_KEY. Create one at https://cursor.com/dashboard/cloud-agents",
  );
  process.exit(1);
}

function gitOutput(command) {
  try {
    return execSync(command, { cwd: repoRoot, encoding: "utf8" }).trimEnd();
  } catch {
    return "";
  }
}

const branch = gitOutput("git branch --show-current") || "unknown";
const status = gitOutput("git status --short");
const diffStat = gitOutput("git diff --stat HEAD");

if (!status && !diffStat) {
  console.log("Working tree is clean — nothing to review.");
  process.exit(0);
}

const prompt = `Review uncommitted working-tree changes in head-office-app (branch: ${branch}) before commit.

Git status:
${status || "(no staged/unstaged paths)"}

Diff stat vs HEAD:
${diffStat || "(no diff)"}

Focus on:
1. Regressions in publisher workflow, agent execution, and auth/API security
2. Supabase migration / RLS risks in new ACP schema files
3. Whether deleted docs look intentional
4. Top blockers before deploy (max 5 bullets)

Read files as needed. Be direct — bullets only, no filler.`;

const agent = Agent.create({
  apiKey,
  model: { id: "composer-2" },
  local: { cwd: repoRoot, settingSources: [] },
});

try {
  const run = await agent.send(prompt);
  console.log(`[review] agent=${agent.agentId} run=${run.id}\n`);

  for await (const event of run.stream()) {
    if (event.type === "assistant") {
      for (const block of event.message.content) {
        if (block.type === "text") process.stdout.write(block.text);
      }
    }
    if (event.type === "status") {
      process.stderr.write(`[review] ${event.status}\n`);
    }
  }

  const result = await run.wait();
  if (result.status !== "finished") {
    console.error(`\n[review] run ${result.id} ended as ${result.status}`);
    process.exit(2);
  }

  console.log(`\n\n[review] done in ${result.durationMs ?? "?"}ms`);
} catch (err) {
  if (err instanceof CursorAgentError) {
    console.error(`[review] startup failed: ${err.message}`);
    process.exit(err.isRetryable ? 75 : 1);
  }
  throw err;
} finally {
  await agent[Symbol.asyncDispose]();
}
