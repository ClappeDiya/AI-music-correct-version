import { test, expect } from "@playwright/test";

const TEST_USER = {
  email: "test@example.com",
  password: "TestPass123!",
  name: "Test User",
};

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Go to the login page before each test
    await page.goto("http://localhost:3000/auth/login");
  });

  test("should show validation errors for empty form submission", async ({
    page,
  }) => {
    // Click the submit button without filling the form
    await page.getByRole("button", { name: "Sign in" }).click();

    // Check for validation messages
    const emailError = page.getByText("Email is required");
    const passwordError = page.getByText("Password is required");

    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });

  test("should show error for invalid email format", async ({ page }) => {
    // Fill in invalid email
    await page.getByLabel("Email address").fill("invalid-email");
    await page.getByLabel("Password").fill("password123");

    // Submit form
    await page.getByRole("button", { name: "Sign in" }).click();

    // Check for validation message
    const emailError = page.getByText("Invalid email format");
    await expect(emailError).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    // Fill in valid format but wrong credentials
    await page.getByLabel("Email address").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");

    // Submit form
    await page.getByRole("button", { name: "Sign in" }).click();

    // Check for error message
    const errorAlert = page.getByRole("alert");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText("Invalid credentials");
  });

  test("should successfully login with test credentials", async ({ page }) => {
    // Fill in test user credentials
    await page.getByLabel("Email address").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);

    // Submit form
    await page.getByRole("button", { name: "Sign in" }).click();

    // Wait for navigation to dashboard
    await page.waitForURL("**/dashboard");

    // Verify we're on the dashboard page
    expect(page.url()).toContain("/dashboard");
  });

  test("should navigate to registration page", async ({ page }) => {
    // Click the registration link
    await page.getByRole("button", { name: "Create one" }).click();

    // Verify we're on the registration page
    await expect(page).toHaveURL("/auth/register");
  });

  test("should maintain authentication state across page reloads", async ({
    page,
    context,
  }) => {
    // Login first
    await page.getByLabel("Email address").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    // Wait for navigation to dashboard
    await page.waitForURL("**/dashboard");

    // Reload the page
    await page.reload();

    // Should still be on dashboard
    await expect(page).toHaveURL("/dashboard");
  });

  test("should handle session expiry", async ({ page, context }) => {
    // Login first
    await page.getByLabel("Email address").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    // Wait for navigation to dashboard
    await page.waitForURL("**/dashboard");

    // Clear cookies to simulate session expiry
    await context.clearCookies();

    // Try to access dashboard
    await page.goto("http://localhost:3000/dashboard");

    // Should redirect to login page with redirect parameter
    await expect(page.url()).toContain("/auth/login?redirect=/dashboard");
  });

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
