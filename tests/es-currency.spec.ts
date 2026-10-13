import { test, expect } from "@playwright/test";
import { MOCK_GENERATE_RESPONSE } from "./fixtures/mock-plan";

/**
 * Validare: pagina ES folosește EUR, nu RON.
 * Acoperă regula: EN/ES → întotdeauna EUR.
 */
test.describe("ES locale — currency EUR", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("demoGenerateCount", "0");
    });

    await page.route("**/api/generate", async (route) => {
      if (route.request().method() === "POST") {
        // Planul mock are selectedCurrency: "RON" — pentru ES trebuie forțat EUR
        const body = JSON.parse(route.request().postData() || "{}");
        const plan = JSON.parse(
          JSON.stringify({
            ...JSON.parse(
              (
                MOCK_GENERATE_RESPONSE as { ideas: string[]; fx_rate: number }
              ).ideas[0]
            ),
            selectedCurrency: body.currency || "EUR",
          })
        );
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ideas: [JSON.stringify(plan)], fx_rate: 0.201 }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test("ES generate request trimite currency EUR", async ({ page }) => {
    let sentCurrency = "";

    await page.route("**/api/generate", async (route) => {
      if (route.request().method() === "POST") {
        const body = JSON.parse(route.request().postData() || "{}");
        sentCurrency = body.currency;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_GENERATE_RESPONSE),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/es/demo");
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 15_000 });
    await textarea.fill("Quiero abrir una cafetería de especialidad");

    const generateBtn = page.getByRole("button", { name: /Generar/i });
    await expect(generateBtn).toBeVisible({ timeout: 5_000 });
    await generateBtn.click();

    // Așteptăm planul
    const resetBtn = page.getByRole("button", { name: /Nuevo Plan/i });
    await expect(resetBtn).toBeVisible({ timeout: 30_000 });

    // Currency trimisă la API trebuie să fie EUR
    expect(sentCurrency).toBe("EUR");
  });

  test("ES demo page has Spanish generate button", async ({ page }) => {
    await page.goto("/es/demo");
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 15_000 });

    // Butonul de generare în spaniolă
    const generateBtn = page.getByRole("button", { name: /Generar/i });
    await expect(generateBtn).toBeVisible({ timeout: 5_000 });
  });

  test("ES placeholder text is in Spanish", async ({ page }) => {
    await page.goto("/es/demo");
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 15_000 });
    const placeholder = await textarea.getAttribute("placeholder");
    expect(placeholder).toMatch(/idea de negocio/i);
  });
});
