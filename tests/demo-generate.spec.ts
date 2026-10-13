import { test, expect } from "@playwright/test";
import { MOCK_GENERATE_RESPONSE } from "./fixtures/mock-plan";

test.describe("Demo RO - flux generate plan", () => {
  test.beforeEach(async ({ page }) => {
    // Resetăm contorul de generări guest pentru a evita eroarea de limită
    await page.addInitScript(() => {
      localStorage.setItem("demoGenerateCount", "0");
    });

    // Interceptăm POST /api/generate și returnăm planul mock
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
  });

  test("apăsarea butonului Generează afișează planul", async ({ page }) => {
    await page.goto("/demo");

    // Așteptăm textarea-ul să fie vizibil
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 15_000 });

    // Introducem o idee de afaceri
    await textarea.fill("Vreau să deschid o cafenea de specialitate cu produse vegane");

    // Apăsăm butonul de generare (text RO: "Generează Planul")
    const generateBtn = page.getByRole("button", {
      name: /Genereaz[ăa]/i,
    });
    await expect(generateBtn).toBeVisible({ timeout: 5_000 });
    await generateBtn.click();

    // Așteptăm butonul "Plan Nou" din ActionBar — apare după ce planul e afișat
    const resetBtn = page.getByRole("button", { name: /Plan Nou/i });
    await expect(resetBtn).toBeVisible({ timeout: 30_000 });
  });

  test("API /api/generate este apelat cu POST", async ({ page }) => {
    let capturedMethod = "";
    let capturedBody: Record<string, unknown> = {};

    await page.route("**/api/generate", async (route) => {
      capturedMethod = route.request().method();
      try {
        capturedBody = JSON.parse(route.request().postData() || "{}");
      } catch {
        capturedBody = {};
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_GENERATE_RESPONSE),
      });
    });

    await page.goto("/demo");
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 15_000 });
    await textarea.fill("Cafenea vegan centru");

    const generateBtn = page.getByRole("button", { name: /Genereaz[ăa]/i });
    await generateBtn.click();

    // Așteptăm planul
    const resetBtn = page.getByRole("button", { name: /Plan Nou/i });
    await expect(resetBtn).toBeVisible({ timeout: 30_000 });

    expect(capturedMethod).toBe("POST");
    expect(capturedBody).toHaveProperty("skill");
  });

  test("după generare butonul Partajează este vizibil", async ({ page }) => {
    await page.goto("/demo");
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 15_000 });
    await textarea.fill("Cafenea test pentru share");

    const generateBtn = page.getByRole("button", { name: /Genereaz[ăa]/i });
    await generateBtn.click();

    // Așteptăm resetBtn = plan afișat
    const resetBtn = page.getByRole("button", { name: /Plan Nou/i });
    await expect(resetBtn).toBeVisible({ timeout: 30_000 });

    // Butonul de partajare trebuie să fie vizibil
    const shareBtn = page.getByRole("button", { name: /Partajea[zz]ă/i });
    await expect(shareBtn).toBeVisible({ timeout: 5_000 });
  });
});
