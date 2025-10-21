import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Test data
const validUser = {
  email: "test@example.com",
  password: "validPassword123!",
  name: "Test User",
};

const testCases = {
  validLogin: {
    email: validUser.email,
    password: validUser.password,
    expectedRedirect: "/dashboard",
  },
  invalidEmail: {
    email: "invalid-email",
    password: validUser.password,
    expectedError: "Invalid email format",
  },
  invalidPassword: {
    email: validUser.email,
    password: "wrong",
    expectedError: "Login failed",
  },
  emptyFields: {
    email: "",
    password: "",
    expectedErrors: ["Email is required", "Password is required"],
  },
};

interface MockResponse {
  status: number;
  body: any;
}

async function setupMockApi(page: Page) {
  // Mock common API responses
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: null }),
    });
  });

  await page.route("**/api/auth/_log", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  // Mock login API
  await page.route("**/api/auth/login", async (route) => {
    const request = route.request();
    interface LoginBody {
      email?: string;
      password?: string;
    }
    let body: LoginBody = {};
    try {
      const postData = await request.postData();
      body = postData ? JSON.parse(postData) : {};
    } catch (e) {
      console.error("Failed to parse request body:", e);
    }

    if (
      body.email === validUser.email &&
      body.password === validUser.password
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "Set-Cookie": "next-auth.session-token=mock-token; Path=/; HttpOnly",
        },
        body: JSON.stringify({
          success: true,
          user: {
            id: "1",
            email: validUser.email,
            name: validUser.name,
            is_staff: true,
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "Login failed",
        }),
      });
    }
  });

  // Mock dashboard page
  await page.route("**/dashboard", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body><h1>Dashboard</h1></body></html>",
    });
  });
}

test.describe("Login Flow", () => {
  let cleanup: (() => Promise<void>)[] = [];

  test.beforeEach(async ({ page }) => {
    // Clear any previous cleanup tasks
    cleanup = [];

    // Setup route handlers
    await setupMockApi(page);

    // Add cleanup for any route handlers
    cleanup.push(async () => {
      await page.unrouteAll();
    });

    // Navigate and wait for initial load using full URL
    await page.goto("http://localhost:3000/auth/login", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
  });

  test.afterEach(async () => {
    // Run all cleanup tasks
    for (const task of cleanup) {
      await task();
    }
  });

  test("should show login form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("should show validation errors for empty form submission", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Sign in" }).click();

    for (const error of testCases.emptyFields.expectedErrors) {
      await expect(page.getByText(error)).toBeVisible();
    }
  });

  test("should show error for invalid email format", async ({ page }) => {
    await page.getByLabel("Email address").fill(testCases.invalidEmail.email);
    await page.getByLabel("Password").fill(testCases.invalidEmail.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(
      page.getByText(testCases.invalidEmail.expectedError),
    ).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page
      .getByLabel("Email address")
      .fill(testCases.invalidPassword.email);
    await page.getByLabel("Password").fill(testCases.invalidPassword.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    // Check for error in the form (role="alert")
    await expect(
      page
        .getByRole("alert")
        .getByText(testCases.invalidPassword.expectedError),
    ).toBeVisible();
  });

  test("should successfully login with valid credentials", async ({ page }) => {
    // Fill form fields
    await page.getByLabel("Email address").fill(testCases.validLogin.email);
    await page.getByLabel("Password").fill(testCases.validLogin.password);

    // Wait for both the API response and status message
    const [loginResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/auth/login") &&
          response.request().method() === "POST",
      ),
      page.getByRole("button", { name: "Sign in" }).click(),
    ]);

    // Verify API response
    const responseData = await loginResponse.json();
    expect(responseData.success).toBeTruthy();

    // Check for success toast with retry
    await expect(async () => {
      const status = await page.getByRole("status").textContent();
      expect(status).toContain("Successfully logged in");
    }).toPass({ timeout: 5000 });

    // Wait for navigation to complete and verify URL
    await expect(async () => {
      expect(page.url()).toMatch(/.*\/dashboard$/);
    }).toPass({ timeout: 5000 });
  });

  test("should navigate to registration page", async ({ page }) => {
    // Mock the registration page route
    await page.route("/auth/register", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body>Registration Page</body></html>",
      });
    });

    // Setup navigation promise before clicking
    const navigationPromise = page.waitForNavigation();

    // Click the registration link
    await page.getByText("Create one").click();

    // Wait for navigation to complete
    await navigationPromise;

    // Verify URL
    expect(page.url()).toContain("/auth/register");
  });
});
