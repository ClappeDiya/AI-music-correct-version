import { Page } from "@playwright/test";

interface MockUser {
  id: string;
  name?: string;
  email?: string;
}

export async function mockAuthUser(page: Page, user: Partial<MockUser> = {}) {
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        user: {
          id: user.id || "test-user-id",
          name: user.name || "Test User",
          email: user.email || "test@example.com",
        },
      }),
    });
  });
}

export async function mockTrackReference(page: Page) {
  await page.route("**/api/mix/generate", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        id: "test-mix-id",
        audioUrl: "https://example.com/test-mix.mp3",
        duration: 180,
      }),
    });
  });

  await page.route("**/api/track-references", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        body: JSON.stringify({
          id: "test-reference-id",
          originalTrackId: "test-mix-id",
          moduleType: "genre_mixing",
          moduleId: "test-module-id",
          userId: "test-user-id",
          versions: [
            {
              id: "test-version-id",
              version: 1,
              createdAt: new Date().toISOString(),
              changes: "Initial version",
              userId: "test-user-id",
            },
          ],
          currentVersion: 1,
          metadata: {
            title: "Test Mix",
            description: "Test description",
            tags: ["test", "mix"],
            visibility: "public",
          },
        }),
      });
    } else {
      await route.continue();
    }
  });
}

export const mockTrackData = {
  id: "test-reference-id",
  originalTrackId: "test-mix-id",
  moduleType: "genre_mixing",
  moduleId: "test-module-id",
  userId: "test-user-id",
  versions: [
    {
      id: "test-version-id-1",
      version: 1,
      createdAt: "2024-01-01T00:00:00Z",
      changes: "Initial version",
      userId: "test-user-id",
    },
    {
      id: "test-version-id-2",
      version: 2,
      createdAt: "2024-01-02T00:00:00Z",
      changes: "Updated mix",
      userId: "test-user-id",
    },
  ],
  currentVersion: 2,
  metadata: {
    title: "Test Mix",
    description: "Test description",
    tags: ["test", "mix"],
    visibility: "public",
  },
};
