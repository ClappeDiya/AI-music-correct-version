import { test, expect } from "@playwright/test";

test.describe("Registration Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Go to registration page
    await page.goto("http://localhost:3001/auth/register");
    // Wait for the form to be loaded
    await page.waitForSelector("form", { state: "visible", timeout: 10000 });
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    // Try to submit empty form
    await page.click('button:has-text("Create account")');

    // Wait for validation messages with increased timeout
    const messages = [
      "First name is required",
      "Last name is required",
      "Email is required",
      "Password is required",
    ];

    for (const message of messages) {
      try {
        await expect(page.getByText(message, { exact: false })).toBeVisible({
          timeout: 10000,
        });
      } catch (e) {
        console.error(`Failed to find validation message: ${message}`);
        throw e;
      }
    }
  });

  test("should validate password requirements", async ({ page }) => {
    // Fill form with valid data except password
    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Email address").fill("test.user@example.com");
    await page.getByLabel("Password").fill("weak");

    // Submit form
    await page.click('button:has-text("Create account")');

    // Wait for error messages with increased timeout
    const passwordRequirements = [
      "Password must be at least 8 characters",
      "Password must contain at least one uppercase letter",
      "Password must contain at least one number",
    ];

    for (const requirement of passwordRequirements) {
      try {
        await expect(page.getByText(requirement, { exact: false })).toBeVisible(
          { timeout: 10000 },
        );
      } catch (e) {
        console.error(`Failed to find password requirement: ${requirement}`);
        throw e;
      }
    }
  });

  test("should handle duplicate email registration", async ({ page }) => {
    const testEmail = `test.user.${Date.now()}@example.com`;
    console.log("Testing duplicate email registration with:", testEmail);

    // First registration
    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Email address").fill(testEmail);
    await page.getByLabel("Password").fill("TestUser123");

    // Enable request logging
    page.on("request", (request) => {
      if (request.url().includes("/register")) {
        console.log(`Request to ${request.url()}:`, request.postData());
      }
    });

    page.on("response", async (response) => {
      if (response.url().includes("/register")) {
        console.log(`Response from ${response.url()}:`, await response.json());
      }
    });

    await page.click('button:has-text("Create account")');

    // Wait for navigation or error
    try {
      await page.waitForURL("**/dashboard", { timeout: 10000 });
    } catch (e) {
      console.log("First registration navigation failed:", e);
      // Get any error messages on the page
      const errorText = await page.textContent(".error-message");
      console.log("Error message on page:", errorText);
    }

    // Go back to registration page
    await page.goto("http://localhost:3001/auth/register");
    await page.waitForSelector("form", { state: "visible", timeout: 10000 });

    // Try registering with same email
    await page.getByLabel("First Name").fill("Another");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Email address").fill(testEmail);
    await page.getByLabel("Password").fill("TestUser123");
    await page.click('button:has-text("Create account")');

    // Check for duplicate email error with increased timeout
    try {
      await expect(
        page.getByText("User with this email already exists", { exact: false }),
      ).toBeVisible({ timeout: 10000 });
    } catch (e) {
      console.error("Failed to find duplicate email error message");
      const pageContent = await page.content();
      console.log("Page content:", pageContent);
      throw e;
    }
  });

  test("should successfully register new user", async ({ page }) => {
    // Generate unique email
    const uniqueEmail = `test.user.${Date.now()}@example.com`;
    console.log("Testing registration with:", uniqueEmail);

    // Enable network logging
    page.on("request", (request) => {
      if (request.url().includes("/register")) {
        console.log(`Request to ${request.url()}:`, request.postData());
      }
    });

    page.on("response", async (response) => {
      if (response.url().includes("/register")) {
        try {
          const responseData = await response.json();
          console.log(`Response from ${response.url()}:`, responseData);
        } catch (e) {
          console.error("Failed to parse response:", e);
        }
      }
    });

    // Fill form with valid data
    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Email address").fill(uniqueEmail);
    await page.getByLabel("Password").fill("TestUser123");

    // Submit form and wait for navigation
    await page.click('button:has-text("Create account")');

    try {
      // Wait for loading state
      await expect(page.getByText("Creating account...")).toBeVisible({
        timeout: 10000,
      });

      // Wait for navigation with increased timeout
      await page.waitForURL("**/dashboard", { timeout: 30000 });

      // Verify we're on the dashboard
      await expect(page).toHaveURL(/.*dashboard/);
    } catch (e) {
      console.error("Registration failed:", e);
      // Get any error messages
      const errorText = await page.textContent(".error-message");
      console.log("Error message on page:", errorText);
      // Get the current URL
      console.log("Current URL:", page.url());
      throw e;
    }
  });

  test("should show loading state during submission", async ({ page }) => {
    const testEmail = `test.user.${Date.now()}@example.com`;
    console.log("Testing loading state with:", testEmail);

    // Fill form with valid data
    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Email address").fill(testEmail);
    await page.getByLabel("Password").fill("TestUser123");

    // Click submit button
    await page.click('button:has-text("Create account")');

    try {
      // Check for loading state with increased timeout
      await expect(page.getByText("Creating account...")).toBeVisible({
        timeout: 10000,
      });

      // Wait for navigation to complete
      await page.waitForURL("**/dashboard", { timeout: 30000 });
    } catch (e) {
      console.error("Loading state or navigation failed:", e);
      const pageContent = await page.content();
      console.log("Page content:", pageContent);
      throw e;
    }
  });
});
