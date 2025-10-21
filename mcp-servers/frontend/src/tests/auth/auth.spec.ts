import { test, expect } from "@playwright/test";

// Test data
const TEST_USER = {
  name: "Test User",
  email: "test@example.com",
  password: "TestPassword123!",
};

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Start from a clean slate - go to home page
    await page.goto("/");
  });

  test("should show validation errors for invalid inputs", async ({ page }) => {
    // Navigate to login page
    await page.goto("/auth/login");

    // Try to submit empty form
    await page.getByRole("button", { name: /sign in/i }).click();

    // Check for validation messages
    const emailInput = page.getByRole("textbox", { name: /email/i });
    const passwordInput = page.getByLabel(/password/i);

    // HTML5 validation will show
    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
    await expect(passwordInput).toHaveAttribute("aria-invalid", "true");
  });

  test("should handle invalid login credentials", async ({ page }) => {
    await page.goto("/auth/login");

    // Fill in invalid credentials
    await page
      .getByRole("textbox", { name: /email/i })
      .fill("wrong@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Check for error message in toast
    const errorToast = page.getByRole("alert");
    await expect(errorToast).toBeVisible();
    await expect(errorToast).toContainText(/login failed/i);
  });

  test("should successfully register a new user", async ({ page }) => {
    await page.goto("/auth/register");

    // Fill in registration form
    await page.getByRole("textbox", { name: /name/i }).fill(TEST_USER.name);
    await page.getByRole("textbox", { name: /email/i }).fill(TEST_USER.email);
    await page.getByLabel(/^password$/i).fill(TEST_USER.password);
    await page.getByLabel(/confirm password/i).fill(TEST_USER.password);
    await page.getByRole("button", { name: /create account/i }).click();

    // Should show success toast
    const successToast = page.getByRole("alert");
    await expect(successToast).toBeVisible();
    await expect(successToast).toContainText(/account created successfully/i);

    // Should redirect to login
    await expect(page).toHaveURL("/auth/login");
  });

  test("should successfully login with valid credentials", async ({ page }) => {
    await page.goto("/auth/login");

    // Fill in login form with valid credentials
    await page.getByRole("textbox", { name: /email/i }).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill(TEST_USER.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL("/dashboard");

    // Verify user is logged in by checking user menu
    const userButton = page.getByRole("button", { name: TEST_USER.name });
    await expect(userButton).toBeVisible();
  });

  test("should successfully logout", async ({ page }) => {
    // First login
    await page.goto("/auth/login");
    await page.getByRole("textbox", { name: /email/i }).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill(TEST_USER.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    // Click user menu and logout
    await page.getByRole("button", { name: TEST_USER.name }).click();
    await page.getByRole("menuitem", { name: /logout/i }).click();

    // Should redirect to home page
    await expect(page).toHaveURL("/");

    // Verify user is logged out by checking login button is visible
    const loginButton = page.getByRole("link", { name: /sign in/i });
    await expect(loginButton).toBeVisible();
  });

  test("should handle session expiry", async ({ page }) => {
    // Login first
    await page.goto("/auth/login");
    await page.getByRole("textbox", { name: /email/i }).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill(TEST_USER.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    // Simulate token expiry by modifying localStorage
    await page.evaluate(() => {
      localStorage.removeItem("accessToken");
    });

    // Try to access protected route
    await page.goto("/dashboard");

    // Should redirect to login page
    await expect(page).toHaveURL("/auth/login");
  });

  test("should maintain authentication state across page reloads", async ({
    page,
  }) => {
    // Login first
    await page.goto("/auth/login");
    await page.getByRole("textbox", { name: /email/i }).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill(TEST_USER.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    // Reload the page
    await page.reload();

    // Verify still on dashboard and logged in
    await expect(page).toHaveURL("/dashboard");
    const userButton = page.getByRole("button", { name: TEST_USER.name });
    await expect(userButton).toBeVisible();
  });
});
