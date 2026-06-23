import { expect, test } from "@playwright/test";

test("marketplace home renders NurAI discovery", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "NurAI" })).toBeVisible();
});
