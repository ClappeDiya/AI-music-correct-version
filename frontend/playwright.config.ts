import { PlaywrightTestConfig, devices } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./src/tests",
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL: "http://localhost:3001",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3001",
    timeout: 120000,
    reuseExistingServer: true,
    env: {
      NEXT_PUBLIC_API_URL: "http://127.0.0.1:8000",
      NODE_ENV: "test",
    },
  },
  reporter: [["html"], ["list"]],
  retries: 2,
  workers: 1,
  fullyParallel: false,
};

export default config;
