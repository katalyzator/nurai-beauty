import { expect, test } from "@playwright/test";

test("marketplace home renders NurAI discovery", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /запись в салон без ожидания ответа/i }),
  ).toBeVisible();
  await expect(page.getByText("Карта рядом")).toBeVisible();
});
