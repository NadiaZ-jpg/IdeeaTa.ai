import { test, expect } from "@playwright/test";

test.describe("Studio - auth wall", () => {
  test("studio page loads without hard crash", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => {
      // Ignorăm erorile așteptate Firebase / network în medii fără credențiale
      if (
        !e.message.includes("Firebase") &&
        !e.message.includes("auth/") &&
        !e.message.includes("NEXT_REDIRECT") &&
        !e.message.includes("AbortError") &&
        !e.message.includes("ChunkLoadError")
      ) {
        errors.push(e.message);
      }
    });

    const response = await page.goto("/studio");
    // Pagina trebuie să returneze 200 (nu 404/500)
    expect(response?.status()).toBeLessThan(400);
    expect(errors).toHaveLength(0);
  });

  test("studio shows spinner while auth state loads", async ({ page }) => {
    await page.goto("/studio");
    // Spinner-ul de autentificare: element cu clasa animate-spin
    const spinner = page.locator(".animate-spin").first();
    await expect(spinner).toBeVisible({ timeout: 10_000 });
  });

  test("studio page does NOT show plan editing textarea without auth", async ({
    page,
  }) => {
    await page.goto("/studio");
    // Așteptăm un timp pentru ca auth state să fie "stabilit"
    // (fără credențiale Firebase reale, user = null → spinner)
    await page.waitForTimeout(3_000);

    // Nu ar trebui să existe un textarea de scriere idee fără autentificare
    // (textarea-ul din studio necesită user logat)
    const planTextarea = page.locator(
      'textarea[placeholder*="idee"], textarea[placeholder*="idea"]'
    );
    // Dacă nu e vizibil, testul trece — auth wall funcționează
    await expect(planTextarea).not.toBeVisible();
  });

  test("EN studio path returns 200", async ({ page }) => {
    const response = await page.goto("/en/studio");
    expect(response?.status()).toBeLessThan(400);
  });

  test("ES studio path returns 200", async ({ page }) => {
    const response = await page.goto("/es/studio");
    expect(response?.status()).toBeLessThan(400);
  });
});
