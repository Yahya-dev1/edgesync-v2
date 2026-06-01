import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const USER_EMAIL = process.env.TEST_USER_EMAIL!;
const USER_PASSWORD = process.env.TEST_USER_PASSWORD!;

// Ensure the test user is in an active copying state before dashboard tests run.
// Clicking Copy AmiinFx is idempotent — existing active rows are deactivated first.
async function ensureCopying(page: import("@playwright/test").Page) {
  await page.goto("/dashboard/copy-trading");
  await page.getByRole("button", { name: "Copy AmiinFx" }).waitFor({ state: "visible", timeout: 10_000 });
  await page.getByRole("button", { name: "Copy AmiinFx" }).click();
  await page.waitForURL(/\/dashboard$/, { timeout: 20_000 });
}

test.describe("Dashboard (copying active)", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAs(page, USER_EMAIL, USER_PASSWORD);
    await ensureCopying(page);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, USER_EMAIL, USER_PASSWORD);
    await page.goto("/dashboard");
    // Wait for copying state to render
    await expect(page.getByText("Live — copying active")).toBeVisible({ timeout: 15_000 });
  });

  test("Balance card, P&L card, and Copied Trades card are visible", async ({ page }) => {
    await expect(page.getByText("Account Balance")).toBeVisible();
    await expect(page.getByText("P&L")).toBeVisible();
    await expect(page.getByText("Copied Trades")).toBeVisible();
  });

  test("copied trades list renders when trades exist", async ({ page }) => {
    // The "Copied Trades" panel heading is visible
    await expect(
      page.getByText("Copied Trades", { exact: false }).first()
    ).toBeVisible();
    // Either trades list or "No trades yet" placeholder — both are valid render states
    const hasTrades = await page.locator("text=No trades yet").isVisible().then((v) => !v);
    if (hasTrades) {
      // Trades rendered: at least one trade row with a symbol and direction visible
      await expect(page.locator("[class*='space-y-3'] > div").first()).toBeVisible();
    } else {
      await expect(page.getByText("No trades yet")).toBeVisible();
    }
  });

  test("Stop copying button is visible when copying is active", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Stop copying" })).toBeVisible();
  });
});
