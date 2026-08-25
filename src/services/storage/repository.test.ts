import { describe, expect, it } from 'vitest';

import {
  createGameSessionState,
  gameSessionReducer,
  type GameSession,
} from '../../domain/session/index.ts';
import type { PuzzleDefinition } from '../../domain/types.ts';
import emptyFixture from '../../test/fixtures/storage/empty.json';
import futureFixture from '../../test/fixtures/storage/future-version.json';
import invalidFieldsFixture from '../../test/fixtures/storage/invalid-fields.json';
import invalidJsonFixture from '../../test/fixtures/storage/invalid-json.json';
import missingFixture from '../../test/fixtures/storage/missing.json';
import partialFixture from '../../test/fixtures/storage/partial-v1.json';
import pulsingFixture from '../../test/fixtures/storage/resumable-pulsing.json';
import solvedFixture from '../../test/fixtures/storage/resumable-solved.json';
import validFixture from '../../test/fixtures/storage/valid-v1.json';
import writeFailureFixture from '../../test/fixtures/storage/write-failure.json';
import type { StoragePort } from './local-storage-adapter.ts';
import { createStorageRepository } from './repository.ts';
import {
  DEFAULT_GENERATOR_MAP_SNAPSHOT,
  DEFAULT_PROGRESS,
  DEFAULT_USER_SETTINGS,
  STORAGE_KEYS,
  type ProgressEnvelopeV1,
  type UserSettings,
} from './schema.ts';

const PUZZLE: PuzzleDefinition = Object.freeze({
  schemaVersion: 1,
  id: 'storage-puzzle',
  mode: 'lab',
  generatorVersion: 'v1',
  size: 3,
  initialRows: [0, 0, 0],
  targetRows: [1, 0, 0],
  optimalPulseCount: 1,
  canonicalSolution: [{ rowMask: 1, colMask: 1 }],
  difficulty: 'easy',
  complexityScore: 1,
  tags: [],
});

const resolvePuzzle = (puzzleId: string): PuzzleDefinition | undefined =>
  puzzleId === PUZZLE.id ? PUZZLE : undefined;

interface Faults {
  readonly read?: (key: string) => boolean;
  readonly remove?: (key: string) => boolean;
  readonly write?: (key: string) => boolean;
}

function storageHarness(
  initial: Readonly<Record<string, string>> = {},
  faults: Faults = {},
): { readonly port: StoragePort; readonly snapshot: () => Readonly<Record<string, string>> } {
  const values = new Map(Object.entries(initial));
  return {
    port: {
      getItem: (key) => {
        if (faults.read?.(key)) throw new Error('read failure');
        return values.get(key) ?? null;
      },
      removeItem: (key) => {
        if (faults.remove?.(key)) throw new Error('remove failure');
        values.delete(key);
      },
      setItem: (key, value) => {
        if (faults.write?.(key)) throw new Error('write failure');
        values.set(key, value);
      },
    },
    snapshot: () => Object.fromEntries(values),
  };
}

function fixtureRaw(raw: unknown): string {
  return typeof raw === 'string' ? raw : JSON.stringify(raw);
}

function repositoryFor(harness: ReturnType<typeof storageHarness>, onWarning?: () => void) {
  let quarantineId = 0;
  return createStorageRepository({
    storage: harness.port,
    resolvePuzzle,
    createQuarantineId: () => `fixture-${String(++quarantineId)}`,
    onWarning,
  });
}

describe('storage repository fixture matrix', () => {
  it('handles missing and valid-v1 settings without recovery warnings', () => {
    expect(missingFixture.case).toBe('missing');
    const missingHarness = storageHarness();
    const missingRepository = repositoryFor(missingHarness);
    expect(missingRepository.loadSettings()).toEqual(DEFAULT_USER_SETTINGS);
    expect(missingRepository.getWarnings()).toEqual([]);

    expect(validFixture.case).toBe('valid-v1');
    const validHarness = storageHarness({
      [STORAGE_KEYS.settings]: fixtureRaw(validFixture.raw),
    });
    const validRepository = repositoryFor(validHarness);
    expect(validRepository.loadSettings()).toEqual(validFixture.raw);
    expect(validRepository.getWarnings()).toEqual([]);
  });

  it.each([
    [emptyFixture.case, emptyFixture.raw, 'empty'],
    [invalidJsonFixture.case, invalidJsonFixture.raw, 'invalid-json'],
    [futureFixture.case, futureFixture.raw, 'future-version'],
    [partialFixture.case, partialFixture.raw, 'invalid-fields'],
  ] as const)('quarantines %s raw bytes before removing the primary key', (_case, raw, reason) => {
    const serialized = fixtureRaw(raw);
    const harness = storageHarness({ [STORAGE_KEYS.settings]: serialized });
    const repository = repositoryFor(harness);
    expect(repository.loadSettings()).toEqual(DEFAULT_USER_SETTINGS);
    const snapshot = harness.snapshot();
    expect(snapshot[STORAGE_KEYS.settings]).toBeUndefined();
    const quarantineEntry = Object.entries(snapshot).find(([key]) =>
      key.startsWith(`axis-shift:quarantine:v1:settings:${reason}:`),
    );
    expect(quarantineEntry?.[1]).toBe(serialized);
    expect(repository.getWarnings()).toContainEqual({
      code: reason,
      key: STORAGE_KEYS.settings,
      keyKind: 'settings',
    });
  });

  it('quarantines invalid progress while salvaging each valid best record', () => {
    expect(invalidFieldsFixture.case).toBe('invalid-fields');
    const raw = fixtureRaw(invalidFieldsFixture.raw);
    const harness = storageHarness({ [STORAGE_KEYS.progress]: raw });
    const repository = repositoryFor(harness);
    const progress = repository.loadProgress();
    expect(progress.tutorialCompleted).toBe(false);
    expect(Object.keys(progress.labRecords)).toEqual(['lab-valid']);
    expect(progress.labRecords['lab-valid']).toMatchObject({
      puzzleId: 'lab-valid',
      bestGrade: 'A',
    });
    const repairedRaw = harness.snapshot()[STORAGE_KEYS.progress];
    expect(repairedRaw).toBeDefined();
    expect(Object.values(harness.snapshot())).toContain(raw);
    expect(repository.loadProgress().labRecords['lab-valid']).toBeDefined();
    expect(repositoryFor(harness).loadProgress().labRecords['lab-valid']).toBeDefined();
  });

  it('preserves the primary raw value when quarantine backup fails', () => {
    const raw = fixtureRaw(invalidJsonFixture.raw);
    const harness = storageHarness(
      { [STORAGE_KEYS.settings]: raw },
      { write: (key) => key.startsWith('axis-shift:quarantine:') },
    );
    const repository = repositoryFor(harness);
    expect(repository.loadSettings()).toEqual(DEFAULT_USER_SETTINGS);
    expect(harness.snapshot()[STORAGE_KEYS.settings]).toBe(raw);
    expect(repository.getWarnings().map((warning) => warning.code)).toEqual([
      'invalid-json',
      'quarantine-write-failed',
    ]);
  });

  it('deduplicates read and write warnings by repository key/code', () => {
    expect(writeFailureFixture.case).toBe('write-failure');
    const writeHarness = storageHarness({}, { write: (key) => key === STORAGE_KEYS.settings });
    const writeEvents: unknown[] = [];
    const writeRepository = repositoryFor(writeHarness, () => writeEvents.push(true));
    expect(writeRepository.saveSettings(DEFAULT_USER_SETTINGS)).toBe(false);
    expect(writeRepository.saveSettings(DEFAULT_USER_SETTINGS)).toBe(false);
    expect(
      writeRepository.getWarnings().filter((warning) => warning.code === 'write-failed'),
    ).toHaveLength(1);
    expect(writeEvents).toHaveLength(1);

    const readHarness = storageHarness({}, { read: (key) => key === STORAGE_KEYS.settings });
    const readRepository = repositoryFor(readHarness, () => {
      throw new Error('presentation callback failure');
    });
    expect(() => readRepository.loadSettings()).not.toThrow();
    expect(() => readRepository.loadSettings()).not.toThrow();
    expect(
      readRepository.getWarnings().filter((warning) => warning.code === 'read-failed'),
    ).toHaveLength(1);
  });

  it('normalizes pulsing state and clears solved sessions from resume', () => {
    expect(pulsingFixture.case).toBe('resumable-pulsing');
    const pulsingHarness = storageHarness({
      [STORAGE_KEYS.session]: fixtureRaw(pulsingFixture.raw),
    });
    const pulsingRepository = repositoryFor(pulsingHarness);
    expect(pulsingRepository.loadSession().resumableSession).toMatchObject({
      status: 'paused',
      currentRows: [2, 0, 0],
      activeSinceEpochMs: null,
      hiddenAtEpochMs: 1100,
    });

    expect(solvedFixture.case).toBe('resumable-solved');
    const solvedHarness = storageHarness({
      [STORAGE_KEYS.session]: fixtureRaw(solvedFixture.raw),
    });
    const solvedRepository = repositoryFor(solvedHarness);
    expect(solvedRepository.loadSession().resumableSession).toBeNull();
  });

  it('round-trips pre-start Hint and visibility states as a canonical ready snapshot', () => {
    const harness = storageHarness();
    const repository = repositoryFor(harness);
    const initial = createGameSessionState(PUZZLE, 'pre-start-attempt');
    const hinted = gameSessionReducer(initial, { type: 'USE_HINT', level: 3 });
    const paused = gameSessionReducer(hinted, {
      type: 'VISIBILITY_CHANGED',
      hidden: true,
      nowEpochMs: 100,
    });
    expect(repository.saveSession(paused.session)).toBe(true);
    expect(repository.loadSession().resumableSession).toMatchObject({
      status: 'ready',
      startedAtEpochMs: null,
      activeSinceEpochMs: null,
      lastObservedEpochMs: null,
      hiddenAtEpochMs: null,
      hintLevelUsed: 3,
    });

    const resumed = gameSessionReducer(paused, {
      type: 'VISIBILITY_CHANGED',
      hidden: false,
      nowEpochMs: 500,
    });
    expect(repository.saveSession(resumed.session)).toBe(true);
    expect(repository.loadSession().resumableSession).toMatchObject({
      status: 'ready',
      startedAtEpochMs: null,
      lastObservedEpochMs: null,
      hintLevelUsed: 3,
    });
  });

  it('preserves an established Daily best when Reset replaces only the session root', () => {
    const harness = storageHarness();
    const repository = repositoryFor(harness);
    const dailyRecord = {
      puzzleId: 'daily-2026-08-26',
      completed: true,
      bestGrade: 'A' as const,
      bestPulseCount: 2,
      bestElapsedMs: 2000,
      firstCompletedAt: '2026-08-26T00:00:00.000Z',
      lastCompletedAt: '2026-08-26T00:01:00.000Z',
      dateUtc: '2026-08-26',
      sharedCount: 0,
    };
    const progress: ProgressEnvelopeV1 = {
      ...DEFAULT_PROGRESS,
      dailyRecords: { [dailyRecord.dateUtc]: dailyRecord },
    };
    expect(repository.saveProgress(progress)).toBe(true);

    const priorAttempt = createGameSessionState(PUZZLE, 'daily-attempt-old');
    const resetAttempt = gameSessionReducer(priorAttempt, {
      type: 'RESET_CONFIRMED',
      sessionId: 'daily-attempt-new',
    });
    expect(repository.saveSession(resetAttempt.session)).toBe(true);
    expect(repository.loadProgress().dailyRecords[dailyRecord.dateUtc]).toEqual(dailyRecord);
  });

  it('round-trips separate roots and composes progress with session at runtime', () => {
    const harness = storageHarness();
    const repository = repositoryFor(harness);
    const settings = validFixture.raw as UserSettings;
    const progress: ProgressEnvelopeV1 = {
      ...DEFAULT_PROGRESS,
      tutorialCompleted: true,
      labRecords: {
        'lab-a': {
          puzzleId: 'lab-a',
          completed: true,
          bestGrade: 'S',
          bestPulseCount: 2,
          bestElapsedMs: 1000,
          firstCompletedAt: '2026-08-26T00:00:00.000Z',
          lastCompletedAt: '2026-08-26T00:00:00.000Z',
        },
      },
    };
    const openSessionEnvelope = structuredClone(pulsingFixture.raw);
    openSessionEnvelope.resumableSession.activeElapsedMs = 0;
    openSessionEnvelope.resumableSession.activeSinceEpochMs = 1000;
    const session = openSessionEnvelope.resumableSession as unknown as GameSession;
    expect(repository.saveSettings(settings)).toBe(true);
    expect(repository.saveProgress(progress)).toBe(true);
    expect(repository.saveSession(session)).toBe(true);
    const firstSessionRaw = harness.snapshot()[STORAGE_KEYS.session];
    expect(JSON.parse(firstSessionRaw ?? '{}').resumableSession).toMatchObject({
      status: 'paused',
      activeSinceEpochMs: null,
      hiddenAtEpochMs: 1100,
      activeElapsedMs: 100,
    });
    const normalizedSession = repository.loadSession().resumableSession;
    expect(repository.saveSession(normalizedSession)).toBe(true);
    expect(harness.snapshot()[STORAGE_KEYS.session]).toBe(firstSessionRaw);
    expect(repository.saveGeneratorMap(DEFAULT_GENERATOR_MAP_SNAPSHOT)).toBe(true);
    expect(repository.loadSettings()).toEqual(settings);
    expect(repository.loadGeneratorMap()).toEqual(DEFAULT_GENERATOR_MAP_SNAPSHOT);
    expect(repository.loadAppState()).toMatchObject({
      tutorialCompleted: true,
      labRecords: progress.labRecords,
      resumableSession: { status: 'paused', currentRows: [2, 0, 0] },
    });
    expect(Object.keys(harness.snapshot()).sort()).toEqual(Object.values(STORAGE_KEYS).sort());
  });
});
