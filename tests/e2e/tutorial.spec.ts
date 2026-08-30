import { expect, test, type Page } from '@playwright/test';

import {
  expectLabRecord,
  expectSessionCleared,
  LAB_LEVELS,
  openHashRoute,
  readStoredProgress,
  rejectProgressPersistence,
  rejectSessionPersistence,
  restoreSessionPersistence,
  solvePuzzle,
  TUTORIAL_LEVELS,
  useReducedMotion,
} from './helpers/game-flow.ts';

const NEXT_STEP_LABEL = '다음 단계';
const START_LAB_LABEL = '첫 Lab 시작';
function requiredLabLevel(index: number) {
  const level = LAB_LEVELS[index];
  if (!level) throw new Error(`M06 first-run E2E requires Lab level ${String(index + 1)}.`);
  return level;
}

const firstLab = requiredLabLevel(0);
const secondLab = requiredLabLevel(1);
const secondTutorial = TUTORIAL_LEVELS[1];
if (!secondTutorial) throw new Error('M06 E2E requires Tutorial step 2.');

async function advanceTutorial(
  page: Page,
  stepIndex: number,
  input: 'keyboard' | 'pointer',
): Promise<void> {
  const button = page.getByRole('button', {
    name: stepIndex === TUTORIAL_LEVELS.length - 1 ? START_LAB_LABEL : NEXT_STEP_LABEL,
  });
  await expect(button).toBeVisible();
  if (input === 'keyboard') {
    await button.focus();
    await page.keyboard.press('Enter');
  } else {
    await button.click();
  }
}

async function completeTutorialAndFirstLab(
  page: Page,
  input: 'keyboard' | 'pointer',
): Promise<void> {
  for (const [index, puzzle] of TUTORIAL_LEVELS.entries()) {
    await expect
      .poll(() => page.evaluate(() => window.location.hash))
      .toBe(`#/tutorial?step=${String(index + 1)}`);
    await expect(page.locator('[data-learning-goal]')).toHaveAttribute(
      'data-learning-goal-satisfied',
      'false',
    );
    await solvePuzzle(page, puzzle, input);
    await expect(page.locator('[data-learning-goal]')).toHaveAttribute(
      'data-learning-goal-satisfied',
      'true',
    );
    await expectSessionCleared(page);
    await advanceTutorial(page, index, input);
  }

  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(`#/lab/${firstLab.id}`);
  await solvePuzzle(page, firstLab, input);
  await expectSessionCleared(page);
  await expectLabRecord(page, firstLab.id, {
    bestGrade: 'S',
    bestPulseCount: firstLab.optimalPulseCount,
  });
}

test.beforeEach(async ({ page }) => {
  await useReducedMotion(page);
});

test('takes an empty-storage user from Home through six Tutorial steps and the first Lab', async ({
  page,
}) => {
  await openHashRoute(page, '/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'system');
  await page.getByRole('link', { name: '45초 튜토리얼 시작' }).click();

  await completeTutorialAndFirstLab(page, 'pointer');
  await expect.poll(async () => (await readStoredProgress(page))?.tutorialCompleted).toBe(true);

  await page.getByRole('button', { name: '다음 레벨' }).click();
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(`#/lab/${secondLab.id}`);
});

test('supports the complete first-run path with keyboard activation only', async ({
  browserName,
  page,
}) => {
  test.skip(browserName !== 'chromium', 'One keyboard engine is sufficient for the M06 gate.');

  await openHashRoute(page, '/');
  const start = page.getByRole('link', { name: '45초 튜토리얼 시작' });
  await start.focus();
  await page.keyboard.press('Enter');

  await completeTutorialAndFirstLab(page, 'keyboard');
  await expect(page.locator('[data-game-side="true"] h2[tabindex="-1"]')).toBeFocused();
  await expect.poll(async () => (await readStoredProgress(page))?.tutorialCompleted).toBe(true);
});

test('applies the documented Tutorial back and skip policy without creating a level record', async ({
  page,
}) => {
  await openHashRoute(page, '/tutorial?step=3');

  await rejectSessionPersistence(page);
  await page.getByRole('button', { name: '이전 단계' }).click();
  await expect(page).toHaveURL(/#\/tutorial\?step=3$/u);
  await expect(page.getByRole('alert')).toBeVisible();
  await restoreSessionPersistence(page);
  await page.getByRole('button', { name: '저장 다시 시도' }).click();
  await expect(page.getByRole('alert')).toBeHidden();

  await page.getByRole('button', { name: '이전 단계' }).click();
  await expect(page).toHaveURL(/#\/tutorial\?step=2$/u);
  await expect(page.locator('[data-game-stage="true"]')).toContainText('tutorial-02-column');

  await solvePuzzle(page, secondTutorial);
  await rejectSessionPersistence(page);
  await page.getByRole('button', { name: NEXT_STEP_LABEL }).click();
  await expect(page).toHaveURL(/#\/tutorial\?step=2$/u);
  await expect(page.getByRole('alert')).toBeVisible();
  await restoreSessionPersistence(page);
  await page.getByRole('button', { name: '저장 다시 시도' }).click();
  await expect(page.getByRole('alert')).toBeHidden();
  await page.getByRole('button', { name: NEXT_STEP_LABEL }).click();
  await expect(page).toHaveURL(/#\/tutorial\?step=3$/u);

  await rejectSessionPersistence(page);
  await page.getByRole('button', { name: '튜토리얼 건너뛰기' }).click();
  await expect(page).toHaveURL(/#\/tutorial\?step=3$/u);
  await expect(page.getByRole('alert')).toBeVisible();
  await restoreSessionPersistence(page);
  await page.getByRole('button', { name: '저장 다시 시도' }).click();
  await expect(page.getByRole('alert')).toBeHidden();

  await rejectProgressPersistence(page);
  await page.getByRole('button', { name: '튜토리얼 건너뛰기' }).click();
  await expect(page).toHaveURL(/#\/tutorial\?step=3$/u);
  await expect(page.getByRole('alert')).toBeVisible();
  await restoreSessionPersistence(page);

  await page.getByRole('button', { name: '튜토리얼 건너뛰기' }).click();
  await expect(page).toHaveURL(/#\/lab$/u);
  await expect.poll(async () => (await readStoredProgress(page))?.tutorialCompleted).toBe(true);
  expect(Object.keys((await readStoredProgress(page))?.labRecords ?? {})).toHaveLength(0);
  await expectSessionCleared(page);
});

test('has no horizontal overflow or overlapping Tutorial surfaces at 360px', async ({
  browserName,
  page,
}) => {
  test.skip(browserName !== 'chromium', 'Responsive geometry is covered once in Chromium.');
  await page.setViewportSize({ height: 640, width: 360 });
  await openHashRoute(page, '/tutorial?step=1');

  const layout = await page.evaluate(() => {
    const required = (selector: string): HTMLElement => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Missing responsive target: ${selector}`);
      return element;
    };
    const documentRect = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return {
        bottom: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        right: rect.right + window.scrollX,
        top: rect.top + window.scrollY,
      };
    };
    const overlaps = (
      left: ReturnType<typeof documentRect>,
      right: ReturnType<typeof documentRect>,
    ) =>
      left.left < right.right &&
      left.right > right.left &&
      left.top < right.bottom &&
      left.bottom > right.top;

    const coachmark = documentRect(required('[data-learning-goal]'));
    const board = documentRect(required('[data-tensor-board="true"]'));
    const action = documentRect(required('[data-bottom-action="true"]'));
    const target = documentRect(required('[data-target-preview="true"]'));
    return {
      coachmarkOverlapsBoard: overlaps(coachmark, board),
      actionOverlapsBoard: overlaps(action, board),
      targetOverlapsBoard: overlaps(target, board),
      horizontalOverflow:
        Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) -
        document.documentElement.clientWidth,
      surfacesInsideViewport: [coachmark, board, action, target].every(
        (rect) => rect.left >= 0 && rect.right <= document.documentElement.clientWidth,
      ),
    };
  });

  expect(layout.horizontalOverflow).toBeLessThanOrEqual(0);
  expect(layout.surfacesInsideViewport).toBe(true);
  expect(layout.coachmarkOverlapsBoard).toBe(false);
  expect(layout.actionOverlapsBoard).toBe(false);
  expect(layout.targetOverlapsBoard).toBe(false);

  const stickyPulse = page.locator('[data-bottom-action="true"]');
  await stickyPulse.scrollIntoViewIfNeeded();
  const pulseBox = await stickyPulse.boundingBox();
  expect(pulseBox).not.toBeNull();
  expect(pulseBox?.y ?? -1).toBeGreaterThanOrEqual(0);
  expect((pulseBox?.y ?? 642) + (pulseBox?.height ?? 0)).toBeLessThanOrEqual(641);
});
