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
    await page.getByRole("button", { name: "Sign in" }).click();

    // Check for validation messages
    const emailInput = page.getByLabel("Email address");
    const passwordInput = page.getByLabel("Password");

    await expect(emailInput).toHaveAttribute("aria-invalid", "true");
    await expect(passwordInput).toHaveAttribute("aria-invalid", "true");
  });

  test("should handle invalid login credentials", async ({ page }) => {
    await page.goto("/auth/login");

    // Fill in invalid credentials
    await page.getByLabel("Email address").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Check for error message
    const errorMessage = page.getByText("Login failed");
    await expect(errorMessage).toBeVisible();
  });

  test("should successfully register a new user", async ({ page }) => {
    await page.goto("/auth/register");

    // Fill in registration form
    await page.getByLabel("Name").fill(TEST_USER.name);
    await page.getByLabel("Email address").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Register" }).click();

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL("/dashboard");

    // Verify user is logged in
    const userMenu = page.getByTestId("user-menu");
    await expect(userMenu).toBeVisible();
    await expect(userMenu).toContainText(TEST_USER.name);
  });

  test("should successfully login with valid credentials", async ({ page }) => {
    await page.goto("/auth/login");

    // Fill in login form with valid credentials
    await page.getByLabel("Email address").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL("/dashboard");

    // Verify user is logged in
    const userMenu = page.getByTestId("user-menu");
    await expect(userMenu).toBeVisible();
    await expect(userMenu).toContainText(TEST_USER.name);
  });

  test("should successfully logout", async ({ page }) => {
    // First login
    await page.goto("/auth/login");
    await page.getByLabel("Email address").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    // Click logout button in user menu
    await page.getByTestId("user-menu").click();
    await page.getByRole("button", { name: "Logout" }).click();

    // Should redirect to home page
    await expect(page).toHaveURL("/");

    // Verify user is logged out by checking login link is visible
    const loginLink = page.getByRole("link", { name: "Login" });
    await expect(loginLink).toBeVisible();
  });

  test("should handle session expiry", async ({ page }) => {
    // Login first
    await page.goto("/auth/login");
    await page.getByLabel("Email address").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign in" }).click();

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
    await page.getByLabel("Email address").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    // Reload the page
    await page.reload();

    // Verify still on dashboard and logged in
    await expect(page).toHaveURL("/dashboard");
    const userMenu = page.getByTestId("user-menu");
    await expect(userMenu).toBeVisible();
  });
});
