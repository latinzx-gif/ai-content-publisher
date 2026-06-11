import fs from "node:fs";
import path from "node:path";

import { test, expect } from "@playwright/test";

const authFile = path.join(__dirname, "../playwright/.auth/publisher.json");
const hasAuth = fs.existsSync(authFile);

test.describe("Publisher full workflow (create → publish)", () => {
  test.skip(!hasAuth, "Requires playwright/.auth/publisher.json");

  test.describe.configure({ mode: "serial", timeout: 300_000 });

  test("runs create through publish with agent pipeline", async ({ page }) => {
    const topic = `E2E workflow ${Date.now()}`;

    await page.goto("/publisher/create");
    const main = page.locator("main");

    await main.getByPlaceholder("Describe the single post topic.").fill(topic);
    await main
      .locator("label")
      .filter({ has: page.getByText("Brand", { exact: true }) })
      .getByRole("combobox")
      .selectOption("Head Office");
    await main
      .locator("label")
      .filter({ has: page.getByText("Platform", { exact: true }) })
      .getByRole("combobox")
      .selectOption("Facebook");

    await main.getByRole("button", { name: "Continue to Brief Builder" }).click();
    await expect(page.getByRole("heading", { name: "Brief Builder" })).toBeVisible({
      timeout: 15_000,
    });

    const postId = new URL(page.url()).searchParams.get("post_id");
    expect(postId).toBeTruthy();

    await main.getByRole("button", { name: "Generate", exact: true }).click();
    await expect(main.getByText("Editable brief")).toBeVisible({ timeout: 90_000 });
    await main.getByRole("button", { name: "Save", exact: true }).click();
    await expect(main.getByText(`Brief saved to ${postId}.`)).toBeVisible({
      timeout: 15_000,
    });

    await page.goto(`/publisher/rules?post_id=${postId}`);
    await expect(page.getByRole("heading", { name: "Rules" })).toBeVisible();
    await main.getByRole("button", { name: "Load Rules" }).click();
    await main.getByRole("button", { name: "Save", exact: true }).click();
    await expect(main.getByText(`Rules saved to ${postId}.`)).toBeVisible({
      timeout: 15_000,
    });

    await page.goto(`/publisher/content-generation?post_id=${postId}`);
    await expect(page.getByRole("heading", { name: "Content Generation" })).toBeVisible();
    await main.getByRole("button", { name: "Generate", exact: true }).click();
    await expect(main.getByRole("button", { name: "Regenerate" }).first()).toBeVisible({
      timeout: 120_000,
    });
    await main.locator("button", { hasText: "Save" }).first().click();
    await expect(main.getByText(`Content saved to ${postId}.`)).toBeVisible({
      timeout: 15_000,
    });

    await page.goto(`/publisher/review?post_id=${postId}`);
    await expect(page.getByRole("heading", { name: "Review & Editing" })).toBeVisible({
      timeout: 15_000,
    });

    await main.getByRole("button", { name: "Save Requirement" }).click();
    await expect(main.getByText("Review requirement saved.")).toBeVisible({
      timeout: 15_000,
    });

    const pipelineDone = main.getByText(
      /Auto workflow completed|queued for publish|Auto workflow completed and queued/i
    );
    const pipelineRunning = main.getByRole("button", { name: "Run Agent Pipeline" });

    if (!(await pipelineDone.isVisible({ timeout: 5_000 }).catch(() => false))) {
      await pipelineRunning.click();
    }

    await expect(pipelineDone).toBeVisible({ timeout: 180_000 });

    await page.goto("/publisher/publishing");
    await expect(page.getByRole("heading", { name: "Publishing" })).toBeVisible({
      timeout: 30_000,
    });
    const postCard = main.filter({ hasText: postId! });
    await expect(postCard).toBeVisible({ timeout: 30_000 });

    await postCard.getByRole("button", { name: "Publish Now" }).click();
    await expect(postCard.getByText(/published|MOCK|Buffer/i)).toBeVisible({
      timeout: 60_000,
    });
  });
});
