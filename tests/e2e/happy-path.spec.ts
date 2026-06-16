import { test, expect } from "@playwright/test";

/**
 * E2E happy path: the full user journey from landing to settling a bet.
 * Runs against desktop, mobile-chrome, and mobile-safari projects.
 */

test.describe("Unauthenticated experience", () => {
  test("landing page loads and shows CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText(/money where your/i);
    await expect(page.getByRole("link", { name: "Create a bet" }).first()).toBeVisible();
  });

  test("login page renders form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[name="password"]')).toBeVisible();
  });

  test("register page has 18+ confirmation", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('[name="ageConfirm"]')).toBeVisible();
  });

  test("protected routes redirect to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Authenticated journey", () => {
  test.beforeEach(async ({ page }) => {
    // Visit landing to get CSRF cookie, then log in
    await page.goto("/");
    await page.goto("/login");
    await page.fill('[name="email"]', "josh@example.com");
    await page.fill('[name="password"]', "password");
    await Promise.all([
      page.waitForURL("**/dashboard"),
      page.getByRole("button", { name: /log in/i }).click(),
    ]);
  });

  test("dashboard shows groups", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(/Hey/i);
    // Should have at least one group from seed data
    await expect(page.getByText(/Saturday Squad|Flat 4B/i)).toBeVisible();
  });

  test("can navigate to a group", async ({ page }) => {
    await page.getByText(/Saturday Squad/i).first().click();
    await expect(page).toHaveURL(/\/groups\//);
    await expect(page.getByText(/Live bets|Settled|Members/i)).toBeVisible();
  });

  test("wallet shows balance and transactions", async ({ page }) => {
    await page.goto("/wallet");
    await expect(page.getByText(/Your balance/i)).toBeVisible();
    await expect(page.getByText(/£/i)).toBeVisible();
  });

  test("profile shows stats", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByText(/Your record/i)).toBeVisible();
    await expect(page.getByText(/Groups|Bets made|Bets entered|Wins/i)).toBeVisible();
  });

  test("can see profile editor and password change", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByText(/Edit profile/i)).toBeVisible();
    await expect(page.getByText(/Change password/i)).toBeVisible();
    await expect(page.getByText(/Danger zone/i)).toBeVisible();
  });
});

test.describe("Legal pages", () => {
  test("privacy policy loads", async ({ page }) => {
    await page.goto("/legal/privacy");
    await expect(page.locator("h1")).toContainText(/Privacy Policy/i);
  });

  test("terms of service loads", async ({ page }) => {
    await page.goto("/legal/terms");
    await expect(page.locator("h1")).toContainText(/Terms of Service/i);
  });

  test("responsible play loads with resources", async ({ page }) => {
    await page.goto("/legal/responsible-play");
    await expect(page.locator("h1")).toContainText(/Responsible Play/i);
    await expect(page.getByText(/GamCare/i)).toBeVisible();
  });
});
