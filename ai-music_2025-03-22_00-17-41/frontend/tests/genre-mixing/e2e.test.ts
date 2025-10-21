import { test, expect } from "@playwright/test";
import { mockAuthUser, mockTrackReference } from "../mocks/data";

test.describe("Genre Mixing Module E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await mockAuthUser(page);
    await page.goto("/genre-mixing");
  });

  test("should load genre mixing interface correctly", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Genre Mixing" }),
    ).toBeVisible();
    await expect(page.getByTestId("genre-sliders")).toBeVisible();
    await expect(page.getByTestId("playback-controls")).toBeVisible();
  });

  test("should adjust genre weights and generate mix", async ({ page }) => {
    // Adjust genre sliders
    const jazzSlider = page.getByTestId("genre-slider-jazz");
    const rockSlider = page.getByTestId("genre-slider-rock");

    await jazzSlider.fill("0.7");
    await rockSlider.fill("0.3");

    // Generate mix
    await page.getByRole("button", { name: "Generate Mix" }).click();

    // Verify loading state
    await expect(page.getByTestId("mixing-progress")).toBeVisible();

    // Wait for generation to complete
    await expect(page.getByTestId("playback-controls")).toBeVisible();
    await expect(page.getByTestId("waveform-display")).toBeVisible();
  });

  test("should save and share mixed track", async ({ page }) => {
    // Mock successful mix generation
    await mockTrackReference(page);

    // Open save dialog
    await page.getByRole("button", { name: "Save Mix" }).click();

    // Fill save form
    await page.getByLabel("Title").fill("My Jazz-Rock Fusion");
    await page
      .getByLabel("Description")
      .fill("A blend of jazz and rock elements");
    await page.getByLabel("Tags").fill("jazz,rock,fusion");
    await page.getByLabel("Public").click();

    // Save track
    await page.getByRole("button", { name: "Save" }).click();

    // Verify success message
    await expect(page.getByText("Track saved successfully")).toBeVisible();

    // Verify track appears in saved tracks list
    await page.goto("/tracks");
    await expect(page.getByText("My Jazz-Rock Fusion")).toBeVisible();
  });

  test("should handle concurrent user sessions correctly", async ({
    browser,
  }) => {
    // Create two browser contexts for different users
    const userContext1 = await browser.newContext();
    const userContext2 = await browser.newContext();

    const page1 = await userContext1.newPage();
    const page2 = await userContext2.newPage();

    // Mock different user authentications
    await mockAuthUser(page1, { id: "user1" });
    await mockAuthUser(page2, { id: "user2" });

    // Navigate both users to genre mixing
    await page1.goto("/genre-mixing");
    await page2.goto("/genre-mixing");

    // User 1 creates mix
    await page1.getByTestId("genre-slider-jazz").fill("0.8");
    await page1.getByRole("button", { name: "Generate Mix" }).click();

    // User 2 creates different mix
    await page2.getByTestId("genre-slider-rock").fill("0.9");
    await page2.getByRole("button", { name: "Generate Mix" }).click();

    // Verify each user sees their own mix
    await expect(page1.getByTestId("mix-preview")).toHaveAttribute(
      "data-user",
      "user1",
    );
    await expect(page2.getByTestId("mix-preview")).toHaveAttribute(
      "data-user",
      "user2",
    );
  });

  test("should enforce security measures", async ({ page }) => {
    // Try to access another user's private mix
    await page.goto("/tracks/private-mix-123");
    await expect(
      page.getByText("Track not found or inaccessible"),
    ).toBeVisible();

    // Verify reCAPTCHA on rapid mix generation
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Generate Mix" }).click();
    }
    await expect(page.getByTestId("recaptcha-challenge")).toBeVisible();
  });

  test("should maintain performance under load", async ({ page }) => {
    // Enable performance monitoring
    await page.evaluate(() => {
      window.performance.mark("test-start");
    });

    // Generate multiple mixes in succession
    for (let i = 0; i < 3; i++) {
      await page.getByTestId("genre-slider-jazz").fill(String(Math.random()));
      await page.getByTestId("genre-slider-rock").fill(String(Math.random()));
      await page.getByRole("button", { name: "Generate Mix" }).click();
      await expect(page.getByTestId("waveform-display")).toBeVisible();
    }

    // Check performance metrics
    const metrics = await page.evaluate(() => {
      window.performance.mark("test-end");
      const measure = window.performance.measure(
        "test-duration",
        "test-start",
        "test-end",
      );
      return {
        duration: measure.duration,
        responseTime: performance
          .getEntriesByType("resource")
          .filter((entry) => entry.name.includes("/api/mix"))
          .map((entry) => entry.duration),
      };
    });

    // Verify performance meets requirements
    expect(metrics.duration).toBeLessThan(10000); // Total test under 10s
    metrics.responseTime.forEach((time) => {
      expect(time).toBeLessThan(2000); // Each API call under 2s
    });
  });

  test("should handle version control correctly", async ({ page }) => {
    // Create initial mix
    await page.getByTestId("genre-slider-jazz").fill("0.6");
    await page.getByRole("button", { name: "Generate Mix" }).click();
    await page.getByRole("button", { name: "Save Mix" }).click();
    await page.getByLabel("Title").fill("Version Test Mix");
    await page.getByRole("button", { name: "Save" }).click();

    // Create second version
    await page.getByTestId("genre-slider-jazz").fill("0.8");
    await page.getByRole("button", { name: "Generate Mix" }).click();
    await page.getByRole("button", { name: "Save Version" }).click();

    // Verify version history
    await page.goto("/tracks");
    await page.getByText("Version Test Mix").click();
    await expect(page.getByText("Version 1")).toBeVisible();
    await expect(page.getByText("Version 2")).toBeVisible();

    // Switch versions
    await page.getByText("Version 1").click();
    await expect(page.getByTestId("genre-slider-jazz")).toHaveValue("0.6");

    await page.getByText("Version 2").click();
    await expect(page.getByTestId("genre-slider-jazz")).toHaveValue("0.8");
  });
});
