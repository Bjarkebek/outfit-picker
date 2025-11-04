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

    // Seedet item vises
    await expect(page.getByText(/Blue blouse/i)).toBeVisible();

    // Udfyld create-form
    // Category (combobox med label "Category")
    await page.getByRole("combobox").filter({ hasText: 'Top'}).click();
    await page.getByRole("option", { name: 'top' }).click();

    await page.getByRole('textbox', {name: 'e.g. Blue blouse'}).fill("Rød hoodie");
    await page.getByRole('textbox', {name: 'e.g. blue', exact: true}).fill("red");
    await page.getByRole('textbox', {name: 'e.g. Nike, Zara'}).fill("Adidas");

    // Type (label "Type") -> vælg "hoodie" (findes i dine TOP_TYPES)
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: 'hoodie' }).click();

    // Season (valgfrit)
    await page.getByRole("combobox").nth(2).click();
    await page.getByRole("option", { name: /all-season|spring|summer|fall|winter/i }).first().click();

    // Save
    await page.getByRole("button", { name: 'Save' }).click();

    // Forvent at det nye item dukker op efter POST -> GET
    await expect(page.getByText('Rød hoodie')).toBeVisible(); // -- fejler
  });
});
