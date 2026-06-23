import { expect, test } from "@playwright/test";

test("marketplace home renders NurAI discovery", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /найдите свободное окно в салон рядом/i }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /nurai assistant/i })).toBeVisible();
  await expect(page.getByText("Карта рядом")).toBeVisible();
});
