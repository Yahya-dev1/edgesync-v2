import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const USER_EMAIL = process.env.TEST_USER_EMAIL!;
const USER_PASSWORD = process.env.TEST_USER_PASSWORD!;
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD!;

test.describe("Auth", () => {
  test("unauthenticated user visiting /dashboard is redirected to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test("unauthenticated user visiting /admin is redirected to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test("user can log in and is redirected to /dashboard", async ({ page }) => {
    await loginAs(page, USER_EMAIL, USER_PASSWORD);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("admin login redirects to /admin", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page).toHaveURL(/\/admin/);
  });

  test("user can register with email/password and is redirected to /dashboard", async ({ page }) => {
    const uniqueEmail = `test+${Date.now()}@mailinator.com`;
    await page.goto("/register");
    await page.getByPlaceholder("John Doe").fill("Test User");
    await page.getByPlaceholder("john@example.com").fill(uniqueEmail);
    await page.getByPlaceholder("Min. 8 characters").fill("TestPassword123!");
    await page.getByPlaceholder("Re-enter your password").fill("TestPassword123!");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
  });
});
