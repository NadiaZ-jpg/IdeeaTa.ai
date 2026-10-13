import { defineConfig, devices } from "@playwright/test";

/**
 * Rulare:
 *   mpotriva producției:  PLAYWRIGHT_TEST_BASE_URL=https://ideeata.ai npx playwright test
 *   local (server pornit): npx playwright test
 *   un singur fișier:     npx playwright test tests/smoke.spec.ts
 */
const baseURL =
  process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [["html", { open: "never" }], ["line"]],

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    // Viewport mare = garantat DemoDesktop (nu DemoMobile)
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        launchOptions: {
          executablePath:
            process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
            "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
        },
      },
    },
  ],

  // Pornire automată Next.js când nu există BASE_URL extern.
  // Necesită .env cu credențiale Firebase (sau .env.test cu valori dummy).
  webServer: process.env.PLAYWRIGHT_TEST_BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --port 3000",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
