
import { Page } from '@playwright/test';
import { stubSupabaseAuth, setTestSessionCookies  } from './auth.stub';

export async function loginViaUI(page: Page) {
  await stubSupabaseAuth(page);
  await setTestSessionCookies(page);

  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('user@example.com');
  await page.getByPlaceholder('Password').fill('secret123');
  await page.getByRole('button', { name: /log ind/i }).click();


  await page.waitForURL(/^(?!.*\/login)/).catch(() => {});
}
