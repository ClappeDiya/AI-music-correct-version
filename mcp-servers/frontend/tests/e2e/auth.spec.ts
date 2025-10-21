import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto("http://localhost:3000/auth/login");
    // Wait for the page to be fully loaded
    await page.waitForLoadState("networkidle");
  });

  test("should display login page", async ({ page }) => {
    // Verify the Sign In header and form elements are visible
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
  });

  test("should login in test mode and redirect to dashboard", async ({
    page,
  }) => {
    // Fill in the test credentials
    await page.getByPlaceholder("Email").fill("testuser@example.com");
    await page.getByPlaceholder("Password").fill("password123");

    // Get the form and submit button
    const form = page.locator("form");
    const submitButton = page.getByRole("button", { name: /Sign In/i });

    // Ensure form and button are visible
    await expect(form).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Click the button and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      submitButton.click(),
    ]);

    // Verify we're on the dashboard page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/dashboard/);

    // Wait for the welcome message
    await expect(page.getByText(/Welcome/)).toBeVisible();
  });

  test("should maintain authentication after page reload", async ({ page }) => {
    // Login first
    await page.getByPlaceholder("Email").fill("testuser@example.com");
    await page.getByPlaceholder("Password").fill("password123");

    // Submit and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      page.getByRole("button", { name: /Sign In/i }).click(),
    ]);

    // Verify initial navigation
    expect(page.url()).toMatch(/dashboard/);

    // Reload and wait for the page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Should still be on dashboard
    expect(page.url()).toMatch(/dashboard/);
    await expect(page.getByText(/Welcome/)).toBeVisible();
  });

  test("should verify backend authentication integration", async ({ page }) => {
    // Login first
    await page.getByPlaceholder("Email").fill("testuser@example.com");
    await page.getByPlaceholder("Password").fill("password123");

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      page.getByRole("button", { name: /Sign In/i }).click(),
    ]);

    // Verify we're on dashboard
    expect(page.url()).toMatch(/dashboard/);

    // Get the Clerk token from localStorage
    const token = await page.evaluate(() => {
      const session = window.localStorage.getItem("__clerk_client_jwt");
      return session ? JSON.parse(session) : null;
    });

    // First verify the token with our backend
    const verifyResponse = await page.evaluate(async (token) => {
      try {
        const res = await fetch(
          "http://localhost:8000/api/v1/auth/verify-clerk/",
          {
            method: "POST",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json().catch(() => ({}));
        return {
          status: res.status,
          ok: res.ok,
          data,
        };
      } catch (error) {
        return {
          error: error.message,
        };
      }
    }, token);

    // Verify the token verification response
    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.ok).toBe(true);

    // Now try to access the me endpoint
    const meResponse = await page.evaluate(async (token) => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/auth/me/", {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json().catch(() => ({}));
        return {
          status: res.status,
          ok: res.ok,
          data,
        };
      } catch (error) {
        return {
          error: error.message,
        };
      }
    }, token);

    // Verify the me endpoint response
    expect(meResponse.status).toBe(200);
    expect(meResponse.ok).toBe(true);
    expect(meResponse.data).toHaveProperty("email", "testuser@example.com");
  });
});
