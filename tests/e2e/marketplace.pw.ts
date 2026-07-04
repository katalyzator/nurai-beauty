import { expect, test } from "@playwright/test";

test("marketplace home renders NurAI discovery", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: /nurai.*запись в салоны красоты бишкека/i,
    }),
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

test("header navigation matches the current marketplace sections", async ({
  page,
}) => {
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Основная навигация" });

  await expect(nav.getByRole("link", { name: "Поиск" })).toHaveAttribute(
    "href",
    "#search",
  );
  await expect(nav.getByRole("link", { name: "Карта" })).toHaveAttribute(
    "href",
    "#map",
  );
  await expect(nav.getByRole("link", { name: "Каталог" })).toHaveAttribute(
    "href",
    "#salons",
  );
  await expect(nav.getByRole("link", { name: "AI запись" })).toHaveAttribute(
    "href",
    "#assistant",
  );
  await expect(
    nav.getByRole("link", { name: /^(Для салонов|Салонам)$/ }),
  ).toHaveAttribute("href", "/merchant");
});

test("marketplace filters update the salon list", async ({ page }) => {
  await page.goto("/");
  const list = page.getByTestId("salon-list");

  await expect(list.getByRole("heading", { name: "InStyle" })).toBeVisible();
  await page.getByRole("button", { name: "Брови" }).click();
  await expect(list.getByRole("heading", { name: "Lash Book" })).toBeVisible();
  await expect(list.getByRole("heading", { name: "InStyle" })).not.toBeVisible();

  await page.getByRole("button", { name: "Все" }).click();
  await page.getByPlaceholder("Маникюр, окрашивание, уход").fill("киевская");
  await expect(list.getByRole("heading", { name: "InStyle" })).toBeVisible();
  await expect(list.getByText("улица Киевская, Бишкек")).toBeVisible();
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
  ).toHaveText("Adel");
});

test("map panel can use current geolocation", async ({ context, page }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 42.8508, longitude: 74.668 });
  await page.goto("/");

  await page.locator("#map").scrollIntoViewIfNeeded();
  await page
    .locator("#map")
    .getByRole("button", { name: /моя геопозиция/i })
    .click();

  await expect(
    page.getByText("Готово: ближайшие салоны подняты вверх."),
  ).toBeVisible();
  await expect(page.locator("#map").getByText("От вашей геопозиции")).toBeVisible();
});
