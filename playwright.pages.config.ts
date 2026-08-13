import { defineConfig, devices } from '@playwright/test';

const chromiumExecutable = process.env.BROWSER_EXECUTABLE?.trim();
const externalBaseUrl = process.env.PAGES_BASE_URL?.trim();
const localBaseUrl = 'http://127.0.0.1:4174/axis-shift/';

function normalizeBaseUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('PAGES_BASE_URL must use http or https.');
  }
  url.hash = '';
  url.search = '';
  return url.href.endsWith('/') ? url.href : `${url.href}/`;
}

const baseURL = normalizeBaseUrl(externalBaseUrl || localBaseUrl);

export default defineConfig({
  testDir: './tests/pages',
  outputDir: 'test-results/pages',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  timeout: 45_000,
  workers: process.env.CI ? 1 : 3,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/pages' }]],
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(chromiumExecutable
          ? { launchOptions: { executablePath: chromiumExecutable } }
          : undefined),
      },
    },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: 'tsx scripts/start-pages-server.ts',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        url: localBaseUrl,
      },
});
