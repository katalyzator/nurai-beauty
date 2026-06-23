import { expect, test } from "@playwright/test";

test("salon profile exposes booking form", async ({ page }) => {
  await page.goto("/salons/ala-too-beauty-studio");
  await expect(page.getByRole("button", { name: /записаться/i })).toBeVisible();
});
