import { expect, test, type Page } from '@playwright/test';

import { DAILY_V1_GOLDEN_VECTORS } from '../../src/content/daily-v1.golden.ts';
import {
  DAILY_GENERATOR_VERSION,
  prngUint32Vector,
  puzzleOutputHash,
  stableSerialize,
  type DailyGenerationDiagnostics,
} from '../../src/domain/index.ts';
import { PRNG_V1_GOLDEN_VECTORS } from '../../src/domain/generator/prng-v1.golden.ts';

const TIMEZONE_MATRIX = ['UTC', 'Asia/Seoul', 'America/Los_Angeles'] as const;
const TIMEZONE_REPEATS = 10;

type BridgeScope = 'content' | 'generator';

interface BrowserParityBridge {
  readonly contentExports: readonly string[];
  readonly generatorExports: readonly string[];
  callContent(name: string, arguments_: readonly unknown[]): Promise<unknown>;
  callGenerator(name: string, arguments_: readonly unknown[]): Promise<unknown>;
}

interface BrowserParityGlobal {
  readonly __AXIS_SHIFT_GENERATOR_PARITY__?: BrowserParityBridge;
}

async function openParityHarness(page: Page): Promise<void> {
  const response = await page.goto('./tests/e2e/generator-parity.html');
  expect(response?.status()).toBe(200);
  await expect(page.locator('#generator-parity-status')).toHaveText(
    'Generator parity harness ready',
  );
}

async function browserExports(page: Page, scope: BridgeScope): Promise<readonly string[]> {
  return await page.evaluate((selectedScope) => {
    const bridge = (globalThis as unknown as BrowserParityGlobal).__AXIS_SHIFT_GENERATOR_PARITY__;
    if (!bridge) throw new Error('Generator parity bridge is not ready.');
    return selectedScope === 'content' ? bridge.contentExports : bridge.generatorExports;
  }, scope);
}

async function callBrowserExport<T>(
  page: Page,
  scope: BridgeScope,
  name: string,
  arguments_: readonly unknown[],
): Promise<T> {
  return (await page.evaluate(
    async (input) => {
      const bridge = (globalThis as unknown as BrowserParityGlobal).__AXIS_SHIFT_GENERATOR_PARITY__;
      if (!bridge) throw new Error('Generator parity bridge is not ready.');
      return input.scope === 'content'
        ? await bridge.callContent(input.name, input.arguments_)
        : await bridge.callGenerator(input.name, input.arguments_);
    },
    { arguments_, name, scope },
  )) as T;
}

function decodeUint32Vector(outputsHex: string): number[] {
  expect(outputsHex).toMatch(/^[0-9a-f]+$/u);
  expect(outputsHex).toHaveLength(100 * 8);
  return Array.from({ length: 100 }, (_, index) =>
    Number.parseInt(outputsHex.slice(index * 8, index * 8 + 8), 16),
  );
}

test('matches 20 fixed PRNG vectors in the actual browser bundle', async ({ page }) => {
  await openParityHarness(page);
  const exports = await browserExports(page, 'generator');
  expect(exports).toContain('prngUint32Vector');
  expect(PRNG_V1_GOLDEN_VECTORS).toHaveLength(20);

  for (const vector of PRNG_V1_GOLDEN_VECTORS) {
    const expected = decodeUint32Vector(vector.outputsHex);
    expect(prngUint32Vector(vector.seedInput, 100), `Node vector ${vector.seedInput}`).toEqual(
      expected,
    );
    const browserVector = await callBrowserExport<number[]>(page, 'generator', 'prngUint32Vector', [
      vector.seedInput,
      100,
    ]);
    expect(browserVector, `browser vector ${vector.seedInput}`).toEqual(expected);
  }
});

test('matches 20 fixed Daily snapshots in the actual browser bundle', async ({ page }) => {
  await openParityHarness(page);
  const exports = await browserExports(page, 'content');
  expect(exports).toContain('generateDailyPuzzleWithDiagnostics');
  expect(DAILY_V1_GOLDEN_VECTORS).toHaveLength(20);

  for (const { dateUtc, puzzleHash } of DAILY_V1_GOLDEN_VECTORS) {
    const input = { dateUtc, generatorVersion: DAILY_GENERATOR_VERSION };
    const actual = await callBrowserExport<DailyGenerationDiagnostics>(
      page,
      'content',
      'generateDailyPuzzleWithDiagnostics',
      [input],
    );
    expect(puzzleOutputHash(actual.puzzle), dateUtc).toBe(puzzleHash);
  }
});

test('keeps one Daily result stable for 10 repeats across browser timezones', async ({
  browser,
}) => {
  const dateUtc = '2028-02-29';
  const input = { dateUtc, generatorVersion: DAILY_GENERATOR_VERSION };
  const golden = DAILY_V1_GOLDEN_VECTORS.find((vector) => vector.dateUtc === dateUtc);
  if (!golden) throw new Error(`Missing Daily golden vector for ${dateUtc}.`);
  const baseURL = test.info().project.use.baseURL;
  if (typeof baseURL !== 'string') throw new Error('Generator parity test requires baseURL.');
  let expectedDiagnostics: string | undefined;

  for (const timezoneId of TIMEZONE_MATRIX) {
    const context = await browser.newContext({ baseURL, timezoneId });
    try {
      const page = await context.newPage();
      await openParityHarness(page);
      for (let repeat = 0; repeat < TIMEZONE_REPEATS; repeat += 1) {
        const actual = await callBrowserExport<DailyGenerationDiagnostics>(
          page,
          'content',
          'generateDailyPuzzleWithDiagnostics',
          [input],
        );
        const serialized = stableSerialize(actual);
        expectedDiagnostics ??= serialized;
        expect(serialized, `${timezoneId} repeat ${repeat + 1}`).toBe(expectedDiagnostics);
        expect(puzzleOutputHash(actual.puzzle), timezoneId).toBe(golden.puzzleHash);
      }
    } finally {
      await context.close();
    }
  }
});
