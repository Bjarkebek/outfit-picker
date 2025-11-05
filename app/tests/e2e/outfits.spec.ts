import { test, expect } from "@playwright/test";
import { loginViaUI } from './fixtures/login.ui';
import { stubAuthAndData } from "./fixtures/supabase.rest.stub";

test.describe("Outfits", () => {
  test.beforeEach(async ({ page }) => {
    await stubAuthAndData(page);
    await loginViaUI(page);   
  });

  test("kan sammensætte separates og oprette outfit", async ({ page }) => {
    await page.goto("/outfits");

    await page.getByPlaceholder(('Fx Fredag aften')).fill("Fredag aften");
    await page.getByRole("combobox").filter({hasText: 'casual'}).click();
    await page.getByRole("option", { name: 'casual' }).click();
    await page.getByRole("combobox").filter({hasText: 'all-season'}).click();
    await page.getByRole("option", { name: 'all-season' }).click();

    await page.getByRole("button", { name: "Top + Bottom" }).click();

    await page.getByRole("combobox").nth(2).click();
    await page.getByRole("option", { name: 'blue blouse' }).click();

    await page.getByRole("combobox").nth(3).click();
    await page.getByRole("option", { name: 'black pants' }).click();

    await page.getByRole("combobox").nth(4).click();
    await page.getByRole("option", { name: 'white sneakers' }).click();

    const createBtn =
      (await page.getByRole("button", { name: 'Opret outfit'}).elementHandle())
    if (createBtn) await createBtn.click();

    await expect(page.getByText(/Fredag aften/i)).toBeVisible();
  });
});
