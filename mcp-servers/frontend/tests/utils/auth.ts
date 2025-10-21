import { Page } from "@playwright/test";

export async function mockAuthUser(page: Page, username: string = "testuser") {
  // Mock JWT token
  const mockToken = "mock.jwt.token";

  // Set up local storage with mock auth data
  await page.evaluate(
    ([token, user]) => {
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: 1,
          username: user,
          email: `${user}@example.com`,
        }),
      );
    },
    [mockToken, username],
  );

  // Mock API responses for auth-required endpoints
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        id: 1,
        username: username,
        email: `${username}@example.com`,
      }),
    });
  });

  // Add auth header to all API requests
  await page.route("**/api/**", async (route) => {
    const headers = route.request().headers();
    headers["Authorization"] = `Bearer ${mockToken}`;
    await route.continue({ headers });
  });
}
