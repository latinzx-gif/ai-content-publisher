import { test, expect } from "@playwright/test";

const PROTECTED_ROUTES = [
  "/publisher/create",
  "/publisher/briefs",
  "/publisher/rules",
  "/publisher/content-generation",
  "/publisher/image-prompts",
  "/publisher/images",
  "/publisher/quality-check",
  "/publisher/review",
  "/publisher/calendar",
  "/publisher/publishing",
  "/publisher",
  "/publisher/logs",
];

test.describe("Publisher auth gate", () => {
  test("login page is public", async ({ page }) => {
    const res = await page.goto("/publisher/login");
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: /Sign in or create account/i })).toBeVisible();
  });

  for (const route of PROTECTED_ROUTES) {
    test(`redirects anonymous ${route} to login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/publisher\/login/);
    });
  }
});
