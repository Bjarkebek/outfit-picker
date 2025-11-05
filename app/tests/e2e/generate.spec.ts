import { test, expect } from "@playwright/test";
import { loginViaUI } from './fixtures/login.ui';
import { stubAuthAndData } from "./fixtures/supabase.rest.stub";

test.describe("Generate", () => {
  test.beforeEach(async ({ page }) => {
    await stubAuthAndData(page);
    await loginViaUI(page);   
  });

  test("kan generere og gemme et outfit", async ({ page }) => {
    await page.goto("/generate");

    const genBtn =
      (await page.getByRole("button", { name: /generate/i }).elementHandle())
    if (genBtn) await genBtn.click( {timeout: 3000});

    await expect(page.getByText(/^top:/i)).toBeVisible();

    const saveBtn =
      (await page.getByRole("button", { name: /gem outfit/i }).elementHandle());
    if (saveBtn) await saveBtn.click();

    await expect(page.getByText('Outfit gemt')).toBeVisible();
  });
});
