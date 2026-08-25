import { describe, expect, it } from 'vitest';

import type { SessionCompletionEvent } from '../session/session.ts';
import type { PuzzleDefinition } from '../types.ts';
import {
  BestRecordValidationError,
  comparePuzzleRecordCandidates,
  createDailyRecord,
  createEmptyPuzzleBestRecord,
  createPuzzleBestRecord,
  isCanonicalUtcDate,
  isCanonicalUtcIso,
  mergeDailyRecord,
  mergePuzzleBestRecord,
  projectCompletionRecord,
  projectDailyCompletionRecord,
  type PuzzleRecordCandidate,
} from './best-record.ts';
import { GradeInvariantError } from './grade.ts';

interface CandidateOverrides {
  readonly activeElapsedMs?: number;
  readonly completedAt?: string;
  readonly completedAtEpochMs?: number;
  readonly eventId?: string;
  readonly hintLevelUsed?: 0 | 1 | 2 | 3;
  readonly optimalPulseCount?: number;
  readonly pulseCount?: number;
  readonly puzzleId?: string;
  readonly sessionId?: string;
}

const BASE_PUZZLE: PuzzleDefinition = Object.freeze({
  schemaVersion: 1,
  id: 'lab-pulse-01',
  mode: 'lab',
  generatorVersion: 'v1',
  size: 4,
  initialRows: [0, 0, 0, 0],
  targetRows: [1, 2, 4, 8],
  optimalPulseCount: 4,
  canonicalSolution: [
    { rowMask: 1, colMask: 1 },
    { rowMask: 2, colMask: 2 },
    { rowMask: 4, colMask: 4 },
    { rowMask: 8, colMask: 8 },
  ],
  difficulty: 'normal',
  complexityScore: 50,
  tags: [],
});

function candidate(overrides: CandidateOverrides = {}): PuzzleRecordCandidate {
  const puzzleId = overrides.puzzleId ?? BASE_PUZZLE.id;
  const sessionId = overrides.sessionId ?? 'attempt-1';
  const puzzle: PuzzleDefinition = {
    ...BASE_PUZZLE,
    id: puzzleId,
    optimalPulseCount: overrides.optimalPulseCount ?? BASE_PUZZLE.optimalPulseCount,
  };
  const completion: SessionCompletionEvent = {
    eventId: overrides.eventId ?? `${sessionId}:completed`,
    sessionId,
    puzzleId,
    pulseCount: overrides.pulseCount ?? 5,
    activeElapsedMs: overrides.activeElapsedMs ?? 20_000,
    hintLevelUsed: overrides.hintLevelUsed ?? 0,
    completedAtEpochMs: overrides.completedAtEpochMs ?? 1_777_075_323_004,
  };
  return projectCompletionRecord(
    completion,
    puzzle,
    () => overrides.completedAt ?? '2026-08-26T01:02:03.004Z',
  );
}

describe('completion record projection', () => {
  it('derives grade from Par, pulses, and Hint level instead of trusting callers', () => {
    expect(candidate({ pulseCount: 4 }).grade).toBe('S');
    expect(candidate({ hintLevelUsed: 2, pulseCount: 4 }).grade).toBe('A');
    expect(candidate({ hintLevelUsed: 3, pulseCount: 4 }).grade).toBe('B');
    expect(candidate({ hintLevelUsed: 3, pulseCount: 8 }).grade).toBe('C');
  });

  it('uses the event epoch through an injected canonical formatter without Date in domain', () => {
    const completion: SessionCompletionEvent = {
      eventId: 'formatter-attempt:completed',
      sessionId: 'formatter-attempt',
      puzzleId: BASE_PUZZLE.id,
      pulseCount: 4,
      activeElapsedMs: 500,
      hintLevelUsed: 0,
      completedAtEpochMs: 1234,
    };
    let observedEpoch = -1;
    const projected = projectCompletionRecord(completion, BASE_PUZZLE, (epochMs) => {
      observedEpoch = epochMs;
      return '2026-08-26T00:00:01.234Z';
    });
    expect(observedEpoch).toBe(1234);
    expect(projected).toMatchObject({
      completedAt: '2026-08-26T00:00:01.234Z',
      completedAtEpochMs: 1234,
      eventId: completion.eventId,
      grade: 'S',
    });
    expect(Object.isFrozen(projected)).toBe(true);
  });

  it('rejects mismatched, malformed, below-Par, and noncanonical completion inputs', () => {
    const mismatchEvent: SessionCompletionEvent = {
      eventId: 'mismatch:completed',
      sessionId: 'mismatch',
      puzzleId: 'another-puzzle',
      pulseCount: 4,
      activeElapsedMs: 1,
      hintLevelUsed: 0,
      completedAtEpochMs: 1,
    };
    expect(() =>
      projectCompletionRecord(mismatchEvent, BASE_PUZZLE, () => '2026-08-26T00:00:00.001Z'),
    ).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({ code: 'puzzle-id-mismatch' }),
    );
    expect(() => candidate({ eventId: 'wrong-event-id' })).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({
        code: 'completion-event-invalid',
      }),
    );
    expect(() => candidate({ pulseCount: 3 })).toThrow(GradeInvariantError);
    expect(() => candidate({ activeElapsedMs: -1 })).toThrow(BestRecordValidationError);
    expect(() => candidate({ completedAt: '2026-08-26T01:02:03Z' })).toThrow(
      BestRecordValidationError,
    );
    expect(() => candidate({ completedAtEpochMs: -1 })).toThrow(BestRecordValidationError);
    expect(() => candidate({ puzzleId: ' lab-pulse-01' })).toThrow(BestRecordValidationError);
  });

  it('rejects plain or copied candidates and makes replayed projection/merge idempotent', () => {
    const trusted = candidate();
    const plain = JSON.parse(JSON.stringify(trusted)) as PuzzleRecordCandidate;
    const forged = Object.freeze({ ...trusted, grade: 'S' }) as PuzzleRecordCandidate;
    const [reflectedBrand] = Object.getOwnPropertySymbols(trusted);
    const reflectedForgery = {
      ...trusted,
      activeElapsedMs: 0,
      optimalPulseCount: 1,
      pulseCount: 1,
    };
    Object.defineProperty(reflectedForgery, reflectedBrand as symbol, { value: true });
    Object.freeze(reflectedForgery);
    expect(() => createPuzzleBestRecord(plain)).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({
        code: 'completion-event-invalid',
      }),
    );
    expect(() => createPuzzleBestRecord(forged)).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({
        code: 'completion-event-invalid',
      }),
    );

    expect(() => createPuzzleBestRecord(reflectedForgery as PuzzleRecordCandidate)).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({
        code: 'completion-event-invalid',
      }),
    );

    const firstProjection = candidate();
    let record = createPuzzleBestRecord(firstProjection);
    const original = record;
    for (let index = 0; index < 100; index += 1) {
      const replayProjection = candidate();
      expect(replayProjection).toEqual(firstProjection);
      record = mergePuzzleBestRecord(record, replayProjection);
    }
    expect(record).toEqual(original);
  });
});

describe('PuzzleBestRecord comparison and merge', () => {
  it('compares the single winning tuple by grade, pulses, then active elapsed time', () => {
    const baseline = candidate();
    expect(comparePuzzleRecordCandidates(candidate({ pulseCount: 4 }), baseline)).toBeLessThan(0);
    expect(
      comparePuzzleRecordCandidates(candidate({ hintLevelUsed: 2, pulseCount: 4 }), baseline),
    ).toBeLessThan(0);
    expect(
      comparePuzzleRecordCandidates(candidate({ activeElapsedMs: 19_999 }), baseline),
    ).toBeLessThan(0);
    expect(
      comparePuzzleRecordCandidates(candidate({ pulseCount: 6, activeElapsedMs: 1 }), baseline),
    ).toBeGreaterThan(0);
    expect(comparePuzzleRecordCandidates(baseline, candidate())).toBe(0);
  });

  it('creates a JSON-safe frozen record and keeps all winning metrics from one attempt', () => {
    const first = createPuzzleBestRecord(candidate());
    const betterGradeButSlower = candidate({
      activeElapsedMs: 90_000,
      completedAt: '2026-08-26T02:00:00.000Z',
      completedAtEpochMs: 1_777_078_800_000,
      pulseCount: 4,
    });
    const merged = mergePuzzleBestRecord(first, betterGradeButSlower);

    expect(merged).toMatchObject({
      bestElapsedMs: 90_000,
      bestGrade: 'S',
      bestPulseCount: 4,
      firstCompletedAt: '2026-08-26T01:02:03.004Z',
      lastCompletedAt: '2026-08-26T02:00:00.000Z',
    });
    expect(Object.isFrozen(merged)).toBe(true);
    expect(JSON.parse(JSON.stringify(merged))).toEqual(merged);
  });

  it('retains the existing winner on an exact tie while keeping fixed first and latest last time', () => {
    const first = createPuzzleBestRecord(candidate());
    const later = mergePuzzleBestRecord(
      first,
      candidate({
        completedAt: '2026-08-27T00:00:00.000Z',
        completedAtEpochMs: 1_777_161_600_000,
      }),
    );
    const outOfOrderTie = mergePuzzleBestRecord(
      later,
      candidate({
        completedAt: '2026-08-25T00:00:00.000Z',
        completedAtEpochMs: 1_776_988_800_000,
      }),
    );

    expect(later.bestGrade).toBe(first.bestGrade);
    expect(later.bestPulseCount).toBe(first.bestPulseCount);
    expect(later.bestElapsedMs).toBe(first.bestElapsedMs);
    expect(outOfOrderTie.firstCompletedAt).toBe('2026-08-26T01:02:03.004Z');
    expect(outOfOrderTie.lastCompletedAt).toBe('2026-08-27T00:00:00.000Z');
  });

  it('supports an explicit incomplete record and rejects cross-puzzle merges', () => {
    const empty = createEmptyPuzzleBestRecord('lab-pulse-01');
    expect(mergePuzzleBestRecord(empty, candidate()).completed).toBe(true);
    expect(() =>
      mergePuzzleBestRecord(empty, candidate({ puzzleId: 'lab-pulse-02' })),
    ).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({
        code: 'puzzle-id-mismatch',
      }),
    );
  });

  it('rejects malformed existing records and completed cross-puzzle merges', () => {
    const complete = createPuzzleBestRecord(candidate());
    expect(() =>
      mergePuzzleBestRecord(
        { ...createEmptyPuzzleBestRecord('lab-pulse-01'), bestGrade: 'S' },
        candidate(),
      ),
    ).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({ code: 'record-invalid' }),
    );
    expect(() =>
      mergePuzzleBestRecord({ ...complete, firstCompletedAt: 'not-an-iso-time' }, candidate()),
    ).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({ code: 'record-invalid' }),
    );
    expect(() =>
      mergePuzzleBestRecord({ ...complete, bestElapsedMs: -1 }, candidate()),
    ).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({ code: 'record-invalid' }),
    );
    expect(() =>
      mergePuzzleBestRecord(
        {
          ...complete,
          firstCompletedAt: '2026-08-27T00:00:00.000Z',
          lastCompletedAt: '2026-08-26T00:00:00.000Z',
        },
        candidate(),
      ),
    ).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({ code: 'record-invalid' }),
    );
    expect(() =>
      mergePuzzleBestRecord(complete, candidate({ puzzleId: 'lab-pulse-02' })),
    ).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({
        code: 'puzzle-id-mismatch',
      }),
    );
  });
});

describe('DailyRecord and canonical UTC values', () => {
  it('creates and merges Daily records while preserving sharedCount', () => {
    const first = createDailyRecord(projectDailyCompletionRecord(candidate(), '2026-08-26'));
    const withShares = { ...first, sharedCount: 3 };
    const merged = mergeDailyRecord(
      withShares,
      projectDailyCompletionRecord(
        candidate({
          completedAt: '2026-08-27T00:00:00.000Z',
          completedAtEpochMs: 1_777_161_600_000,
          pulseCount: 4,
        }),
        '2026-08-26',
      ),
    );

    expect(merged.bestGrade).toBe('S');
    expect(merged.sharedCount).toBe(3);
    expect(JSON.parse(JSON.stringify(merged))).toEqual(merged);
  });

  it('strictly validates canonical UTC date and timestamp boundaries', () => {
    expect(isCanonicalUtcDate('2028-02-29')).toBe(true);
    expect(isCanonicalUtcDate('2027-02-29')).toBe(false);
    expect(isCanonicalUtcDate('1900-02-29')).toBe(false);
    expect(isCanonicalUtcDate('2000-02-29')).toBe(true);
    expect(isCanonicalUtcDate('2026-01-31')).toBe(true);
    expect(isCanonicalUtcDate('2026-04-30')).toBe(true);
    expect(isCanonicalUtcDate('2026-04-31')).toBe(false);
    expect(isCanonicalUtcDate('2026-8-26')).toBe(false);
    expect(isCanonicalUtcDate(null)).toBe(false);
    expect(isCanonicalUtcIso('9999-12-31T23:59:59.999Z')).toBe(true);
    expect(isCanonicalUtcIso('2026-08-26T24:00:00.000Z')).toBe(false);
    expect(isCanonicalUtcIso('2026-08-26T00:60:00.000Z')).toBe(false);
    expect(isCanonicalUtcIso('2026-08-26T00:00:00Z')).toBe(false);
    expect(isCanonicalUtcIso(undefined)).toBe(false);
    expect(() => projectDailyCompletionRecord(candidate(), '2026-02-29')).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({ code: 'date-utc-invalid' }),
    );
    const invalidDailyCandidate = Object.freeze({
      ...projectDailyCompletionRecord(candidate(), '2026-08-26'),
      dateUtc: 'invalid',
    }) as Parameters<typeof mergeDailyRecord>[1];
    expect(() => mergeDailyRecord(null, invalidDailyCandidate)).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({ code: 'date-utc-invalid' }),
    );
  });

  it('rejects Daily merges across dates and invalid shared counts', () => {
    const first = createDailyRecord(projectDailyCompletionRecord(candidate(), '2026-08-26'));
    expect(() =>
      mergeDailyRecord(first, projectDailyCompletionRecord(candidate(), '2026-08-27')),
    ).toThrow(BestRecordValidationError);
    expect(() =>
      mergeDailyRecord(
        { ...first, sharedCount: -1 },
        projectDailyCompletionRecord(candidate(), '2026-08-26'),
      ),
    ).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({
        code: 'shared-count-invalid',
      }),
    );
    expect(() =>
      mergeDailyRecord(
        { ...first, dateUtc: 'invalid' },
        projectDailyCompletionRecord(candidate(), '2026-08-26'),
      ),
    ).toThrowError(
      expect.objectContaining<Partial<BestRecordValidationError>>({
        code: 'record-invalid',
      }),
    );
  });
});
