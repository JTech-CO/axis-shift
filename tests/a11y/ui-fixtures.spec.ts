import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

type ThemeName = 'system' | 'light';

interface FixtureCase {
  readonly name: string;
  readonly query: string;
  readonly reducedMotion?: boolean;
  readonly theme?: ThemeName;
}

const fixtureCases: readonly FixtureCase[] = [
  { name: 'idle', query: 'fixture=idle' },
  { name: 'selected', query: 'fixture=selected' },
  { name: 'preview', query: 'fixture=preview' },
  { name: 'pulsing', query: 'fixture=pulsing' },
  { name: 'paused', query: 'fixture=paused' },
  { name: 'solved', query: 'fixture=solved' },
  { name: 'error', query: 'fixture=error' },
  { name: 'disabled', query: 'fixture=disabled' },
  { name: 'long-copy', query: 'fixture=preview&long=1' },
  { name: 'preview-system', query: 'fixture=preview', theme: 'system' },
  { name: 'solved-system', query: 'fixture=solved', theme: 'system' },
  { name: 'error-system', query: 'fixture=error', theme: 'system' },
  { name: 'preview-light', query: 'fixture=preview', theme: 'light' },
  { name: 'solved-light', query: 'fixture=solved', theme: 'light' },
  { name: 'error-light', query: 'fixture=error', theme: 'light' },
  { name: 'preview-reduced-motion', query: 'fixture=preview', reducedMotion: true },
  { name: 'solved-reduced-motion', query: 'fixture=solved', reducedMotion: true },
  { name: 'error-reduced-motion', query: 'fixture=error', reducedMotion: true },
];

async function setTheme(page: import('@playwright/test').Page, target: ThemeName) {
  const root = page.locator('html');
  const control = page.getByRole('button', { name: /^Theme:/ });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if ((await root.getAttribute('data-theme')) === target) return;
    await control.click();
  }
  await expect(root).toHaveAttribute('data-theme', target);
}

for (const fixtureCase of fixtureCases) {
  test(
    fixtureCase.name + ' has no serious or critical axe violations',
    async ({ page }, testInfo) => {
      const externalRequests: string[] = [];
      page.on('request', (request) => {
        const url = new URL(request.url());
        if (url.host !== '127.0.0.1:4174') externalRequests.push(request.url());
      });

      if (fixtureCase.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }
      const response = await page.goto('tests/ui-fixtures/?' + fixtureCase.query);
      expect(response?.status()).toBe(200);
      await expect(page.locator('body')).toHaveAttribute('data-fixture-ready', 'true');

      if (fixtureCase.theme) {
        await setTheme(page, fixtureCase.theme);
        await expect(page.locator('html')).toHaveAttribute('data-theme', fixtureCase.theme);
      }
      if (fixtureCase.reducedMotion) {
        await page.getByRole('button', { name: /^Motion: system/ }).click();
        await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
      }
      if (fixtureCase.theme || fixtureCase.reducedMotion) {
        await page.keyboard.press(fixtureCase.reducedMotion ? 'Shift+Tab' : 'Tab');
        const focusTarget = page.getByRole('button', {
          name: fixtureCase.reducedMotion ? /^Theme:/ : /^Motion:/,
        });
        await expect(focusTarget).toBeFocused();
        const hasVisibleFocus = await focusTarget.evaluate((element) => {
          const style = getComputedStyle(element);
          return style.boxShadow !== 'none' || style.outlineStyle !== 'none';
        });
        expect(hasVisibleFocus).toBe(true);
      }

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const blocking = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      );

      await testInfo.attach('axe-' + fixtureCase.name + '.json', {
        body: Buffer.from(JSON.stringify(results.violations, null, 2)),
        contentType: 'application/json',
      });

      const blockingSummary = blocking.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.length,
        targets: violation.nodes.slice(0, 3).map((node) => node.target),
      }));
      expect(blockingSummary).toEqual([]);
      expect(externalRequests).toEqual([]);
    },
  );
}
