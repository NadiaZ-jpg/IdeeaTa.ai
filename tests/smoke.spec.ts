import { test, expect } from "@playwright/test";

const PAGES = [
  { url: "/", label: "homepage RO" },
  { url: "/demo", label: "demo RO" },
  { url: "/en/demo", label: "demo EN" },
  { url: "/es/demo", label: "demo ES" },
  { url: "/studio", label: "studio RO" },
  { url: "/dashboard", label: "dashboard RO" },
];

for (const { url, label } of PAGES) {
  test(`smoke: ${label} returns 200`, async ({ page }) => {
    const response = await page.goto(url);
    expect(response?.status()).toBeLessThan(400);
  });
}

test("smoke: homepage has no JS errors on load", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // Allow Firebase initialization warnings but not hard JS crashes
  const hardErrors = errors.filter(
    (e) =>
      !e.includes("Firebase") &&
      !e.includes("NEXT_REDIRECT") &&
      !e.includes("AbortError")
  );
  expect(hardErrors).toHaveLength(0);
});

test("smoke: demo page RO has generate textarea", async ({ page }) => {
  await page.goto("/demo");
  const textarea = page.locator("textarea").first();
  await expect(textarea).toBeVisible({ timeout: 10_000 });
});

test("smoke: demo page EN has generate textarea", async ({ page }) => {
  await page.goto("/en/demo");
  const textarea = page.locator("textarea").first();
  await expect(textarea).toBeVisible({ timeout: 10_000 });
});

test("smoke: demo page ES has generate textarea", async ({ page }) => {
  await page.goto("/es/demo");
  const textarea = page.locator("textarea").first();
  await expect(textarea).toBeVisible({ timeout: 10_000 });
});
