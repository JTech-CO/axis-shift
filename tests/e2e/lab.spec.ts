import { expect, test } from '@playwright/test';

import {
  applyPulse,
  boardSignature,
  expectLabRecord,
  expectSessionCleared,
  LAB_LEVELS,
  openHashRoute,
  readStoredProgress,
  rejectSessionPersistence,
  restoreSessionPersistence,
  setAxisMask,
  solvePuzzle,
  TUTORIAL_LEVELS,
  useReducedMotion,
} from './helpers/game-flow.ts';

const firstLab = LAB_LEVELS[0];
if (!firstLab) throw new Error('M06 E2E requires at least one Lab puzzle.');
const firstPulse = firstLab.canonicalSolution?.[0];
if (!firstPulse) throw new Error('The first Lab puzzle needs a canonical PULSE.');

test.beforeEach(async ({ page }) => {
  await useReducedMotion(page);
});

test('shows four open Lab chapters with all 48 levels and safely recovers an invalid ID', async ({
  page,
}) => {
  await openHashRoute(page, '/lab');

  await expect(page.getByRole('heading', { level: 1, name: 'SIGNAL LAB' })).toBeVisible();
  await expect(page.locator('main h2[id^="lab-chapter-"]')).toHaveCount(4);
  const levelLinks = page.locator('main a[data-completed]');
  await expect(levelLinks).toHaveCount(48);
  expect(
    await levelLinks.evaluateAll((links) =>
      links.every((link) => link.getAttribute('data-completed') === 'false'),
    ),
  ).toBe(true);
  expect(
    await levelLinks.evaluateAll((links) =>
      links.every((link) => !link.hasAttribute('aria-disabled')),
    ),
  ).toBe(true);

  await openHashRoute(page, '/lab/not-a-level');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Lab 퍼즐을 찾을 수 없습니다' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Lab으로 돌아가기' }).click();
  await expect(page).toHaveURL(/#\/lab$/u);
  await expect(levelLinks).toHaveCount(48);
});

test('solves Tutorial 6 and Lab 48 in data order with every canonical solution', async ({
  browserName,
  page,
}) => {
  test.skip(browserName !== 'chromium', 'The exhaustive 54-level browser runner executes once.');
  test.setTimeout(180_000);

  await openHashRoute(page, '/tutorial?step=1');
  for (const [index, puzzle] of TUTORIAL_LEVELS.entries()) {
    await expect
      .poll(() => page.evaluate(() => window.location.hash))
      .toBe(`#/tutorial?step=${String(index + 1)}`);
    await solvePuzzle(page, puzzle);
    await expectSessionCleared(page);
    await page
      .getByRole('button', {
        name: index === TUTORIAL_LEVELS.length - 1 ? '첫 Lab 시작' : '다음 단계',
      })
      .click();
  }

  await expect.poll(async () => (await readStoredProgress(page))?.tutorialCompleted).toBe(true);

  for (const [index, puzzle] of LAB_LEVELS.entries()) {
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(`#/lab/${puzzle.id}`);
    await solvePuzzle(page, puzzle);
    await expectSessionCleared(page);
    await expectLabRecord(page, puzzle.id, {
      bestGrade: 'S',
      bestPulseCount: puzzle.optimalPulseCount,
    });

    if (index < LAB_LEVELS.length - 1) {
      await page.getByRole('button', { name: '다음 레벨' }).click();
    } else {
      await page.getByRole('link', { name: 'Lab으로 돌아가기' }).click();
    }
  }

  await expect(page).toHaveURL(/#\/lab$/u);
  const progress = await readStoredProgress(page);
  expect(Object.keys(progress?.labRecords ?? {})).toHaveLength(48);
  expect(LAB_LEVELS.every((puzzle) => progress?.labRecords[puzzle.id]?.completed === true)).toBe(
    true,
  );
});

test('coalesces rapid pointer and keyboard PULSE activation into one move and one result', async ({
  page,
}) => {
  await openHashRoute(page, `/lab/${firstLab.id}`);
  await setAxisMask(page, 'row', firstPulse.rowMask);
  await setAxisMask(page, 'column', firstPulse.colMask);

  await page.evaluate(() => {
    const pulse = document.querySelector<HTMLButtonElement>('[data-pulse-control="true"]');
    pulse?.click();
    pulse?.click();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'Enter' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', repeat: true }));
  });

  await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'solved');
  await expect(page.locator('[data-game-side="true"] h2[tabindex="-1"]')).toHaveCount(1);
  await expectLabRecord(page, firstLab.id, { bestGrade: 'S', bestPulseCount: 1 });
  await expectSessionCleared(page);
});

test('shows Hint 1–3, applies grade caps, and keeps the best replay tuple', async ({
  browserName,
  page,
}) => {
  test.skip(browserName !== 'chromium', 'One browser covers deterministic scoring integration.');
  await openHashRoute(page, `/lab/${firstLab.id}`);

  const hint = page.getByRole('button', { exact: true, name: '힌트' });
  await hint.click();
  await expect(page.getByText(/^남은 최소 PULSE 수: 1$/u)).toBeVisible();
  await hint.click();
  await expect(page.locator('button[data-axis="row"][data-hinted="true"]')).not.toHaveCount(0);
  await hint.click();
  await expect(page.locator('button[data-axis="column"][data-hinted="true"]')).not.toHaveCount(0);
  await solvePuzzle(page, firstLab);
  await expect(page.getByLabel('등급 B')).toBeVisible();
  const bRecord = await expectLabRecord(page, firstLab.id, {
    bestGrade: 'B',
    bestPulseCount: firstLab.optimalPulseCount,
  });

  await page.getByRole('button', { name: '다시 풀기' }).click();
  await page.getByRole('button', { exact: true, name: '힌트' }).click();
  await page.getByRole('button', { exact: true, name: '힌트' }).click();
  await solvePuzzle(page, firstLab);
  await expect(page.getByLabel('등급 A')).toBeVisible();
  const aRecord = await expectLabRecord(page, firstLab.id, { bestGrade: 'A' });
  expect(aRecord.firstCompletedAt).toBe(bRecord.firstCompletedAt);

  await page.getByRole('button', { name: '다시 풀기' }).click();
  await solvePuzzle(page, firstLab);
  await expect(page.getByLabel('등급 S')).toBeVisible();
  const sRecord = await expectLabRecord(page, firstLab.id, { bestGrade: 'S' });
  expect(sRecord.firstCompletedAt).toBe(bRecord.firstCompletedAt);

  await page.getByRole('button', { name: '다시 풀기' }).click();
  await page.getByRole('button', { exact: true, name: '힌트' }).click();
  await page.getByRole('button', { exact: true, name: '힌트' }).click();
  await page.getByRole('button', { exact: true, name: '힌트' }).click();
  await solvePuzzle(page, firstLab);
  await expect(page.getByLabel('등급 B')).toBeVisible();
  const keptRecord = await expectLabRecord(page, firstLab.id, { bestGrade: 'S' });
  expect(keptRecord.bestPulseCount).toBe(sRecord.bestPulseCount);
  expect(keptRecord.firstCompletedAt).toBe(sRecord.firstCompletedAt);
});

test('requires Reset confirmation, restores focus on cancel, and preserves a completed record', async ({
  browserName,
  page,
}) => {
  test.skip(browserName !== 'chromium', 'One browser covers dialog focus and record preservation.');
  await openHashRoute(page, `/lab/${firstLab.id}`);
  const initialBoard = await boardSignature(page);
  await solvePuzzle(page, firstLab);
  const completedRecord = await expectLabRecord(page, firstLab.id, { bestGrade: 'S' });

  await rejectSessionPersistence(page);
  await page.getByRole('button', { name: '다시 풀기' }).click();
  await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'solved');
  await expect(page.getByRole('alert')).toBeVisible();
  await restoreSessionPersistence(page);
  await page.getByRole('button', { name: '저장 다시 시도' }).click();
  await expect(page.getByRole('alert')).toBeHidden();

  await page.getByRole('button', { name: '다시 풀기' }).click();
  await applyPulse(page, { colMask: 1, rowMask: 1 });
  expect(await boardSignature(page)).not.toBe(initialBoard);

  const reset = page.getByRole('button', { name: /초기화$/u });
  await reset.focus();
  await reset.click();
  const dialog = page.getByRole('dialog', { name: '퍼즐을 초기화할까요?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: '취소' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(reset).toBeFocused();

  await page.keyboard.press('Shift+R');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { exact: true, name: '초기화' }).click();
  await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'idle');
  await expect.poll(() => boardSignature(page)).toBe(initialBoard);

  const preservedRecord = await expectLabRecord(page, firstLab.id, { bestGrade: 'S' });
  expect(preservedRecord).toEqual(completedRecord);
});
