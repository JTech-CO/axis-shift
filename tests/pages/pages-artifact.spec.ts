import { expect, test, type Page } from '@playwright/test';

function monitorPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

async function expectSuccessfulNavigation(page: Page, relativeUrl: string): Promise<void> {
  const response = await page.goto(relativeUrl);
  expect(response?.status()).toBe(200);
}

test('keeps the public root on the playable M00 prototype', async ({ page }) => {
  const errors = monitorPageErrors(page);
  await expectSuccessfulNavigation(page, './');

  await expect(page).toHaveURL(/\/axis-shift\/prototypes\/rule-proof\/$/u);
  await expect(page).toHaveTitle('AXIS//SHIFT — Tensor Puzzle');
  await expect(page.getByRole('heading', { level: 1, name: 'AXIS SHIFT' })).toBeVisible();
  await expect(page.locator('#stage-buttons button')).toHaveCount(6);
  await expect(page.locator('.stage-catalog-note')).toContainText('18 SIGNALS');
  await expect(page.locator('#app')).toHaveAttribute('data-campaign-count', '18');
  await expect(page.locator('#app')).toHaveAttribute('data-campaign-position', '1');
  expect(errors).toEqual([]);
});

test('preserves stage and signal links while bridging to H00', async ({ page }) => {
  const errors = monitorPageErrors(page);
  await expectSuccessfulNavigation(page, './?stage=hard-6&signal=2');

  await expect(page).toHaveURL(/\/prototypes\/rule-proof\/\?stage=hard-6&signal=2$/u);
  await expect(page.locator('#board-stage')).toHaveAttribute('data-size', '6');
  await expect(page.locator('#app')).toHaveAttribute('data-campaign-signal', '2');
  await expect(page.locator('#app')).toHaveAttribute('data-campaign-position', '17');
  await expect(page.locator('#stage-current')).toContainText('신호 2/3');
  expect(errors).toEqual([]);
});

test('preserves stage and seed links while bridging to M00', async ({ page }) => {
  const errors = monitorPageErrors(page);
  await expectSuccessfulNavigation(page, './?stage=hard-6&seed=pages-smoke');

  await expect(page).toHaveURL(/\/prototypes\/rule-proof\/\?stage=hard-6&seed=pages-smoke$/u);
  await expect(page.locator('#board-stage')).toHaveAttribute('data-size', '6');
  await expect(page.locator('#stage-current')).toContainText('어려움 6×6');
  expect(errors).toEqual([]);
});

test('preserves an M00 anchor while bridging from the public root', async ({ page }) => {
  const errors = monitorPageErrors(page);
  await expectSuccessfulNavigation(page, './#controls');

  await expect(page).toHaveURL(/\/prototypes\/rule-proof\/#controls$/u);
  await expect(page.locator('#controls')).toBeVisible();
  expect(errors).toEqual([]);
});

test('keeps the direct M00 prototype path playable', async ({ page }) => {
  const errors = monitorPageErrors(page);
  await expectSuccessfulNavigation(page, './prototypes/rule-proof/?stage=normal-5');

  await expect(page).toHaveURL(/\/prototypes\/rule-proof\/\?stage=normal-5$/u);
  await expect(page.locator('#board-stage')).toHaveAttribute('data-size', '5');
  await expect(page.locator('#stage-current')).toContainText('보통 5×5');
  expect(errors).toEqual([]);
});

for (const route of [
  { hash: '#/', headingId: 'home-title' },
  { hash: '#/daily', headingId: 'daily-title' },
] as const) {
  test(`serves the M01 ${route.hash} route from the Pages artifact`, async ({ page }) => {
    const errors = monitorPageErrors(page);
    await expectSuccessfulNavigation(page, `./${route.hash}`);

    await expect(page).toHaveURL(new RegExp(`/axis-shift/${route.hash.replace('/', '\\/')}$`, 'u'));
    await expect(page.getByRole('heading', { level: 1 })).toHaveAttribute('id', route.headingId);
    expect(errors).toEqual([]);
  });
}

test('recovers an unknown M01 hash route', async ({ page }) => {
  const errors = monitorPageErrors(page);
  await expectSuccessfulNavigation(page, './#/unknown');

  await expect(page.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'recovery-title');
  await page.getByRole('main').getByRole('link').click();
  await expect(page).toHaveURL(/\/axis-shift\/#\/$/u);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'home-title');
  expect(errors).toEqual([]);
});

test('serves every M01 script and stylesheet without HTTP errors', async ({ page, request }) => {
  const errors = monitorPageErrors(page);
  await expectSuccessfulNavigation(page, './#/');

  const assets = page.locator('script[src], link[rel="stylesheet"][href]');
  const assetCount = await assets.count();
  expect(assetCount).toBeGreaterThanOrEqual(2);

  for (let index = 0; index < assetCount; index += 1) {
    const asset = assets.nth(index);
    const relativeUrl =
      (await asset.getAttribute('src')) ?? (await asset.getAttribute('href')) ?? '';
    expect(relativeUrl).not.toBe('');
    const assetUrl = new URL(relativeUrl, page.url()).href;
    const response = await request.get(assetUrl);
    expect(response.status(), assetUrl).toBe(200);
  }

  expect(errors).toEqual([]);
});
