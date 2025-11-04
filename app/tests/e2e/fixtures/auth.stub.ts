import { Page } from '@playwright/test';

export async function stubSupabaseAuth(page: Page) {
  await page.route('**/auth/v1/token?grant_type=password', (route) =>
    route.fulfill({ status: 200, json: {
      access_token: 'fake', refresh_token: 'fake', token_type: 'bearer', expires_in: 3600
    }})
  );
  await page.route('**/api/auth', (route) =>
    route.fulfill({ status: 200, json: { ok: true }})
  );
}
