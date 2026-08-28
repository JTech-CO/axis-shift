import { expect, test, type Page } from '@playwright/test';

const viewports = [
  { height: 640, name: 'mobile-360x640', width: 360 },
  { height: 844, name: 'mobile-390x844', width: 390 },
  { height: 1024, name: 'tablet-768x1024', width: 768 },
  { height: 768, name: 'landscape-1024x768', width: 1024 },
  { height: 900, name: 'desktop-1440x900', width: 1440 },
] as const;

const baselineViewports = [
  { height: 640, name: 'mobile-360x640', width: 360 },
  { height: 1024, name: 'tablet-768x1024', width: 768 },
  { height: 900, name: 'desktop-1440x900', width: 1440 },
] as const;

const themes = ['dark', 'light', 'system'] as const;

type ThemeName = (typeof themes)[number];

async function openFixture(page: Page, fixture = 'preview') {
  const response = await page.goto('tests/ui-fixtures/?fixture=' + fixture);
  expect(response?.status()).toBe(200);
  await expect(page.locator('body')).toHaveAttribute('data-fixture-ready', 'true');
}

async function setTheme(page: Page, target: ThemeName) {
  const root = page.locator('html');
  const control = page.getByRole('button', { name: /^Theme:/ });
  let attempts = 0;
  while (attempts < themes.length) {
    if ((await root.getAttribute('data-theme')) === target) return;
    await control.click();
    attempts += 1;
  }
  await expect(root).toHaveAttribute('data-theme', target);
}

async function setMotion(page: Page, target: 'system' | 'reduced') {
  const root = page.locator('html');
  const control = page.getByRole('button', { name: /^Motion:/ });
  let attempts = 0;
  while (attempts < 2) {
    if ((await root.getAttribute('data-motion')) === target) return;
    await control.click();
    attempts += 1;
  }
  await expect(root).toHaveAttribute('data-motion', target);
}

interface Box {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

function requireBox(box: Box | null, label: string): asserts box is Box {
  expect(box, label + ' has no bounding box').not.toBeNull();
  if (box === null) throw new Error(label + ' has no bounding box');
}

function intersectionArea(left: Box, right: Box) {
  const width = Math.max(
    0,
    Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x),
  );
  const height = Math.max(
    0,
    Math.min(left.y + left.height, right.y + right.height) - Math.max(left.y, right.y),
  );
  return width * height;
}

for (const viewport of viewports) {
  test(viewport.name + ' has no overflow, overlap, or sub-44px controls', async ({ page }) => {
    await page.setViewportSize(viewport);
    await openFixture(page);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const board = await page.locator('[data-tensor-board="true"]').boundingBox();
    const boardPanel = await page.locator('[data-board-panel="true"]').boundingBox();
    const targetPanel = await page.locator('[data-target-preview="true"]').boundingBox();
    const sidePanel = await page.locator('[data-game-side="true"]').boundingBox();
    const action = await page.locator('[data-bottom-action="true"]').boundingBox();
    requireBox(board, 'board');
    requireBox(boardPanel, 'board panel');
    requireBox(targetPanel, 'target panel');
    requireBox(sidePanel, 'side panel');
    requireBox(action, 'bottom action');
    expect(intersectionArea(board, action)).toBe(0);
    expect(intersectionArea(boardPanel, targetPanel)).toBe(0);
    expect(intersectionArea(boardPanel, sidePanel)).toBe(0);
    expect(intersectionArea(targetPanel, sidePanel)).toBe(0);

    const targets = page.locator(
      'button:visible, select:visible, a[href]:visible, summary:visible, input:visible',
    );
    const count = await targets.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
      const box = await targets.nth(index).boundingBox();
      expect(box, 'target ' + index + ' has no bounding box').not.toBeNull();
      expect(box?.width ?? 0, 'target ' + index + ' width').toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0, 'target ' + index + ' height').toBeGreaterThanOrEqual(44);
    }

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const boardAfterScroll = await page.locator('[data-tensor-board="true"]').boundingBox();
    const actionAfterScroll = await page.locator('[data-bottom-action="true"]').boundingBox();
    requireBox(boardAfterScroll, 'board after scroll');
    requireBox(actionAfterScroll, 'bottom action after scroll');
    expect(intersectionArea(boardAfterScroll, actionAfterScroll)).toBe(0);
  });
}

test('long-copy remains within the 360px viewport', async ({ page }) => {
  await page.setViewportSize({ height: 640, width: 360 });
  const response = await page.goto('tests/ui-fixtures/?fixture=preview&long=1');
  expect(response?.status()).toBe(200);
  await expect(page.locator('body')).toHaveAttribute('data-fixture-ready', 'true');

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.getByRole('heading', { level: 1, name: /지역화 문구/ })).toBeVisible();
});

test('theme button cycles dark, light, system and follows preferred color scheme', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await openFixture(page);
  const href = page.url();
  const root = page.locator('html');
  const control = page.getByRole('button', { name: /^Theme:/ });

  await expect(root).toHaveAttribute('data-theme', 'dark');
  const darkCanvas = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--color-canvas').trim(),
  );

  await control.click();
  await expect(root).toHaveAttribute('data-theme', 'light');
  const lightCanvas = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--color-canvas').trim(),
  );

  await control.click();
  await expect(root).toHaveAttribute('data-theme', 'system');
  const systemCanvas = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--color-canvas').trim(),
  );

  await control.click();
  await expect(root).toHaveAttribute('data-theme', 'dark');
  expect(lightCanvas).not.toBe(darkCanvas);
  expect(systemCanvas).toBe(lightCanvas);
  expect(page.url()).toBe(href);
});

test('selection and selected-axis semantic pairs keep AA contrast in every theme', async ({
  page,
}) => {
  await openFixture(page);

  for (const theme of themes) {
    await setTheme(page, theme);
    const ratios = await page.evaluate(() => {
      function parseRgb(value: string): readonly number[] {
        const channels = value
          .match(/[\d.]+/g)
          ?.slice(0, 3)
          .map(Number);
        if (!channels || channels.length !== 3) throw new Error('Expected an RGB color: ' + value);
        return channels;
      }
      function luminance(channels: readonly number[]): number {
        const linear = channels.map((channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
      }
      function ratio(foreground: string, background: string): number {
        const first = luminance(parseRgb(foreground));
        const second = luminance(parseRgb(background));
        const lighter = Math.max(first, second);
        const darker = Math.min(first, second);
        return (lighter + 0.05) / (darker + 0.05);
      }
      function resolvedPair(foreground: string, background: string): readonly [string, string] {
        const probe = document.createElement('span');
        probe.style.color = foreground;
        probe.style.backgroundColor = background;
        document.body.append(probe);
        const style = getComputedStyle(probe);
        const pair = [style.color, style.backgroundColor] as const;
        probe.remove();
        return pair;
      }

      const selection = resolvedPair('var(--color-selection-text)', 'var(--color-secondary)');
      const selectedAxis = resolvedPair(
        'var(--color-axis-selected-text)',
        'var(--color-surface-raised)',
      );
      return {
        selectedAxis: ratio(selectedAxis[0], selectedAxis[1]),
        selection: ratio(selection[0], selection[1]),
      };
    });

    expect(ratios.selection, theme + ' selection contrast').toBeGreaterThanOrEqual(4.5);
    expect(ratios.selectedAxis, theme + ' selected axis contrast').toBeGreaterThanOrEqual(4.5);
  }
});

test('motion button toggles reduced transitions at 80ms without animation events', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openFixture(page, 'pulsing');
  await setMotion(page, 'reduced');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');

  const durations = await page.locator('[data-pulse="true"]').evaluateAll((cells) =>
    cells.map((cell) => {
      const value = getComputedStyle(cell).animationDuration.trim();
      return value.endsWith('ms') ? Number.parseFloat(value) : Number.parseFloat(value) * 1_000;
    }),
  );
  expect(durations.length).toBeGreaterThan(0);
  expect(Math.max(...durations)).toBeLessThanOrEqual(80);

  await setMotion(page, 'system');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'system');
});

for (const theme of themes) {
  for (const viewport of baselineViewports) {
    test('baseline ' + theme + ' ' + viewport.name, async ({ page }) => {
      if (theme === 'system') await page.emulateMedia({ colorScheme: 'dark' });
      await page.setViewportSize(viewport);
      await openFixture(page);
      await setTheme(page, theme);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      await expect(page.locator('[data-ui-fixture-app="true"]')).toHaveScreenshot(
        'preview-' + theme + '-' + viewport.name + '.png',
      );
    });
  }
}
