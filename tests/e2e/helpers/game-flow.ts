import { expect, type Page } from '@playwright/test';

import echoLevels from '../../../src/content/levels/echo.json' with { type: 'json' };
import noiseLevels from '../../../src/content/levels/noise.json' with { type: 'json' };
import pulseLevels from '../../../src/content/levels/pulse.json' with { type: 'json' };
import rankLevels from '../../../src/content/levels/rank.json' with { type: 'json' };
import tutorialLevels from '../../../src/content/levels/tutorial.json' with { type: 'json' };
import type { EncodedPulse, PuzzleDefinition } from '../../../src/domain/index.ts';

export const TUTORIAL_LEVELS = tutorialLevels.levels as readonly PuzzleDefinition[];
export const LAB_LEVELS = [pulseLevels, echoLevels, rankLevels, noiseLevels].flatMap(
  (levelFile) => levelFile.levels as readonly PuzzleDefinition[],
);

export const PROGRESS_STORAGE_KEY = 'axis-shift:progress:v1';
export const SESSION_STORAGE_KEY = 'axis-shift:session:v1';

export interface StoredBestRecord {
  readonly bestElapsedMs: number | null;
  readonly bestGrade: 'A' | 'B' | 'C' | 'S' | null;
  readonly bestPulseCount: number | null;
  readonly completed: boolean;
  readonly firstCompletedAt: string | null;
  readonly lastCompletedAt: string | null;
  readonly puzzleId: string;
}

export interface StoredProgress {
  readonly dailyRecords: Readonly<Record<string, unknown>>;
  readonly labRecords: Readonly<Record<string, StoredBestRecord>>;
  readonly schemaVersion: 1;
  readonly sprintBest: unknown;
  readonly tutorialCompleted: boolean;
}

interface StoredSessionEnvelope {
  readonly resumableSession: unknown | null;
  readonly schemaVersion: 1;
}

export async function useReducedMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

export async function openHashRoute(page: Page, hashPath: string): Promise<void> {
  const response = await page.goto(`./#${hashPath}`);
  if (response) expect(response.status()).toBe(200);
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(`#${hashPath}`);
}

async function rejectPersistence(page: Page, storageKey: string): Promise<void> {
  await page.evaluate((rejectedStorageKey) => {
    const target = window as typeof window & {
      __axisShiftOriginalSetItem?: typeof Storage.prototype.setItem;
    };
    const original = Storage.prototype.setItem;
    target.__axisShiftOriginalSetItem = original;
    Storage.prototype.setItem = function setItem(key: string, value: string): void {
      if (key === rejectedStorageKey) throw new Error('forced persistence failure');
      original.call(this, key, value);
    };
  }, storageKey);
}

export async function rejectProgressPersistence(page: Page): Promise<void> {
  await rejectPersistence(page, PROGRESS_STORAGE_KEY);
}

export async function rejectSessionPersistence(page: Page): Promise<void> {
  await rejectPersistence(page, SESSION_STORAGE_KEY);
}

export async function restoreSessionPersistence(page: Page): Promise<void> {
  await page.evaluate(() => {
    const target = window as typeof window & {
      __axisShiftOriginalSetItem?: typeof Storage.prototype.setItem;
    };
    const original = target.__axisShiftOriginalSetItem;
    if (original) {
      Storage.prototype.setItem = original;
      delete target.__axisShiftOriginalSetItem;
    }
  });
}

export async function boardSignature(page: Page): Promise<string> {
  return page
    .locator('[data-tensor-board="true"] [role="gridcell"]')
    .evaluateAll((cells) => cells.map((cell) => cell.getAttribute('data-state')).join(''));
}

function axisButtons(page: Page, axis: 'column' | 'row') {
  return page.locator(`[data-game-stage="true"] button[data-axis="${axis}"]`);
}

async function setAxisMaskWithInput(
  page: Page,
  axis: 'column' | 'row',
  mask: number,
  input: 'keyboard' | 'pointer',
): Promise<void> {
  const buttons = axisButtons(page, axis);
  await expect(buttons).not.toHaveCount(0);
  const count = await buttons.count();
  expect(mask >>> count, `${axis} mask ${String(mask)} exceeds ${String(count)} axes`).toBe(0);

  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    const selected = (await button.getAttribute('data-selected')) === 'true';
    const expected = (mask & (1 << index)) !== 0;
    if (selected === expected) continue;

    if (input === 'keyboard') {
      await button.focus();
      await page.keyboard.press(index % 2 === 0 ? 'Enter' : 'Space');
    } else {
      await button.click();
    }
    await expect(button).toHaveAttribute('data-selected', expected ? 'true' : 'false');
  }
}

export async function setAxisMask(page: Page, axis: 'column' | 'row', mask: number): Promise<void> {
  await setAxisMaskWithInput(page, axis, mask, 'pointer');
}

export async function setAxisMaskByKeyboard(
  page: Page,
  axis: 'column' | 'row',
  mask: number,
): Promise<void> {
  await setAxisMaskWithInput(page, axis, mask, 'keyboard');
}

async function waitForPulseCommit(page: Page, priorBoard: string): Promise<void> {
  const stage = page.locator('[data-game-stage="true"]');
  await expect.poll(() => boardSignature(page), { timeout: 5_000 }).not.toBe(priorBoard);
  await expect(stage).toHaveAttribute('data-phase', /^(?:idle|selected|solved)$/u, {
    timeout: 5_000,
  });
}

export async function applyPulse(page: Page, pulse: EncodedPulse): Promise<void> {
  await setAxisMask(page, 'row', pulse.rowMask);
  await setAxisMask(page, 'column', pulse.colMask);
  const priorBoard = await boardSignature(page);
  const control = page.locator('[data-pulse-control="true"]');
  await expect(control).toBeEnabled();
  await control.click();
  await waitForPulseCommit(page, priorBoard);
}

export async function applyPulseByKeyboard(page: Page, pulse: EncodedPulse): Promise<void> {
  await setAxisMaskByKeyboard(page, 'row', pulse.rowMask);
  await setAxisMaskByKeyboard(page, 'column', pulse.colMask);
  const priorBoard = await boardSignature(page);
  await page.keyboard.press('p');
  await waitForPulseCommit(page, priorBoard);
}

function canonicalSolution(puzzle: PuzzleDefinition): readonly EncodedPulse[] {
  expect(
    puzzle.canonicalSolution,
    `${puzzle.id} must expose a canonical solution to the E2E runner`,
  ).toBeDefined();
  return puzzle.canonicalSolution ?? [];
}

export async function solvePuzzle(
  page: Page,
  puzzle: PuzzleDefinition,
  input: 'keyboard' | 'pointer' = 'pointer',
): Promise<void> {
  await expect(page.locator('[data-game-stage="true"]')).toContainText(puzzle.id);
  for (const pulse of canonicalSolution(puzzle)) {
    if (input === 'keyboard') await applyPulseByKeyboard(page, pulse);
    else await applyPulse(page, pulse);
  }

  await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'solved');
  await expect(page.locator('[data-game-side="true"] h2[tabindex="-1"]')).toBeVisible();
}

export async function readStoredProgress(page: Page): Promise<StoredProgress | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as StoredProgress);
  }, PROGRESS_STORAGE_KEY);
}

export async function expectSessionCleared(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate((key) => {
          const raw = window.localStorage.getItem(key);
          if (raw === null) return false;
          const envelope = JSON.parse(raw) as StoredSessionEnvelope;
          return envelope.schemaVersion === 1 && envelope.resumableSession === null;
        }, SESSION_STORAGE_KEY),
      { timeout: 5_000 },
    )
    .toBe(true);
}

export async function expectLabRecord(
  page: Page,
  puzzleId: string,
  expected: Partial<StoredBestRecord> = { completed: true },
): Promise<StoredBestRecord> {
  await expect
    .poll(async () => (await readStoredProgress(page))?.labRecords[puzzleId] ?? null, {
      timeout: 5_000,
    })
    .toMatchObject({ completed: true, puzzleId, ...expected });

  const record = (await readStoredProgress(page))?.labRecords[puzzleId];
  expect(record).toBeDefined();
  return record as StoredBestRecord;
}
