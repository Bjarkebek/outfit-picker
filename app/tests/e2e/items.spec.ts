import { test, expect } from "@playwright/test";
import { loginViaUI } from './fixtures/login.ui';
import { stubAuthAndData } from "./fixtures/supabase.rest.stub";

test.describe("Items", () => {
  test.beforeEach(async ({ page }) => {
    await stubAuthAndData(page);
    await loginViaUI(page);   
  });

  test("viser seed, opretter nyt item og kan søge/filtrere", async ({ page }) => {
    await page.goto("/items");

    await expect(page.getByText(/Blue blouse/i)).toBeVisible();

    await page.getByRole("combobox").filter({ hasText: 'Top'}).click();
    await page.getByRole("option", { name: 'top' }).click();

    await page.getByRole('textbox', {name: 'e.g. Blue blouse'}).fill("Rød hoodie");
    await page.getByRole('textbox', {name: 'e.g. blue', exact: true}).fill("red");
    await page.getByRole('textbox', {name: 'e.g. Nike, Zara'}).fill("Adidas");

    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: 'hoodie' }).click();

    await page.getByRole("combobox").nth(2).click();
    await page.getByText('winter').click();

    await page.getByRole("button", { name: 'Save' }).click();

    await expect(page.getByText(/Rød hoodie/i)).toBeVisible();
  });
});
