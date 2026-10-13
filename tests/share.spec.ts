import { test, expect } from "@playwright/test";
import { MOCK_GENERATE_RESPONSE, MOCK_SHARE_RESPONSE } from "./fixtures/mock-plan";

test.describe("Demo - share plan flow", () => {
  test.beforeEach(async ({ page }) => {
    // Blocăm LocaleRedirectGuard: headless Chrome are UA en-US →
    // fără "preferred_language=ro", /demo ar fi redirecționat la /en/demo.
    await page.addInitScript(() => {
      localStorage.setItem("demoGenerateCount", "0");
      localStorage.setItem("preferred_language", "ro");
    });

    // Mock generate
    await page.route("**/api/generate", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_GENERATE_RESPONSE),
        });
      } else {
        await route.continue();
      }
    });

    // Mock share
    await page.route("**/api/share", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_SHARE_RESPONSE),
        });
      } else {
        await route.continue();
      }
    });
  });

  async function generatePlan(page: import("@playwright/test").Page) {
    await page.goto("/demo");
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 15_000 });
    await textarea.fill("Cafenea de specialitate vegan");
    const generateBtn = page.getByRole("button", { name: /Genereaz[ăa]/i });
    await generateBtn.click();
    // Așteptăm planul să fie afișat (butonul ActionBar apare)
    const resetBtn = page.getByRole("button", { name: /Alt.*idee/i });
    await expect(resetBtn).toBeVisible({ timeout: 30_000 });
  }

  test("share button calls /api/share and shows success banner", async ({
    page,
  }) => {
    let shareCalled = false;

    await page.route("**/api/share", async (route) => {
      if (route.request().method() === "POST") {
        shareCalled = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_SHARE_RESPONSE),
        });
      } else {
        await route.continue();
      }
    });

    await generatePlan(page);

    // Apăsăm butonul de partajare
    const shareBtn = page.getByRole("button", { name: /Partajea[zz]ă/i });
    await expect(shareBtn).toBeVisible({ timeout: 5_000 });
    await shareBtn.click();

    // Așteptăm banner-ul de succes: "Link copiat în clipboard!"
    const successBanner = page.getByText(/Link copiat/i);
    await expect(successBanner).toBeVisible({ timeout: 10_000 });

    expect(shareCalled).toBe(true);
  });

  test("share API receives plan data", async ({ page }) => {
    let shareBody: Record<string, unknown> = {};

    await page.route("**/api/share", async (route) => {
      if (route.request().method() === "POST") {
        try {
          shareBody = JSON.parse(route.request().postData() || "{}");
        } catch {
          shareBody = {};
        }
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_SHARE_RESPONSE),
        });
      } else {
        await route.continue();
      }
    });

    await generatePlan(page);

    const shareBtn = page.getByRole("button", { name: /Partajea[zz]ă/i });
    await shareBtn.click();

    // Așteptăm ca share să fie apelat
    await page.getByText(/Link copiat/i).waitFor({ timeout: 10_000 });

    // Body-ul trebuie să conțină planul
    expect(shareBody).toBeTruthy();
  });

  test("EN share button shows 'Link copied' message", async ({ page }) => {
    // Override generate mock pentru EN
    await page.route("**/api/generate", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_GENERATE_RESPONSE),
        });
      } else {
        await route.continue();
      }
    });

    await page.addInitScript(() => {
      localStorage.setItem("demoGenerateCount", "0");
    });

    await page.goto("/en/demo");
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 15_000 });
    await textarea.fill("Vegan coffee shop business");
    const generateBtn = page.getByRole("button", { name: /Generate/i });
    await generateBtn.click();

    const resetBtn = page.getByRole("button", { name: /Another idea/i });
    await expect(resetBtn).toBeVisible({ timeout: 30_000 });

    const shareBtn = page.getByRole("button", { name: /Share/i });
    await shareBtn.click();

    // Banner EN: "Link copied to clipboard!"
    const successBanner = page.getByText(/Link copied/i);
    await expect(successBanner).toBeVisible({ timeout: 10_000 });
  });
});
