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

  test("share button shows auth modal when not logged in", async ({
    page,
  }) => {
    await generatePlan(page);

    // Apăsăm butonul de partajare
    const shareBtn = page.getByRole("button", { name: /Partajea[zz]ă/i });
    await expect(shareBtn).toBeVisible({ timeout: 5_000 });
    await shareBtn.click();

    // Fără autentificare Firebase, click pe Share afișează AuthWallModal
    // (handleShare verifică user și setShowAuthModal(true) dacă user=null)
    const authModal = page.getByText(/Crea[ț|t]i-v[ă|a] un cont/i).or(
      page.getByText(/Conectare.*Înregistrare/i)
    );
    await expect(authModal).toBeVisible({ timeout: 10_000 });
  });

  test("share button is visible and clickable after plan generation", async ({ page }) => {
    await generatePlan(page);

    // Butonul de share trebuie să fie vizibil după generare
    const shareBtn = page.getByRole("button", { name: /Partajea[zz]ă/i });
    await expect(shareBtn).toBeVisible({ timeout: 5_000 });

    // Click pe share (fără auth) → AuthWallModal se deschide
    await shareBtn.click();
    const authModalTitle = page.getByText(/Crea[ț|t]i-v[ă|a] un cont/i).or(
      page.getByText(/Conectare.*Înregistrare/i)
    );
    await expect(authModalTitle).toBeVisible({ timeout: 10_000 });
  });

  test("EN share button shows auth modal when not logged in", async ({ page }) => {
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

    // Fără auth → AuthWallModal EN cu "Create a free account" sau "Login / Register"
    const authModal = page.getByText(/Create a free account/i).or(
      page.getByText(/Login.*Register/i)
    );
    await expect(authModal).toBeVisible({ timeout: 10_000 });
  });
});
