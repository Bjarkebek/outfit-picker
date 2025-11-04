import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'app/tests/e2e',
  timeout: 10_000,
  expect: { timeout: 5000 },
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
    env: { E2E: '1' }
  },
});
