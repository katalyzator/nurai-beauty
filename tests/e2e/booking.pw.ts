import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

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

test("salon profile creates a web booking", async ({ page }) => {
  const phone = `+996700${Date.now().toString().slice(-6)}`;

  await page.goto("/salons/erkindik-nails");
  await page.getByRole("button", { name: /Сезим/ }).click();
  await expect(page.getByText("Мастер: Сезим")).toBeVisible();
  await page.getByLabel("Имя").fill("E2E Client");
  await page.getByLabel("Телефон").fill(phone);
  await page.getByRole("button", { name: "Записаться" }).click();

  await expect(page.getByText("Заявка создана")).toBeVisible();

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
