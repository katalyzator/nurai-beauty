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
  await expect(page.getByText("Карта салонов")).toBeVisible();
});

test("marketplace filters update the salon list", async ({ page }) => {
  await page.goto("/");
  const list = page.getByTestId("salon-list");

  await expect(list.getByRole("heading", { name: "Erkindik Nails" })).toBeVisible();
  await page.getByRole("button", { name: "Брови" }).click();
  await expect(list.getByRole("heading", { name: "Tumar Brow Bar" })).toBeVisible();
  await expect(list.getByRole("heading", { name: "Erkindik Nails" })).not.toBeVisible();

  await page.getByPlaceholder("Маникюр, окрашивание, уход").fill("анкара");
  await expect(list.getByRole("heading", { name: "Tumar Brow Bar" })).toBeVisible();
  await expect(list.getByText("ул. Анкара 18, Бишкек")).toBeVisible();
});

test("nearby button reorders salons from user geolocation", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 42.8508, longitude: 74.668 });
  await page.goto("/");

  await page.getByRole("button", { name: /рядом со мной/i }).click();
  await expect(page.getByText("Готово: ближайшие салоны подняты вверх.")).toBeVisible();
  await expect(
    page.getByTestId("salon-list").getByRole("heading").first(),
  ).toHaveText("Tumar Brow Bar");
});
