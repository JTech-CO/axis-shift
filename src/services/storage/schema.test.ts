import { describe, expect, it } from 'vitest';

import type { PuzzleDefinition } from '../../domain/types.ts';
import pulsingFixture from '../../test/fixtures/storage/resumable-pulsing.json';
import solvedFixture from '../../test/fixtures/storage/resumable-solved.json';
import {
  DEFAULT_PROGRESS,
  DEFAULT_USER_SETTINGS,
  STORAGE_KEYS,
  composePersistedAppState,
  normalizeGeneratorMapSnapshot,
  normalizeProgress,
  normalizeSessionEnvelope,
  normalizeSettings,
  splitPersistedAppState,
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

function requireFixtureValue<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('storage fixture value is required');
  return value;
}

describe('storage schema guards', () => {
  it('freezes the four primary keys and normalizes settings exactly', () => {
    expect(STORAGE_KEYS).toEqual({
      settings: 'axis-shift:settings:v1',
      progress: 'axis-shift:progress:v1',
      session: 'axis-shift:session:v1',
      generatorMap: 'axis-shift:generator-map:v1',
    });
    expect(normalizeSettings(DEFAULT_USER_SETTINGS).valid).toBe(true);
    expect(normalizeSettings({ ...DEFAULT_USER_SETTINGS, soundVolume: 2 }).value).toEqual(
      DEFAULT_USER_SETTINGS,
    );
    expect(normalizeSettings({ ...DEFAULT_USER_SETTINGS, extra: true }).valid).toBe(false);
  });

  it('salvages valid best records while rejecting corrupt progress fields', () => {
    const validRecord = {
      puzzleId: 'lab-a',
      completed: true,
      bestGrade: 'S',
      bestPulseCount: 2,
      bestElapsedMs: 500,
      firstCompletedAt: '2026-08-26T00:00:00.000Z',
      lastCompletedAt: '2026-08-26T00:00:01.000Z',
    };
    const normalized = normalizeProgress({
      schemaVersion: 1,
      tutorialCompleted: 'invalid',
      labRecords: { 'lab-a': validRecord, 'lab-b': { ...validRecord, puzzleId: 'wrong' } },
      dailyRecords: {},
      sprintBest: null,
    });
    expect(normalized.valid).toBe(false);
    expect(normalized.value.tutorialCompleted).toBe(false);
    expect(normalized.value.labRecords).toEqual({ 'lab-a': validRecord });

    const yearZero = normalizeProgress({
      ...DEFAULT_PROGRESS,
      labRecords: {
        'lab-zero': {
          ...validRecord,
          puzzleId: 'lab-zero',
          firstCompletedAt: '0000-01-01T00:00:00.000Z',
          lastCompletedAt: '0000-01-01T00:00:00.000Z',
        },
      },
    });
    expect(yearZero.valid).toBe(false);
    expect(yearZero.value.labRecords).toEqual({});

    const protoInput = Object.create(null) as Record<string, unknown>;
    protoInput['__proto__'] = { ...validRecord, puzzleId: '__proto__' };
    const protoNormalized = normalizeProgress({
      ...DEFAULT_PROGRESS,
      labRecords: protoInput,
    });
    expect(protoNormalized.valid).toBe(true);
    expect(Object.getPrototypeOf(protoNormalized.value.labRecords)).toBeNull();
    expect(Object.hasOwn(protoNormalized.value.labRecords, '__proto__')).toBe(true);
  });

  it('normalizes logical pulsing state and removes solved sessions from resume', () => {
    const pulsing = normalizeSessionEnvelope(pulsingFixture.raw, resolvePuzzle);
    expect(pulsing.valid).toBe(true);
    expect(pulsing.value.resumableSession).toMatchObject({
      status: 'paused',
      currentRows: [2, 0, 0],
      activeSinceEpochMs: null,
      hiddenAtEpochMs: 1100,
    });

    const solved = normalizeSessionEnvelope(solvedFixture.raw, resolvePuzzle);
    expect(solved).toEqual({
      issues: [],
      valid: true,
      value: { schemaVersion: 1, resumableSession: null },
    });
  });

  it('rejects unknown puzzles, replay mismatches, and error sessions', () => {
    expect(normalizeSessionEnvelope(pulsingFixture.raw, () => undefined).valid).toBe(false);
    const mismatch = structuredClone(pulsingFixture.raw);
    mismatch.resumableSession.currentRows = [4, 0, 0];
    expect(normalizeSessionEnvelope(mismatch, resolvePuzzle).valid).toBe(false);
    const errorState = structuredClone(pulsingFixture.raw);
    errorState.resumableSession.status = 'error';
    expect(normalizeSessionEnvelope(errorState, resolvePuzzle).valid).toBe(false);
  });

  it('rejects corrupt ledgers, lifecycle clocks, and accepts paused solved state', () => {
    const duplicateMove = structuredClone(pulsingFixture.raw);
    duplicateMove.resumableSession.moves.push({
      ...requireFixtureValue(duplicateMove.resumableSession.moves[0]),
    });
    expect(normalizeSessionEnvelope(duplicateMove, resolvePuzzle).valid).toBe(false);

    const beforeStart = structuredClone(pulsingFixture.raw);
    Object.assign(beforeStart.resumableSession, {
      startedAtEpochMs: null,
      activeElapsedMs: 0,
      activeSinceEpochMs: null,
      lastObservedEpochMs: null,
    });
    expect(normalizeSessionEnvelope(beforeStart, resolvePuzzle).valid).toBe(false);

    const undoOverflow = structuredClone(pulsingFixture.raw);
    undoOverflow.resumableSession.undoCount = 2;
    expect(normalizeSessionEnvelope(undoOverflow, resolvePuzzle).valid).toBe(false);

    const reversedClock = structuredClone(pulsingFixture.raw);
    reversedClock.resumableSession.lastObservedEpochMs = 999;
    expect(normalizeSessionEnvelope(reversedClock, resolvePuzzle).valid).toBe(false);

    const missingActiveSegment = structuredClone(pulsingFixture.raw);
    Object.assign(missingActiveSegment.resumableSession, { activeSinceEpochMs: null });
    expect(normalizeSessionEnvelope(missingActiveSegment, resolvePuzzle).valid).toBe(false);

    const ledgerOrder = structuredClone(pulsingFixture.raw) as unknown as {
      resumableSession: { acceptedPulseActionIds: string[]; moves: Record<string, unknown>[] };
    };
    ledgerOrder.resumableSession.moves.push({
      ...requireFixtureValue(ledgerOrder.resumableSession.moves[0]),
      actionId: 'pulse-pulsing-2',
    });
    ledgerOrder.resumableSession.acceptedPulseActionIds = ['pulse-pulsing-2', 'pulse-pulsing-1'];
    expect(normalizeSessionEnvelope(ledgerOrder, resolvePuzzle).valid).toBe(false);

    const phantomLedger = structuredClone(pulsingFixture.raw);
    phantomLedger.resumableSession.acceptedPulseActionIds.push('phantom-action');
    expect(normalizeSessionEnvelope(phantomLedger, resolvePuzzle).valid).toBe(false);

    const mismatchedPauseClock = structuredClone(pulsingFixture.raw);
    Object.assign(mismatchedPauseClock.resumableSession, {
      status: 'paused',
      activeSinceEpochMs: null,
      hiddenAtEpochMs: 1050,
    });
    expect(normalizeSessionEnvelope(mismatchedPauseClock, resolvePuzzle).valid).toBe(false);

    const overflow = structuredClone(pulsingFixture.raw);
    overflow.resumableSession.activeElapsedMs = Number.MAX_SAFE_INTEGER;
    overflow.resumableSession.activeSinceEpochMs = 1000;
    expect(normalizeSessionEnvelope(overflow, resolvePuzzle).valid).toBe(false);

    const pausedSolved = structuredClone(solvedFixture.raw);
    Object.assign(pausedSolved.resumableSession, {
      status: 'paused',
      hiddenAtEpochMs: 1200,
      lastObservedEpochMs: 1200,
    });
    expect(normalizeSessionEnvelope(pausedSolved, resolvePuzzle)).toMatchObject({
      valid: true,
      value: { resumableSession: null },
    });
  });

  it('accepts only minimal sorted UTC generator snapshots', () => {
    const valid = {
      schemaVersion: 1 as const,
      defaultVersion: 'v2',
      schedule: [
        { effectiveFrom: '2026-01-01', version: 'v1' },
        { effectiveFrom: '2027-01-01', version: 'v2' },
      ],
    };
    expect(normalizeGeneratorMapSnapshot(valid)).toMatchObject({ valid: true, value: valid });
    expect(normalizeGeneratorMapSnapshot({ ...valid, defaultVersion: 'v1' }).valid).toBe(false);
    expect(
      normalizeGeneratorMapSnapshot({
        ...valid,
        schedule: [...valid.schedule].reverse(),
      }).valid,
    ).toBe(false);
    expect(
      normalizeGeneratorMapSnapshot({
        ...valid,
        schedule: [{ effectiveFrom: '2026-02-30', version: 'v1' }],
      }).valid,
    ).toBe(false);
  });

  it('splits and composes the progress/session runtime view without data loss', () => {
    const state = composePersistedAppState(DEFAULT_PROGRESS, {
      schemaVersion: 1,
      resumableSession: null,
    });
    const split = splitPersistedAppState(state);
    expect(composePersistedAppState(split.progress, split.session)).toEqual(state);
  });
});
