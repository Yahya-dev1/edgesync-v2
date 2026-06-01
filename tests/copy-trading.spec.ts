import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const USER_EMAIL = process.env.TEST_USER_EMAIL!;
const USER_PASSWORD = process.env.TEST_USER_PASSWORD!;

test.describe("Copy Trading", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, USER_EMAIL, USER_PASSWORD);
  });

  test("user can navigate to /dashboard/copy-trading", async ({ page }) => {
    await page.goto("/dashboard/copy-trading");
    await expect(page.getByRole("heading", { name: "Choose a master trader" })).toBeVisible();
  });

  test("AmiinFx card is visible with Copy button enabled", async ({ page }) => {
    await page.goto("/dashboard/copy-trading");
    // AmiinFx card: look for the trader name and the enabled Copy button
    const copyBtn = page.getByRole("button", { name: "Copy AmiinFx" });
    await expect(copyBtn).toBeVisible({ timeout: 10_000 });
    await expect(copyBtn).toBeEnabled();
  });

  test("other trader cards show geo-restricted badge with disabled button", async ({ page }) => {
    await page.goto("/dashboard/copy-trading");
    // Wait for the grid to load
    await expect(page.getByText("AmiinFx", { exact: true })).toBeVisible({ timeout: 10_000 });
    // At least one geo-restricted badge and one disabled "Not available" button should exist
    await expect(page.getByText("Geo restricted").first()).toBeVisible();
    const disabledBtn = page.getByRole("button", { name: "Not available" }).first();
    await expect(disabledBtn).toBeVisible();
    await expect(disabledBtn).toBeDisabled();
  });

  test("clicking Copy AmiinFx redirects to /dashboard and shows copying state", async ({ page }) => {
    await page.goto("/dashboard/copy-trading");
    await expect(page.getByText("AmiinFx", { exact: true })).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Copy AmiinFx" }).click();

    // The handler does window.location.href = '/dashboard', so wait for navigation
    await page.waitForURL(/\/dashboard$/, { timeout: 20_000 });

    // In copying state the dashboard renders the LiveDashboard with "Copying" panel
    await expect(page.getByText("Live — copying active")).toBeVisible({ timeout: 15_000 });
  });
});
