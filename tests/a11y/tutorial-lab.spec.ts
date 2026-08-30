import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

interface ProductRouteCase {
  readonly name: string;
  readonly route: string;
  readonly waitUntilReady: (page: Page) => Promise<void>;
}

const productRoutes: readonly ProductRouteCase[] = [
  {
    name: 'Tutorial step',
    route: '#/tutorial?step=1',
    waitUntilReady: async (page) => {
      await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'idle');
      await expect(page.getByRole('heading', { level: 1, name: '첫 번째 행' })).toBeVisible();
    },
  },
  {
    name: 'Lab catalog',
    route: '#/lab',
    waitUntilReady: async (page) => {
      await expect(page.getByRole('heading', { level: 1, name: 'SIGNAL LAB' })).toBeVisible();
      await expect(page.locator('a[data-completed]')).toHaveCount(48);
    },
  },
  {
    name: 'Lab game',
    route: '#/lab/lab-01-pulse-01',
    waitUntilReady: async (page) => {
      await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'idle');
      await expect(page.getByRole('heading', { level: 1, name: '펄스 01' })).toBeVisible();
    },
  },
];

async function auditProductRoute(
  page: Page,
  testInfo: TestInfo,
  routeCase: ProductRouteCase,
): Promise<void> {
  const externalRequests: string[] = [];
  const pageErrors: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.host !== '127.0.0.1:4174') externalRequests.push(request.url());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const response = await page.goto(`./${routeCase.route}`);
  expect(response?.status()).toBe(200);
  await routeCase.waitUntilReady(page);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const blocking = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );

  await testInfo.attach(`axe-${routeCase.name.toLowerCase().replaceAll(' ', '-')}.json`, {
    body: Buffer.from(JSON.stringify(results.violations, null, 2)),
    contentType: 'application/json',
  });

  expect(
    blocking.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
      targets: violation.nodes.slice(0, 3).map((node) => node.target),
    })),
  ).toEqual([]);
  expect(externalRequests).toEqual([]);
  expect(pageErrors).toEqual([]);
}

for (const routeCase of productRoutes) {
  test(`${routeCase.name} actual route has no serious or critical axe violations`, async ({
    page,
  }, testInfo) => {
    await auditProductRoute(page, testInfo, routeCase);
  });
}
