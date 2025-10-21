import { test, expect } from "@playwright/test";
import { mockAuthUser } from "../utils/auth";
import { mockVoiceCommand } from "../utils/voice";

test.describe("AI DJ Module E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await mockAuthUser(page);
    await page.goto("/ai-dj");
  });

  test("should handle voice commands correctly", async ({ page }) => {
    // Start session
    await page.getByRole("button", { name: "Start Session" }).click();
    await expect(page.getByText("Your AI DJ session has begun")).toBeVisible();

    // Mock voice command
    await mockVoiceCommand(page, "play something energetic");
    await expect(page.getByTestId("voice-command-status")).toContainText(
      "Listening...",
    );
    await expect(page.getByTestId("voice-command-transcript")).toContainText(
      "play something energetic",
    );

    // Verify command effect
    await expect(page.getByTestId("mood-settings")).toContainText("Energetic");
    await expect(page.getByTestId("now-playing")).toBeVisible();
  });

  test("should update track preferences and recommendations", async ({
    page,
  }) => {
    // Start session
    await page.getByRole("button", { name: "Start Session" }).click();

    // Play a track
    await page
      .getByTestId("track-list")
      .getByRole("button", { name: "Play" })
      .first()
      .click();
    await expect(page.getByTestId("now-playing")).toBeVisible();

    // Like the track
    await page.getByTestId("feedback-like").click();
    await expect(page.getByText("Thank you for your feedback")).toBeVisible();

    // Check recommendations update
    await page.getByRole("tab", { name: "Recommendations" }).click();
    await expect(page.getByTestId("recommendations-list")).toBeVisible();
  });

  test("should handle track transitions smoothly", async ({ page }) => {
    // Start session
    await page.getByRole("button", { name: "Start Session" }).click();

    // Play first track
    await page
      .getByTestId("track-list")
      .getByRole("button", { name: "Play" })
      .first()
      .click();
    await expect(page.getByTestId("now-playing")).toBeVisible();

    // Queue next track
    const tracks = page
      .getByTestId("track-list")
      .getByRole("button", { name: "Play" });
    await tracks.nth(1).click();
    await expect(page.getByText("Next Up")).toBeVisible();

    // Start transition
    await page.getByRole("button", { name: "Start Transition" }).click();
    await expect(page.getByText("Transitioning...")).toBeVisible();
    await expect(page.getByText("Transition complete")).toBeVisible();

    // Verify new track is playing
    const newTrackTitle = await tracks.nth(1).getAttribute("data-track-title");
    await expect(page.getByTestId("now-playing")).toContainText(
      newTrackTitle || "",
    );
  });

  test("should maintain user-level isolation", async ({ browser }) => {
    // Create two browser contexts for two users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Setup user 1
    await mockAuthUser(page1, "user1");
    await page1.goto("/ai-dj");
    await page1.getByRole("button", { name: "Start Session" }).click();

    // Setup user 2
    await mockAuthUser(page2, "user2");
    await page2.goto("/ai-dj");
    await page2.getByRole("button", { name: "Start Session" }).click();

    // User 1 creates a saved set
    await page1.getByRole("tab", { name: "Saved Sets" }).click();
    await page1.getByRole("button", { name: "Create Set" }).click();
    await page1.getByLabel("Set Name").fill("User 1 Set");
    await page1.getByRole("button", { name: "Save" }).click();

    // Verify user 2 cannot see user 1's set
    await page2.getByRole("tab", { name: "Saved Sets" }).click();
    await expect(page2.getByText("User 1 Set")).not.toBeVisible();

    // Cleanup
    await context1.close();
    await context2.close();
  });

  test("should monitor performance during complex operations", async ({
    page,
  }) => {
    // Start session
    await page.getByRole("button", { name: "Start Session" }).click();

    // Start performance monitoring
    const performanceEntries: PerformanceEntry[] = [];
    await page.evaluate(() => {
      performance.mark("complexOperationStart");
    });

    // Perform complex operations (transitions, mood changes, etc.)
    await page
      .getByTestId("track-list")
      .getByRole("button", { name: "Play" })
      .first()
      .click();
    await page.getByRole("tab", { name: "Recommendations" }).click();
    await mockVoiceCommand(page, "change mood to energetic");
    await page.getByRole("button", { name: "Start Transition" }).click();

    // End performance monitoring
    const metrics = await page.evaluate(() => {
      performance.mark("complexOperationEnd");
      performance.measure(
        "complexOperation",
        "complexOperationStart",
        "complexOperationEnd",
      );
      return performance.getEntriesByName("complexOperation")[0];
    });

    // Verify performance is within acceptable range
    expect(metrics.duration).toBeLessThan(5000); // 5 seconds max
  });
});
