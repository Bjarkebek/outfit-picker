import { test, expect } from '@playwright/test';
import { stubSupabaseAuth } from './fixtures/auth.stub';

test('login flow', async ({ page }) => {
  await stubSupabaseAuth(page);

  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('user@example.com');
  await page.getByPlaceholder('Password').fill('secret123');
  await page.getByRole('button', { name: /log ind/i }).click();

  await expect(page).toHaveURL(/(items|outfits|generate|\/)$/);
});
