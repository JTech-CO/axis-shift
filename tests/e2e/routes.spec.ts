import { expect, test, type Page } from '@playwright/test';

async function openHashRoute(page: Page, hashPath: string) {
  const response = await page.goto(`./#${hashPath}`);
  expect(response?.status()).toBe(200);
}

test('serves the home route below the repository base', async ({ page }) => {
  await openHashRoute(page, '/');

  await expect(page).toHaveURL(/\/axis-shift\/#\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'home-title');
});

test('serves the daily route below the repository base', async ({ page }) => {
  await openHashRoute(page, '/daily');

  await expect(page).toHaveURL(/\/axis-shift\/#\/daily$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'daily-title');
});

test('recovers an unknown route without a server 404', async ({ page }) => {
  await openHashRoute(page, '/unknown');

  await expect(page).toHaveURL(/\/axis-shift\/#\/unknown$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'recovery-title');

  await page.getByRole('main').getByRole('link').click();
  await expect(page).toHaveURL(/\/axis-shift\/#\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'home-title');
});

test('keeps visible shell interaction targets at least 44px', async ({ page }) => {
  await openHashRoute(page, '/');

  const targets = page.locator('a:visible, button:visible');
  const count = await targets.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    const box = await targets.nth(index).boundingBox();
    expect(box, `interactive target ${index} has no box`).not.toBeNull();
    expect(box?.width ?? 0, `interactive target ${index} width`).toBeGreaterThanOrEqual(44);
    expect(box?.height ?? 0, `interactive target ${index} height`).toBeGreaterThanOrEqual(44);
  }
});
