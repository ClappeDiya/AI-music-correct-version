import { test, expect } from "@playwright/test";

// Test user credentials - keep in sync with backend
const TEST_USER = {
  email: "test@example.com",
  password: "TestPass123!",
  name: "Test User",
};

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Go to the login page before each test
    await page.goto("/auth/login");
  });

  test("should show validation errors for empty form submission", async ({
    page,
  }) => {
    // Click submit without entering any data
    await page.click('button[type="submit"]');

    // Check for validation messages
    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("should show error for invalid email format", async ({ page }) => {
    // Enter invalid email
    await page.fill('input[type="email"]', "invalid-email");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Check for validation message
    await expect(page.getByText("Invalid email format")).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    // Enter invalid credentials
    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });

  test("should successfully login with test user", async ({ page }) => {
    // Enter test user credentials
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Check for successful navigation to dashboard
    await expect(page).toHaveURL("/dashboard");

    // Check for success toast
    await expect(page.getByText("Successfully logged in")).toBeVisible();

    // Check user name is displayed
    await expect(
      page.getByText(`Welcome back, ${TEST_USER.name}`),
    ).toBeVisible();
  });

  test("should maintain authentication across page reloads", async ({
    page,
  }) => {
    // Login first
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard");

    // Reload page
    await page.reload();

    // Should still be on dashboard
    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByText(`Welcome back, ${TEST_USER.name}`),
    ).toBeVisible();
  });

  test("should successfully logout", async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard");

    // Click logout button
    await page.click('button:has-text("Logout")');

    // Should redirect to login page
    await expect(page).toHaveURL("/auth/login");

    // Try to access dashboard directly
    await page.goto("/dashboard");

    // Should redirect back to login
    await expect(page).toHaveURL("/auth/login");
  });
});
