import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("Test login flow in test mode", async ({ page }) => {
    // Navigate to the login page
    await page.goto("http://localhost:3000/auth/login");

    // Verify the Sign In header is visible
    await expect(page.locator("text=Sign In")).toBeVisible();

    // Fill in the email and password fields
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");

    // Submit the form
    await page.click('button[type="submit"]');

    // Verify redirection to /dashboard
    await expect(page).toHaveURL(/dashboard/);
  });
});
