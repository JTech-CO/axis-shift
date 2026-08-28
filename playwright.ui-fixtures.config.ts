import { defineConfig, devices } from '@playwright/test';

const chromiumExecutable = process.env.BROWSER_EXECUTABLE?.trim();

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      ...(process.env.CI ? { maxDiffPixelRatio: 0.025 } : { maxDiffPixels: 0 }),
      threshold: 0,
    },
  },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  outputDir: 'test-results/ui-fixtures',
  projects: [
    {
      name: 'ui-fixtures',
      use: {
        ...devices['Desktop Chrome'],
        ...(chromiumExecutable
          ? { launchOptions: { executablePath: chromiumExecutable } }
          : undefined),
      },
    },
  ],
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/ui-fixtures' }]],
  retries: process.env.CI ? 1 : 0,
  snapshotPathTemplate: '{testDir}/{testFileDir}/__snapshots__/{arg}-{projectName}-{platform}{ext}',
  testDir: './tests',
  timeout: 45_000,
  use: {
    baseURL: 'http://127.0.0.1:4174/axis-shift/',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'tsx scripts/start-ui-fixtures-server.ts',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: 'http://127.0.0.1:4174/axis-shift/tests/ui-fixtures/',
  },
  workers: 1,
});
