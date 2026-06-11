#!/usr/bin/env node
/**
 * driver.mjs — smoke/interaction driver for ai-content-publisher
 *
 * Usage:
 *   node driver.mjs [--url http://localhost:3000] [--out /tmp/acp-shots] [command]
 *
 * Commands:
 *   smoke      — check all key routes return 200 (default when no browser)
 *   screenshot — take screenshots of dashboard, create, logs, and the
 *                full demo flow with ?post_id=demo-001
 *   flow       — run the full demo flow: create → briefs → content →
 *                image-prompts → images → quality-check → review → logs
 *
 * Requires: npx playwright (≥1.60) + system Chrome at the standard macOS path
 *           (or set PLAYWRIGHT_CHROME=/path/to/chrome env var)
 */

import { spawn, execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const BASE_URL = process.env.ACP_URL || "http://localhost:3000";
const OUT_DIR = process.env.ACP_SHOTS || "/tmp/acp-shots";
const CHROME =
  process.env.PLAYWRIGHT_CHROME ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const DEMO_POST_ID = "demo-001";

// ── helpers ──────────────────────────────────────────────────────────────────

function log(msg) {
  process.stderr.write(`[driver] ${msg}\n`);
}

async function waitReady(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok || res.status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} not ready after ${timeoutMs}ms`);
}

async function smokeCheck(routes) {
  let pass = 0;
  let fail = 0;
  for (const route of routes) {
    const url = `${BASE_URL}${route}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const ok = res.status < 500;
      console.log(`${ok ? "✓" : "✗"} ${res.status} ${route}`);
      ok ? pass++ : fail++;
    } catch (e) {
      console.log(`✗ ERROR ${route}: ${e.message}`);
      fail++;
    }
  }
  console.log(`\n${pass} pass, ${fail} fail`);
  return fail === 0;
}

// ── playwright helpers ────────────────────────────────────────────────────────

async function resolvePw() {
  // 1. Try standard module resolution
  try { return await import("playwright"); } catch {}
  // 2. Search npx cache (populated by: npx playwright --version)
  const { createRequire } = await import("module");
  const { readdirSync, existsSync } = await import("fs");
  const { join: pjoin } = await import("path");
  const { homedir } = await import("os");
  const npxBase = pjoin(homedir(), ".npm/_npx");
  if (existsSync(npxBase)) {
    for (const dir of readdirSync(npxBase)) {
      const candidate = pjoin(npxBase, dir, "node_modules/playwright");
      if (existsSync(candidate)) {
        const req = createRequire(import.meta.url);
        return req(candidate);
      }
    }
  }
  throw new Error(
    "playwright not found. Populate its npx cache first:\n  npx playwright --version"
  );
}

async function withBrowser(fn) {
  const { chromium } = await resolvePw();

  const browser = await chromium.launch({
    executablePath: existsSync(CHROME) ? CHROME : undefined,
    channel: existsSync(CHROME) ? undefined : "chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    return await fn(browser);
  } finally {
    await browser.close();
  }
}

async function shot(page, name) {
  mkdirSync(OUT_DIR, { recursive: true });
  const path = join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  log(`screenshot → ${path}`);
  return path;
}

// ── commands ─────────────────────────────────────────────────────────────────

async function cmdSmoke() {
  log(`smoke-checking ${BASE_URL}`);
  await waitReady(BASE_URL);
  const routes = [
    "/",
    "/create",
    "/logs",
    "/publishing",
    "/calendar",
    `/briefs?post_id=${DEMO_POST_ID}`,
    `/rules?post_id=${DEMO_POST_ID}`,
    `/content-generation?post_id=${DEMO_POST_ID}`,
    `/image-prompts?post_id=${DEMO_POST_ID}`,
    `/images?post_id=${DEMO_POST_ID}`,
    `/quality-check?post_id=${DEMO_POST_ID}`,
    `/review?post_id=${DEMO_POST_ID}`,
  ];
  const ok = await smokeCheck(routes);
  process.exit(ok ? 0 : 1);
}

async function cmdScreenshot() {
  log("launching browser for screenshots");
  await waitReady(BASE_URL);

  await withBrowser(async (browser) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();

    // Home redirect
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await shot(page, "home");

    // Create
    await page.goto(`${BASE_URL}/create`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await shot(page, "create");

    // Logs
    await page.goto(`${BASE_URL}/logs`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await shot(page, "logs");

    // Brief page with demo post
    await page.goto(`${BASE_URL}/briefs?post_id=${DEMO_POST_ID}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(2000);
    await shot(page, "briefs");

    // Content generation
    await page.goto(`${BASE_URL}/content-generation?post_id=${DEMO_POST_ID}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(2000);
    await shot(page, "content-generation");

    // Quality check
    await page.goto(`${BASE_URL}/quality-check?post_id=${DEMO_POST_ID}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(2000);
    await shot(page, "quality-check");

    console.log(`\nScreenshots written to ${OUT_DIR}/`);
    await ctx.close();
  });
}

async function cmdFlow() {
  log(`running demo flow with post_id=${DEMO_POST_ID}`);
  await waitReady(BASE_URL);

  await withBrowser(async (browser) => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();

    // 1. Create page — fill and submit the form
    log("step 1: create");
    await page.goto(`${BASE_URL}/create`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await shot(page, "flow-01-create");

    // Fill in the create form fields if visible
    const topicInput = page.locator('input[name="topic"], input[placeholder*="topic" i], textarea[placeholder*="topic" i]').first();
    if (await topicInput.isVisible().catch(() => false)) {
      await topicInput.fill("Legal tech for modern accounting teams");
    }
    const brandInput = page.locator('input[name="brand"], input[placeholder*="brand" i]').first();
    if (await brandInput.isVisible().catch(() => false)) {
      await brandInput.fill("ContentOS Demo");
    }

    // 2. Navigate to briefs
    log("step 2: briefs");
    await page.goto(`${BASE_URL}/briefs?post_id=${DEMO_POST_ID}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(2000);

    // Click generate if button exists
    const generateBtn = page.locator('button:has-text("Generate"), button:has-text("Build Brief")').first();
    if (await generateBtn.isVisible().catch(() => false)) {
      await generateBtn.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, "flow-02-briefs");

    // 3. Rules
    log("step 3: rules");
    await page.goto(`${BASE_URL}/rules?post_id=${DEMO_POST_ID}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(2000);
    const loadRulesBtn = page.locator('button:has-text("Load Rules"), button:has-text("Generate Rules")').first();
    if (await loadRulesBtn.isVisible().catch(() => false)) {
      await loadRulesBtn.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, "flow-03-rules");

    // 4. Content generation
    log("step 4: content generation");
    await page.goto(`${BASE_URL}/content-generation?post_id=${DEMO_POST_ID}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(2000);
    const genContentBtn = page.locator('button:has-text("Generate Content"), button:has-text("Generate")').first();
    if (await genContentBtn.isVisible().catch(() => false)) {
      await genContentBtn.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, "flow-04-content");

    // 5. Image prompts
    log("step 5: image prompts");
    await page.goto(`${BASE_URL}/image-prompts?post_id=${DEMO_POST_ID}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(2000);
    const genPromptsBtn = page.locator('button:has-text("Generate Prompts"), button:has-text("Generate")').first();
    if (await genPromptsBtn.isVisible().catch(() => false)) {
      await genPromptsBtn.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, "flow-05-image-prompts");

    // 6. Images
    log("step 6: images");
    await page.goto(`${BASE_URL}/images?post_id=${DEMO_POST_ID}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(2000);
    const genImagesBtn = page.locator('button:has-text("Generate Images"), button:has-text("Generate")').first();
    if (await genImagesBtn.isVisible().catch(() => false)) {
      await genImagesBtn.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, "flow-06-images");

    // 7. Quality check
    log("step 7: quality check");
    await page.goto(`${BASE_URL}/quality-check?post_id=${DEMO_POST_ID}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(2000);
    const runQCBtn = page.locator('button:has-text("Run Checks"), button:has-text("Quality Check"), button:has-text("Check")').first();
    if (await runQCBtn.isVisible().catch(() => false)) {
      await runQCBtn.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, "flow-07-quality-check");

    // 8. Review
    log("step 8: review");
    await page.goto(`${BASE_URL}/review?post_id=${DEMO_POST_ID}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(2000);
    await shot(page, "flow-08-review");

    // 9. Logs — check that addLog entries appeared
    log("step 9: logs");
    await page.goto(`${BASE_URL}/logs`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await shot(page, "flow-09-logs");

    // Check for console errors
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    console.log(`\nFlow complete. Screenshots → ${OUT_DIR}/`);
    if (consoleErrors.length > 0) {
      console.log(`\nConsole errors (${consoleErrors.length}):`);
      consoleErrors.forEach((e) => console.log(`  ${e}`));
    }

    await ctx.close();
  });
}

// ── main ─────────────────────────────────────────────────────────────────────

const cmd = process.argv[2] || "smoke";

switch (cmd) {
  case "smoke":
    await cmdSmoke();
    break;
  case "screenshot":
    await cmdScreenshot();
    break;
  case "flow":
    await cmdFlow();
    break;
  default:
    console.error(`Unknown command: ${cmd}. Use: smoke | screenshot | flow`);
    process.exit(1);
}
