
import { Page } from '@playwright/test';
import { stubSupabaseAuth } from './auth.stub'; // din eksisterende

export async function loginViaUI(page: Page) {
  // Sørg for at auth-kald stubs er aktive
  await stubSupabaseAuth(page);

  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('user@example.com');
  await page.getByPlaceholder('Password').fill('secret123');
  await page.getByRole('button', { name: /log ind/i }).click();


  await page.waitForURL(/^(?!.*\/login)/).catch(() => {});
}
