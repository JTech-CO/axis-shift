import { describe, expect, it } from 'vitest';

import type { PuzzleDefinition } from '../../domain/index.ts';
import { createMemoryStorageAdapter, type StoragePort } from './local-storage-adapter.ts';
import { migrateSequentially } from './migrations.ts';
import { createStorageRepository, type StorageRepositoryOptions } from './repository.ts';
import {
  DEFAULT_PROGRESS,
  DEFAULT_USER_SETTINGS,
  STORAGE_KEYS,
  composePersistedAppState,
  type GeneratorMapSnapshotV1,
  type PersistedAppState,
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

function repository(
  storage: StoragePort,
  options: Partial<Omit<StorageRepositoryOptions, 'resolvePuzzle' | 'storage'>> = {},
) {
  return createStorageRepository({ storage, resolvePuzzle, ...options });
}

function faultStorage(
  initial: Readonly<Record<string, string>> = {},
  failWrites: ReadonlySet<string> = new Set(),
  failRemove = false,
): StoragePort & { readonly snapshot: () => Readonly<Record<string, string>> } {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => {
      if (failRemove) throw new Error('remove failed');
      values.delete(key);
    },
    setItem: (key, value) => {
      if (failWrites.has(key)) throw new Error('write failed');
      values.set(key, value);
    },
    snapshot: () => Object.fromEntries(values),
  };
}

describe('storage repository recovery branches', () => {
  it('clones all missing-root fallbacks, including non-null sprint and generator schedule entries', () => {
    const defaultProgress: ProgressEnvelopeV1 = {
      ...DEFAULT_PROGRESS,
      tutorialCompleted: true,
      sprintBest: {
        score: 100,
        solvedCount: 2,
        sGradeCount: 1,
        achievedAt: '2026-08-26T00:00:00.000Z',
      },
    };
    const defaultGeneratorMap: GeneratorMapSnapshotV1 = {
      schemaVersion: 1,
      defaultVersion: 'v2',
      schedule: [
        { effectiveFrom: '2026-01-01', version: 'v1' },
        { effectiveFrom: '2027-01-01', version: 'v2' },
      ],
    };
    const defaultSettings: UserSettings = { ...DEFAULT_USER_SETTINGS, locale: 'en' };
    const repo = repository(createMemoryStorageAdapter(), {
      defaultGeneratorMap,
      defaultProgress,
      defaultSettings,
    });

    const loadedProgress = repo.loadProgress();
    const loadedGenerator = repo.loadGeneratorMap();
    expect(repo.loadSettings()).toEqual(defaultSettings);
    expect(repo.loadSession()).toEqual({ schemaVersion: 1, resumableSession: null });
    expect(loadedProgress).toEqual(defaultProgress);
    expect(loadedProgress).not.toBe(defaultProgress);
    expect(loadedProgress.sprintBest).not.toBe(defaultProgress.sprintBest);
    expect(loadedGenerator).toEqual(defaultGeneratorMap);
    expect(loadedGenerator).not.toBe(defaultGeneratorMap);
    expect(loadedGenerator.schedule[0]).not.toBe(defaultGeneratorMap.schedule[0]);

    const defaultRepo = repository(createMemoryStorageAdapter());
    expect(defaultRepo.loadProgress().sprintBest).toBeNull();
    expect(defaultRepo.loadGeneratorMap().schedule).toHaveLength(1);
  });

  it('uses fallback quarantine ids, sanitizes empty ids, and preserves raw on id failure', () => {
    const raw = '{invalid';
    const fallbackStorage = createMemoryStorageAdapter({ [STORAGE_KEYS.settings]: raw });
    repository(fallbackStorage).loadSettings();
    expect(
      Object.keys(fallbackStorage.snapshot()).some((key) =>
        key.endsWith(':settings:invalid-json:q1'),
      ),
    ).toBe(true);

    const emptyIdStorage = createMemoryStorageAdapter({ [STORAGE_KEYS.settings]: raw });
    repository(emptyIdStorage, { createQuarantineId: () => '' }).loadSettings();
    expect(Object.keys(emptyIdStorage.snapshot()).some((key) => key.endsWith(':q1'))).toBe(true);

    const thrownIdStorage = createMemoryStorageAdapter({ [STORAGE_KEYS.settings]: raw });
    const thrownIdRepository = repository(thrownIdStorage, {
      createQuarantineId: () => {
        throw new Error('id failed');
      },
    });
    expect(thrownIdRepository.loadSettings()).toEqual(DEFAULT_USER_SETTINGS);
    expect(thrownIdStorage.snapshot()[STORAGE_KEYS.settings]).toBe(raw);
    expect(thrownIdRepository.getWarnings().map((warning) => warning.code)).toEqual([
      'invalid-json',
      'quarantine-write-failed',
    ]);
  });

  it('never overwrites an existing quarantine entry when generated ids collide', () => {
    const raw = '{invalid';
    const old = '{older';
    const firstKey = 'axis-shift:quarantine:v1:settings:invalid-json:q1';
    const fallbackStorage = createMemoryStorageAdapter({
      [STORAGE_KEYS.settings]: raw,
      [firstKey]: old,
    });
    repository(fallbackStorage).loadSettings();
    expect(fallbackStorage.snapshot()[firstKey]).toBe(old);
    expect(fallbackStorage.snapshot()['axis-shift:quarantine:v1:settings:invalid-json:q2']).toBe(
      raw,
    );

    const fixedKey = 'axis-shift:quarantine:v1:settings:invalid-json:fixed';
    const fixedStorage = createMemoryStorageAdapter({
      [STORAGE_KEYS.settings]: raw,
      [fixedKey]: old,
    });
    const fixedRepository = repository(fixedStorage, { createQuarantineId: () => 'fixed' });
    expect(fixedRepository.loadSettings()).toEqual(DEFAULT_USER_SETTINGS);
    expect(fixedStorage.snapshot()[fixedKey]).toBe(old);
    expect(fixedStorage.snapshot()[STORAGE_KEYS.settings]).toBe(raw);
    expect(fixedRepository.getWarnings().map((warning) => warning.code)).toContain(
      'quarantine-write-failed',
    );
  });

  it('copies quarantine bytes before removal and reports a recoverable removal failure', () => {
    const raw = '{invalid';
    const storage = faultStorage({ [STORAGE_KEYS.settings]: raw }, new Set(), true);
    const repo = repository(storage, { createQuarantineId: () => 'remove-test' });
    expect(repo.loadSettings()).toEqual(DEFAULT_USER_SETTINGS);
    expect(storage.snapshot()[STORAGE_KEYS.settings]).toBe(raw);
    expect(storage.snapshot()['axis-shift:quarantine:v1:settings:invalid-json:remove-test']).toBe(
      raw,
    );
    expect(repo.getWarnings().map((warning) => warning.code)).toEqual([
      'invalid-json',
      'remove-failed',
    ]);
  });

  it('quarantines unsupported and missing schema versions with distinct reasons', () => {
    const unsupportedStorage = createMemoryStorageAdapter({
      [STORAGE_KEYS.settings]: JSON.stringify({ schemaVersion: 0 }),
    });
    const unsupported = repository(unsupportedStorage, { createQuarantineId: () => 'old' });
    expect(unsupported.loadSettings()).toEqual(DEFAULT_USER_SETTINGS);
    expect(unsupported.getWarnings()[0]?.code).toBe('unsupported-version');
    expect(Object.keys(unsupportedStorage.snapshot())[0]).toContain(':unsupported-version:old');

    const invalidStorage = createMemoryStorageAdapter({
      [STORAGE_KEYS.settings]: JSON.stringify({ locale: 'ko' }),
    });
    const invalid = repository(invalidStorage, { createQuarantineId: () => 'missing' });
    expect(invalid.loadSettings()).toEqual(DEFAULT_USER_SETTINGS);
    expect(invalid.getWarnings()[0]?.code).toBe('invalid-fields');
    expect(Object.keys(invalidStorage.snapshot())[0]).toContain(':invalid-fields:missing');
  });

  it('refuses invalid writes and still attempts both app-state roots before returning failure', () => {
    const invalidRepository = repository(createMemoryStorageAdapter());
    expect(
      invalidRepository.saveSettings({ ...DEFAULT_USER_SETTINGS, soundVolume: -1 } as UserSettings),
    ).toBe(false);
    expect(invalidRepository.getWarnings()[0]?.code).toBe('invalid-fields');

    const state: PersistedAppState = composePersistedAppState(DEFAULT_PROGRESS, {
      schemaVersion: 1,
      resumableSession: null,
    });
    const successStorage = faultStorage();
    expect(repository(successStorage).saveAppState(state)).toBe(true);
    expect(successStorage.snapshot()[STORAGE_KEYS.progress]).toBeDefined();
    expect(successStorage.snapshot()[STORAGE_KEYS.session]).toBeDefined();

    const progressFailureStorage = faultStorage({}, new Set([STORAGE_KEYS.progress]));
    expect(repository(progressFailureStorage).saveAppState(state)).toBe(false);
    expect(progressFailureStorage.snapshot()[STORAGE_KEYS.session]).toBeDefined();

    const sessionFailureStorage = faultStorage({}, new Set([STORAGE_KEYS.session]));
    expect(repository(sessionFailureStorage).saveAppState(state)).toBe(false);
    expect(sessionFailureStorage.snapshot()[STORAGE_KEYS.progress]).toBeDefined();
  });

  it('covers memory adapter hit/miss and rejects a migration that fails to advance exactly once', () => {
    const memory = createMemoryStorageAdapter({ first: '1' });
    expect(memory.getItem('first')).toBe('1');
    expect(memory.getItem('missing')).toBeNull();

    expect(
      migrateSequentially({ schemaVersion: 1 }, new Map([[1, () => ({ schemaVersion: 1 })]]), 2),
    ).toEqual({ kind: 'unsupported-version', version: 1 });
  });
});
