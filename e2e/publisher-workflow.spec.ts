import fs from "node:fs";
import path from "node:path";

import { test, expect } from "@playwright/test";

import { PUBLISHER_WORKFLOW_STEPS } from "./publisher-steps";

const authFile = path.join(__dirname, "../playwright/.auth/publisher.json");
const hasAuth = fs.existsSync(authFile);
const postId =
  process.env.E2E_PUBLISHER_POST_ID ?? `e2e-${Date.now().toString(36)}`;

test.describe("Publisher 12-step route smoke (authenticated)", () => {
  test.skip(!hasAuth, "Save auth state to playwright/.auth/publisher.json (see docs/runbooks/PUBLISHER_E2E.md)");

  test.describe.configure({ mode: "serial" });

  for (const step of PUBLISHER_WORKFLOW_STEPS) {
    test(`step ${step.index}: ${step.name}`, async ({ page }) => {
      const url = step.path(postId);
      const res = await page.goto(url);
      expect(res?.status()).toBeLessThan(400);
      await expect(page.getByRole("heading", { name: step.heading })).toBeVisible({
        timeout: 15_000,
      });
    });
  }

  test("create page saves local draft", async ({ page }) => {
    await page.goto("/publisher/create");
    await expect(page.getByRole("heading", { name: "Create" })).toBeVisible();

    await page.getByPlaceholder("Describe the single post topic.").fill("E2E smoke topic");
    await page.getByLabel("Brand").selectOption("Head Office");
    await page.getByLabel("Platform").selectOption("Facebook");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Draft saved locally.")).toBeVisible();
  });
});
