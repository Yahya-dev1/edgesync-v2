import { test, expect, type Page } from "@playwright/test";
import { loginAs } from "./helpers/auth";

const USER_EMAIL = process.env.TEST_USER_EMAIL!;
const USER_PASSWORD = process.env.TEST_USER_PASSWORD!;

// Click through the method selection screen to reach the amount entry step.
async function selectUsdt(page: Page) {
  await page.getByRole("button", { name: /Tether \(USDT TRC20\)/ }).click();
}

test.describe("Deposit", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, USER_EMAIL, USER_PASSWORD);
  });

  test("logged-in user can navigate to /dashboard/deposit and sees method selection", async ({ page }) => {
    await page.goto("/dashboard/deposit");
    await expect(page.getByRole("heading", { name: "Deposit Funds" })).toBeVisible();
    // All payment method cards are rendered
    await expect(page.getByRole("button", { name: /Tether \(USDT TRC20\)/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Bank Card/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Bitcoin/ })).toBeVisible();
  });

  test("entering an amount below the minimum shows a validation error", async ({ page }) => {
    await page.goto("/dashboard/deposit");
    await selectUsdt(page);
    await page.getByPlaceholder("0.00").fill("0");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Minimum deposit amount is $10.")).toBeVisible();
  });

  test("entering a valid amount progresses to payment instructions with wallet address and QR code", async ({ page }) => {
    // Mock the payment creation API so no real payment is initiated
    await page.route("**/api/create-payment", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          payment_id: "test-payment-e2e-001",
          pay_address: "TTestWalletAddressXXXXXXXXXXXXXXXXXXXXXXX",
          pay_amount: "50.00",
          pay_currency: "usdttrc20",
        }),
      });
    });

    await page.goto("/dashboard/deposit");
    await selectUsdt(page);
    await page.getByPlaceholder("0.00").fill("50");
    await page.getByRole("button", { name: "Continue" }).click();

    // Should advance to the payment step
    await expect(page.getByRole("heading", { name: "Complete Payment" })).toBeVisible({ timeout: 10_000 });
    // Wallet address is rendered as mono text
    await expect(page.getByText("TTestWalletAddressXXXXXXXXXXXXXXXXXXXXXXX")).toBeVisible();
    // QR code SVG is rendered by qrcode.react
    await expect(page.locator("svg").first()).toBeVisible();
    // Network badge
    await expect(page.getByText("USDT TRC20")).toBeVisible();
  });
});
