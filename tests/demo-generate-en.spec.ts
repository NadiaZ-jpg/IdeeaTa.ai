import { test, expect } from "@playwright/test";
import { MOCK_GENERATE_RESPONSE_EN } from "./fixtures/mock-plan";

test.describe("Demo EN - generate plan flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("demoGenerateCount", "0");
    });

    await page.route("**/api/generate", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_GENERATE_RESPONSE_EN),
        });
      } else {
        await route.continue();
      }
    });
  });

  test("EN demo page has English placeholder text", async ({ page }) => {
    await page.goto("/en/demo");
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 15_000 });
    // Placeholder text în engleză
    const placeholder = await textarea.getAttribute("placeholder");
    expect(placeholder).toMatch(/business idea/i);
  });

  test("clicking Generate shows plan result in EN", async ({ page }) => {
    await page.goto("/en/demo");

    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 15_000 });
    await textarea.fill("I want to open a specialty coffee shop with vegan products");

    // Butonul de generare în engleză
    const generateBtn = page.getByRole("button", { name: /Generate/i });
    await expect(generateBtn).toBeVisible({ timeout: 5_000 });
    await generateBtn.click();

    // "Another idea" apare în ActionBar după generare
    const resetBtn = page.getByRole("button", { name: /Another idea/i });
    await expect(resetBtn).toBeVisible({ timeout: 30_000 });
  });

  test("EN generate calls API with correct locale context", async ({ page }) => {
    let requestLocale = "";

    await page.route("**/api/generate", async (route) => {
      try {
        const body = JSON.parse(route.request().postData() || "{}");
        requestLocale = body.locale || body.lang || "";
      } catch {
        requestLocale = "parse_error";
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_GENERATE_RESPONSE_EN),
      });
    });

    await page.goto("/en/demo");
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 15_000 });
    await textarea.fill("Coffee shop business plan");

    const generateBtn = page.getByRole("button", { name: /Generate/i });
    await generateBtn.click();

    const resetBtn = page.getByRole("button", { name: /Another idea/i });
    await expect(resetBtn).toBeVisible({ timeout: 30_000 });

    // Locale trebuie să fie "en"
    expect(requestLocale).toBe("en");
  });

  test("EN Share button is visible after plan is generated", async ({ page }) => {
    await page.goto("/en/demo");
    const textarea = page.locator("textarea").first();
    await expect(textarea).toBeVisible({ timeout: 15_000 });
    await textarea.fill("Tech startup idea for AI");

    const generateBtn = page.getByRole("button", { name: /Generate/i });
    await generateBtn.click();

    const resetBtn = page.getByRole("button", { name: /Another idea/i });
    await expect(resetBtn).toBeVisible({ timeout: 30_000 });

    const shareBtn = page.getByRole("button", { name: /Share/i });
    await expect(shareBtn).toBeVisible({ timeout: 5_000 });
  });
});
