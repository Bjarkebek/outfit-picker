// auth.stub.ts
import { Page, test } from '@playwright/test';

function getBaseURL(): string {
  return (test.info().project.use as any)?.baseURL ?? 'http://localhost:3000';
}

export async function setTestSessionCookies(page: Page) {
  const url = getBaseURL();
  await page.context().addCookies([
    { name: 'sb-access-token', value: 'fake', url },
    { name: 'sb-refresh-token', value: 'fake', url },
  ]);
}

export async function stubSupabaseAuth(page: Page) {
  await page.route('**/auth/v1/token**', (route) =>
    route.fulfill({ status: 200, json: { access_token: 'fake', refresh_token: 'fake', token_type: 'bearer', expires_in: 3600 } })
  );
  await page.route('**/auth/v1/user**', (route) =>
    route.fulfill({ status: 200, json: { user: { id: 'test-user', email: 'user@example.com' } } })
  );
  await page.route('**/api/auth', (route) =>
    route.fulfill({ status: 200, json: { ok: true } })
  );
}
