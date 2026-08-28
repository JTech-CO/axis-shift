import { expect, test, type Page } from '@playwright/test';

async function openInteractiveFixture(page: Page) {
  const response = await page.goto('./tests/ui-fixtures/?interactive=1');
  expect(response?.status()).toBe(200);
  await expect(page.locator('body')).toHaveAttribute('data-fixture-ready', 'true');
}

async function activateAxes(page: Page, rows: readonly string[], columns: readonly string[]) {
  for (const column of columns) {
    const button = page.getByRole('button', {
      name: '열 ' + column + ' 선택 안 됨',
    });
    await button.focus();
    await page.keyboard.press(Number(column) % 2 === 0 ? 'Enter' : 'Space');
  }
  for (const row of rows) {
    const button = page.getByRole('button', {
      name: '행 ' + row + ' 선택 안 됨',
    });
    await button.focus();
    await page.keyboard.press(row.charCodeAt(0) % 2 === 0 ? 'Enter' : 'Space');
  }
}

async function pulseAndFinish(page: Page) {
  const stage = page.locator('[data-game-stage="true"]');
  await page.keyboard.press('p');
  await expect(stage).toHaveAttribute('data-phase', 'pulsing');
  await expect(stage).toHaveAttribute('data-phase', /idle|selected/, { timeout: 2_000 });
}

async function boardSignature(page: Page) {
  return page
    .locator('[data-tensor-board="true"] [role="gridcell"]')
    .evaluateAll((cells) => cells.map((cell) => cell.getAttribute('data-state')).join(''));
}

test('completes select, pulse, undo, hint, reset-cancel, and solve without a pointer', async ({
  page,
}) => {
  await openInteractiveFixture(page);

  const theme = page.getByRole('button', { name: /^Theme: dark/ });
  await theme.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.keyboard.press('Tab');
  const motion = page.getByRole('button', { name: /^Motion: system/ });
  await expect(motion).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '열 1 선택 안 됨' })).toBeFocused();

  const initial = await boardSignature(page);
  await activateAxes(page, ['A', 'B', 'D'], ['1', '3', '5']);
  await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'preview');
  await pulseAndFinish(page);
  expect(await boardSignature(page)).not.toBe(initial);

  await page.keyboard.press('z');
  await expect.poll(() => boardSignature(page)).toBe(initial);

  await page.keyboard.press('h');
  await expect(page.locator('[data-hint-level]')).toHaveAttribute('data-hint-level', '1');

  const focusBeforeReset = page.getByRole('button', { exact: true, name: '힌트' });
  await focusBeforeReset.focus();
  await page.keyboard.press('Shift+R');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: '취소' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(focusBeforeReset).toBeFocused();

  await activateAxes(page, ['A', 'B', 'D'], ['1', '3', '5']);
  await pulseAndFinish(page);
  await activateAxes(page, ['C', 'E', 'F'], ['2', '4', '6']);
  await pulseAndFinish(page);
  await activateAxes(page, ['A', 'F'], ['3', '4', '5', '6']);
  await page.keyboard.press('Control+Enter');

  await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'solved', {
    timeout: 2_000,
  });
  await expect(page.getByRole('heading', { name: '패턴 일치' })).toBeFocused();
});

test('keeps the mobile CTA visible and follows axes, PULSE, Undo, Hint tab order', async ({
  page,
}) => {
  await page.setViewportSize({ height: 640, width: 360 });
  await openInteractiveFixture(page);

  const action = page.locator('[data-bottom-action="true"]');
  const actionBox = await action.boundingBox();
  expect(actionBox).not.toBeNull();
  expect(actionBox?.y ?? 641).toBeGreaterThanOrEqual(0);
  expect((actionBox?.y ?? 641) + (actionBox?.height ?? 0)).toBeLessThanOrEqual(640);

  const targetBox = await page.locator('[data-target-grid="true"]').boundingBox();
  expect(targetBox).not.toBeNull();
  expect(targetBox?.width ?? 0).toBeGreaterThanOrEqual(88);
  expect(targetBox?.width ?? 129).toBeLessThanOrEqual(128);
  expect(targetBox?.height ?? 0).toBe(targetBox?.width ?? -1);

  await page.getByRole('button', { name: /^Theme:/ }).focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '열 1 선택 안 됨' })).toBeFocused();
  await page.keyboard.press('Space');

  for (let index = 0; index < 5; index += 1) await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '열 6 선택 안 됨' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '행 A 선택 안 됨' })).toBeFocused();
  await page.keyboard.press('Space');

  for (let index = 0; index < 5; index += 1) await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '행 F 선택 안 됨' })).toBeFocused();
  await page.keyboard.press('Tab');

  const pulse = page.getByRole('button', { name: /PULSE/ });
  await expect(pulse).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute(
    'data-phase',
    /idle|selected/,
    {
      timeout: 2_000,
    },
  );
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /되돌리기/ })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { exact: true, name: '힌트' })).toBeFocused();
});

test('coalesces double-click, P, Ctrl/Cmd+Enter, and key repeat into one pulse request', async ({
  page,
}) => {
  await openInteractiveFixture(page);
  await activateAxes(page, ['A'], ['1']);

  await page.evaluate(() => {
    const pulse = document.querySelector<HTMLButtonElement>('[data-pulse-control="true"]');
    pulse?.click();
    pulse?.click();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'Enter' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', repeat: true }));
  });

  await expect(page.locator('[data-pulse-requests]')).toContainText('1');
});
