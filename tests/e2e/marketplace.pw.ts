import { expect, test } from "@playwright/test";

test("marketplace home renders NurAI discovery", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /найдите свободное окно в салон рядом/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /открыть nurai assistant/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /открыть nurai assistant/i }).click();
  await expect(page.getByRole("heading", { name: /nurai assistant/i })).toBeVisible();
  await page
    .getByPlaceholder("Например: маникюр завтра после 14:00")
    .fill("Запиши меня на маникюр сегодня в 11:00. Имя Тест, телефон +996 700 000 000");
  await page.getByRole("button", { name: "Отправить" }).click();
  await expect(page.getByText("Локальный режим")).toBeVisible();
  await expect(page.getByText("Черновик записи", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /свернуть nurai assistant/i }).click();
  await expect(
    page.getByRole("button", { name: /открыть nurai assistant/i }),
  ).toBeVisible();
  await expect(page.getByText("Карта рядом")).toBeVisible();
});
