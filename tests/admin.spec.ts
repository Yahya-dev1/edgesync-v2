import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const USER_EMAIL = process.env.TEST_USER_EMAIL!;
const USER_PASSWORD = process.env.TEST_USER_PASSWORD!;
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD!;

test.describe("Admin — access control", () => {
  test("non-admin user visiting /admin is redirected to /dashboard", async ({ page }) => {
    await loginAs(page, USER_EMAIL, USER_PASSWORD);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });
});

test.describe("Admin — panel pages", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test("admin can view trades table at /admin/trades", async ({ page }) => {
    await page.goto("/admin/trades");
    await expect(page.getByRole("heading", { name: "Master Trades" })).toBeVisible();
    // Table header columns are visible
    await expect(page.getByRole("columnheader", { name: "Symbol" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Direction" })).toBeVisible();
  });

  test("admin can open new trade modal and see form fields", async ({ page }) => {
    await page.goto("/admin/trades");
    await page.getByRole("button", { name: "New trade" }).click();
    // Modal opens with the "New trade" heading
    await expect(page.getByRole("heading", { name: "New trade" })).toBeVisible();
    // Form fields present
    await expect(page.getByPlaceholder("e.g. EURUSD")).toBeVisible();
    await expect(page.getByPlaceholder("1.08500")).toBeVisible();
    await expect(page.getByPlaceholder("2.5")).toBeVisible();
  });

  test("admin can view users table at /admin/users", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Email" })).toBeVisible();
  });

  test("admin can view withdrawals table at /admin/withdrawals", async ({ page }) => {
    await page.goto("/admin/withdrawals");
    await expect(page.getByRole("heading", { name: "Withdrawals" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "User" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Wallet Address" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
  });
});
