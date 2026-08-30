import { expect, test, type Page } from '@playwright/test';

const SESSION_KEY = 'axis-shift:session:v1';
const PROGRESS_KEY = 'axis-shift:progress:v1';
const QUARANTINE_PREFIX = 'axis-shift:quarantine:v1:session:';
const LAB_LEVEL_ID = 'lab-01-pulse-05';

interface StoredMove {
  readonly actionId: string;
  readonly appliedAtMs: number;
  readonly colMask: number;
  readonly rowMask: number;
}

interface StoredSession {
  readonly acceptedPulseActionIds: readonly string[];
  readonly activeElapsedMs: number;
  readonly activeSinceEpochMs: number | null;
  readonly currentRows: readonly number[];
  readonly hiddenAtEpochMs: number | null;
  readonly hintLevelUsed: number;
  readonly lastObservedEpochMs: number | null;
  readonly moves: readonly StoredMove[];
  readonly puzzleId: string;
  readonly selectedColsMask: number;
  readonly selectedRowsMask: number;
  readonly status: string;
}

interface StoredSessionEnvelope {
  readonly resumableSession: StoredSession | null;
  readonly schemaVersion: number;
}

interface StoredLabRecord {
  readonly bestElapsedMs: number;
  readonly bestGrade: string;
  readonly bestPulseCount: number;
  readonly completed: boolean;
  readonly firstCompletedAt: string;
  readonly lastCompletedAt: string;
  readonly puzzleId: string;
}

async function openLabLevel(page: Page): Promise<void> {
  const response = await page.goto(`./#/lab/${LAB_LEVEL_ID}`);
  expect(response?.status()).toBe(200);
  await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'idle');
}

async function toggleMask(page: Page, axis: 'column' | 'row', mask: number): Promise<void> {
  const controls = page.locator(`button[data-axis="${axis}"]`);
  for (let index = 0; index < (await controls.count()); index += 1) {
    if ((mask & (1 << index)) !== 0) await controls.nth(index).click();
  }
}

async function pulse(page: Page): Promise<void> {
  const stage = page.locator('[data-game-stage="true"]');
  await page.locator('[data-pulse-control="true"]').click();
  await expect(stage).toHaveAttribute('data-phase', 'pulsing');
  await expect(stage).toHaveAttribute('data-phase', /idle|selected|solved/, { timeout: 2_000 });
}

async function boardSignature(page: Page): Promise<string> {
  return page
    .locator('[data-tensor-board="true"] [role="gridcell"]')
    .evaluateAll((cells) => cells.map((cell) => cell.getAttribute('data-state')).join(''));
}

async function selectedAxisSignature(page: Page): Promise<string> {
  return page
    .locator('button[data-axis]')
    .evaluateAll((buttons) =>
      buttons
        .map(
          (button, index) =>
            `${String(index)}:${button.getAttribute('data-axis')}:${button.getAttribute('data-selected')}`,
        )
        .join('|'),
    );
}

async function readSessionEnvelope(page: Page): Promise<StoredSessionEnvelope | null> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as StoredSessionEnvelope);
  }, SESSION_KEY);
}

async function readLabRecord(page: Page): Promise<StoredLabRecord | null> {
  return page.evaluate(
    ({ levelId, progressKey }) => {
      const raw = localStorage.getItem(progressKey);
      if (raw === null) return null;
      const progress = JSON.parse(raw) as {
        readonly labRecords?: Readonly<Record<string, StoredLabRecord>>;
      };
      return progress.labRecords?.[levelId] ?? null;
    },
    { levelId: LAB_LEVEL_ID, progressKey: PROGRESS_KEY },
  );
}

test('reload resumes selecting state with board, moves, timer, axes, and hint intact', async ({
  page,
}) => {
  await openLabLevel(page);

  await page.getByRole('button', { exact: true, name: '힌트' }).click();
  await toggleMask(page, 'row', 12);
  await toggleMask(page, 'column', 5);
  await pulse(page);

  // Leave the canonical second move selected so the persisted selecting state includes both axes.
  await toggleMask(page, 'row', 1);
  await toggleMask(page, 'column', 2);
  await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'preview');

  await expect
    .poll(async () => {
      const session = (await readSessionEnvelope(page))?.resumableSession;
      return session
        ? {
            cols: session.selectedColsMask,
            hint: session.hintLevelUsed,
            moves: session.moves.length,
            rows: session.selectedRowsMask,
          }
        : null;
    })
    .toEqual({ cols: 2, hint: 1, moves: 1, rows: 1 });

  const beforeEnvelope = await readSessionEnvelope(page);
  const before = beforeEnvelope?.resumableSession;
  expect(before).not.toBeNull();
  const beforeBoard = await boardSignature(page);
  const beforeAxes = await selectedAxisSignature(page);
  const beforeHint = await page
    .getByRole('button', { exact: true, name: '힌트' })
    .locator('..')
    .textContent();

  await page.reload();
  await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'preview');

  expect(await boardSignature(page)).toBe(beforeBoard);
  expect(await selectedAxisSignature(page)).toBe(beforeAxes);
  expect(
    await page.getByRole('button', { exact: true, name: '힌트' }).locator('..').textContent(),
  ).toBe(beforeHint);

  await expect
    .poll(async () => (await readSessionEnvelope(page))?.resumableSession?.moves.length ?? -1)
    .toBe(1);
  const after = (await readSessionEnvelope(page))?.resumableSession;
  expect(after?.currentRows).toEqual(before?.currentRows);
  expect(after?.moves).toEqual(before?.moves);
  expect(after?.hintLevelUsed).toBe(before?.hintLevelUsed);
  expect(after?.selectedRowsMask).toBe(before?.selectedRowsMask);
  expect(after?.selectedColsMask).toBe(before?.selectedColsMask);
  expect(after?.activeElapsedMs ?? -1).toBeGreaterThanOrEqual(before?.activeElapsedMs ?? 0);
});

test('pulsing fixture restores the last stable move and completes exactly once', async ({
  page,
}) => {
  await openLabLevel(page);

  await toggleMask(page, 'row', 12);
  await toggleMask(page, 'column', 5);
  await pulse(page);
  await expect
    .poll(async () => (await readSessionEnvelope(page))?.resumableSession?.moves.length ?? -1)
    .toBe(1);

  const stableBoard = await boardSignature(page);
  await page.evaluate((sessionKey) => {
    const envelope = JSON.parse(
      localStorage.getItem(sessionKey) ?? 'null',
    ) as StoredSessionEnvelope;
    if (envelope?.resumableSession === null || envelope?.resumableSession === undefined) {
      throw new Error('Expected a resumable session fixture.');
    }
    const session = envelope.resumableSession;
    localStorage.setItem(
      sessionKey,
      JSON.stringify({
        ...envelope,
        resumableSession: {
          ...session,
          activeSinceEpochMs: session.lastObservedEpochMs,
          hiddenAtEpochMs: null,
          selectedColsMask: 0,
          selectedRowsMask: 0,
          status: 'pulsing',
        },
      }),
    );
  }, SESSION_KEY);

  await page.reload();
  await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'idle');
  expect(await boardSignature(page)).toBe(stableBoard);
  await expect
    .poll(async () => {
      const session = (await readSessionEnvelope(page))?.resumableSession;
      return session
        ? { accepted: session.acceptedPulseActionIds.length, moves: session.moves.length }
        : null;
    })
    .toEqual({ accepted: 1, moves: 1 });

  await toggleMask(page, 'row', 1);
  await toggleMask(page, 'column', 2);
  await pulse(page);
  await expect(page.getByRole('heading', { name: '패턴 일치' })).toHaveCount(1);

  await expect.poll(async () => (await readLabRecord(page))?.bestPulseCount ?? -1).toBe(2);
  await expect
    .poll(async () => {
      const envelope = await readSessionEnvelope(page);
      return envelope === null ? 'missing-envelope' : envelope.resumableSession;
    })
    .toBeNull();
  const firstRecord = await readLabRecord(page);
  expect(firstRecord).toMatchObject({ completed: true, puzzleId: LAB_LEVEL_ID });
  expect(firstRecord?.firstCompletedAt).toBe(firstRecord?.lastCompletedAt);

  await page.reload();
  await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'idle');
  expect(await readLabRecord(page)).toEqual(firstRecord);
});

test('invalid session JSON is quarantined and replaced by a playable fresh session', async ({
  page,
}) => {
  const response = await page.goto('./');
  expect(response?.status()).toBe(200);
  const corrupt = '{"schemaVersion":1,"resumableSession":';
  await page.evaluate(
    ({ raw, sessionKey }) => {
      localStorage.clear();
      localStorage.setItem(sessionKey, raw);
      window.location.hash = '/lab/lab-01-pulse-05';
    },
    { raw: corrupt, sessionKey: SESSION_KEY },
  );

  await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'idle');
  await expect
    .poll(async () =>
      page.evaluate(
        ({ prefix, raw }) =>
          Object.keys(localStorage)
            .filter((key) => key.startsWith(prefix))
            .map((key) => ({ key, value: localStorage.getItem(key) }))
            .filter((entry) => entry.value === raw),
        { prefix: QUARANTINE_PREFIX, raw: corrupt },
      ),
    )
    .toHaveLength(1);

  const quarantined = await page.evaluate(
    ({ prefix, raw }) =>
      Object.keys(localStorage).find(
        (key) => key.startsWith(prefix) && localStorage.getItem(key) === raw,
      ) ?? null,
    { prefix: QUARANTINE_PREFIX, raw: corrupt },
  );
  expect(quarantined).toContain(':invalid-json:');

  await expect
    .poll(async () => (await readSessionEnvelope(page))?.resumableSession?.puzzleId ?? null)
    .toBe(LAB_LEVEL_ID);
  const repaired = await readSessionEnvelope(page);
  expect(repaired).toMatchObject({
    resumableSession: { moves: [], status: 'ready' },
    schemaVersion: 1,
  });

  await toggleMask(page, 'row', 1);
  await toggleMask(page, 'column', 1);
  await expect(page.locator('[data-game-stage="true"]')).toHaveAttribute('data-phase', 'preview');
});
