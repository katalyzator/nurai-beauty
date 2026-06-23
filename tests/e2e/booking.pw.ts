import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

function readLocalEnv() {
  if (!fs.existsSync(".env.local")) return {};

  return Object.fromEntries(
    fs
      .readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

test("salon profile exposes booking form", async ({ page }) => {
  await page.goto("/salons/ala-too-beauty-studio");
  await expect(page.getByRole("button", { name: /записаться/i })).toBeVisible();
  await expect(page.getByText("Каталог мастеров")).toBeVisible();
  await expect(page.getByRole("button", { name: /Любой свободный мастер/i })).toBeVisible();
});

test("salon profile creates a web booking", async ({ page }, testInfo) => {
  const phone = `+996700${Date.now().toString().slice(-6)}`;
  const freeTimeOffset = testInfo.project.name === "mobile" ? 1 : 0;

  await page.goto("/salons/erkindik-nails");
  await page.getByRole("button", { name: /Сезим/ }).click();
  await expect(page.getByText("Мастер: Сезим")).toBeVisible();
  const chosenTime = await chooseFreeTime(page, freeTimeOffset);
  await page.getByLabel("Имя").fill("E2E Client");
  await page.getByLabel("Телефон").fill(phone);
  await page.getByRole("button", { name: "Записаться" }).click();

  await expect(page.getByText("Заявка создана")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /Сезим/ }).click();
  await expect(page.getByTestId(`booking-time-${chosenTime}`)).toBeDisabled();
  await expect(page.getByTestId(`booking-time-${chosenTime}`)).toContainText(
    "Занято",
  );

  const env = { ...readLocalEnv(), ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && secret) {
    const supabase = createClient(url, secret, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    await supabase.from("bookings").delete().eq("client_phone", phone);
  }
});

async function chooseFreeTime(page: Page, offset: number) {
  const buttons = page.getByTestId(/^booking-time-/);
  const count = await buttons.count();
  const enabledButtons = [];

  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    if (await button.isEnabled()) {
      enabledButtons.push(button);
    }
  }

  const button = enabledButtons[offset] ?? enabledButtons[0];
  const time = await button?.getAttribute("data-booking-time");
  if (button && time) {
    await button.click();
    return time;
  }

  throw new Error("No free booking time was available in the test salon");
}
