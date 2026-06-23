import { expect, test } from "@playwright/test";

test("merchant cabinet asks unauthenticated users to open Telegram", async ({
  page,
}) => {
  await page.goto("/merchant");

  await expect(
    page.getByRole("heading", { name: /войдите через telegram/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /открыть в telegram/i })).toBeVisible();
});

test("merchant invite asks unauthenticated users to open Telegram", async ({
  page,
}) => {
  await page.goto("/merchant/invite/test-token");

  await expect(
    page.getByRole("heading", { name: /войдите через telegram/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /открыть в telegram/i })).toBeVisible();
});
