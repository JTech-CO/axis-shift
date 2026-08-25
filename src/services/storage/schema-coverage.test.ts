import { describe, expect, it } from 'vitest';

import type { PuzzleDefinition } from '../../domain/index.ts';
import pulsingFixture from '../../test/fixtures/storage/resumable-pulsing.json';
import solvedFixture from '../../test/fixtures/storage/resumable-solved.json';
import {
  DEFAULT_GENERATOR_MAP_SNAPSHOT,
  DEFAULT_PROGRESS,
  DEFAULT_USER_SETTINGS,
  normalizeGeneratorMapSnapshot,
  normalizeProgress,
  normalizeSessionEnvelope,
  normalizeSettings,
  schemaVersionOf,
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

type MutableSession = Record<string, unknown> & {
  acceptedPulseActionIds: unknown[];
  moves: Record<string, unknown>[];
};

interface MutableSessionEnvelope {
  resumableSession: MutableSession;
  schemaVersion: unknown;
}

const resolvePuzzle = (puzzleId: string): PuzzleDefinition | undefined =>
  puzzleId === PUZZLE.id ? PUZZLE : undefined;

function pulsing(overrides: Record<string, unknown> = {}): MutableSessionEnvelope {
  const envelope = structuredClone(pulsingFixture.raw) as unknown as MutableSessionEnvelope;
  Object.assign(envelope.resumableSession, overrides);
  return envelope;
}

function firstMove(envelope: MutableSessionEnvelope): Record<string, unknown> {
  const move = envelope.resumableSession.moves[0];
  if (!move) throw new Error('storage session fixture must contain a move');
  return move;
}

function solved(overrides: Record<string, unknown> = {}): MutableSessionEnvelope {
  const envelope = structuredClone(solvedFixture.raw) as unknown as MutableSessionEnvelope;
  Object.assign(envelope.resumableSession, overrides);
  return envelope;
}

function ready(overrides: Record<string, unknown> = {}): MutableSessionEnvelope {
  return pulsing({
    status: 'ready',
    currentRows: [0, 0, 0],
    moves: [],
    acceptedPulseActionIds: [],
    startedAtEpochMs: null,
    activeElapsedMs: 0,
    activeSinceEpochMs: null,
    lastObservedEpochMs: null,
    hiddenAtEpochMs: null,
    hintLevelUsed: 0,
    undoCount: 0,
    ...overrides,
  });
}

function paused(overrides: Record<string, unknown> = {}): MutableSessionEnvelope {
  return pulsing({
    status: 'paused',
    activeSinceEpochMs: null,
    hiddenAtEpochMs: 1100,
    ...overrides,
  });
}

function issueOf(
  envelope: unknown,
  resolver: (puzzleId: string) => PuzzleDefinition | undefined = resolvePuzzle,
): string | undefined {
  return normalizeSessionEnvelope(envelope, resolver).issues[0];
}

function completedRecord(puzzleId = 'lab-a'): Record<string, unknown> {
  return {
    puzzleId,
    completed: true,
    bestGrade: 'S',
    bestPulseCount: 2,
    bestElapsedMs: 500,
    firstCompletedAt: '2026-08-26T00:00:00.000Z',
    lastCompletedAt: '2026-08-26T00:00:01.000Z',
  };
}

function emptyRecord(puzzleId = 'lab-empty'): Record<string, unknown> {
  return {
    puzzleId,
    completed: false,
    bestGrade: null,
    bestPulseCount: null,
    bestElapsedMs: null,
    firstCompletedAt: null,
    lastCompletedAt: null,
  };
}

function progress(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { ...DEFAULT_PROGRESS, ...overrides };
}

function labIssue(candidate: unknown, key = 'lab-a'): readonly string[] {
  return normalizeProgress(progress({ labRecords: { [key]: candidate } })).issues;
}

function dailyRecord(dateUtc = '2026-08-26'): Record<string, unknown> {
  return {
    ...completedRecord('daily-a'),
    dateUtc,
    sharedCount: 0,
  };
}

function dailyIssue(candidate: unknown, key = '2026-08-26'): readonly string[] {
  return normalizeProgress(progress({ dailyRecords: { [key]: candidate } })).issues;
}

describe('storage schema exhaustive guards', () => {
  it('rejects each invalid settings scalar and preserves a detached fallback', () => {
    expect(normalizeSettings(null).issues).toEqual(['settings-fields']);
    expect(normalizeSettings({ ...DEFAULT_USER_SETTINGS, extra: true }).issues).toEqual([
      'settings-fields',
    ]);

    const mutations: readonly (readonly [string, unknown])[] = [
      ['schemaVersion', 2],
      ['locale', 'fr'],
      ['theme', 'neon'],
      ['soundEnabled', 'yes'],
      ['soundVolume', 'loud'],
      ['soundVolume', Number.NaN],
      ['soundVolume', -0.1],
      ['soundVolume', 1.1],
      ['hapticsEnabled', 1],
      ['reducedMotion', 'sometimes'],
      ['highContrastCells', 0],
      ['showKeyboardHints', null],
    ];
    for (const [field, value] of mutations) {
      expect(normalizeSettings({ ...DEFAULT_USER_SETTINGS, [field]: value }).issues).toEqual([
        'settings-values',
      ]);
    }

    const fallback = { ...DEFAULT_USER_SETTINGS, locale: 'en' as const };
    const normalized = normalizeSettings(null, fallback);
    expect(normalized.value).toEqual(fallback);
    expect(normalized.value).not.toBe(fallback);
  });

  it('salvages completed, empty, daily, and sprint records while isolating corrupt entries', () => {
    const valid = normalizeProgress(
      progress({
        tutorialCompleted: true,
        labRecords: {
          'lab-a': completedRecord(),
          'lab-empty': emptyRecord(),
        },
        dailyRecords: { '2026-08-26': dailyRecord() },
        sprintBest: {
          score: 1200,
          solvedCount: 3,
          sGradeCount: 2,
          achievedAt: '2026-08-26T01:00:00.000Z',
        },
      }),
    );
    expect(valid.valid).toBe(true);
    expect(valid.value.sprintBest?.score).toBe(1200);
    expect(valid.value.dailyRecords['2026-08-26']?.sharedCount).toBe(0);

    expect(normalizeProgress(null).valid).toBe(false);
    expect(normalizeProgress({ ...DEFAULT_PROGRESS, extra: true }).issues).toContain(
      'progress-fields',
    );
    expect(normalizeProgress(progress({ schemaVersion: 2 })).issues).toContain('progress-version');
    expect(normalizeProgress(progress({ labRecords: [] })).issues).toContain('lab-records');
    expect(normalizeProgress(progress({ dailyRecords: [] })).issues).toContain('daily-records');

    const invalidLabCandidates: unknown[] = [
      null,
      { ...completedRecord(), extra: true },
      { ...completedRecord(), puzzleId: '' },
      { ...completedRecord(), puzzleId: ' lab-a ' },
      { ...completedRecord(), puzzleId: 'wrong' },
      { ...completedRecord(), completed: 'yes' },
      { ...completedRecord(), bestGrade: 'D' },
      { ...completedRecord(), bestPulseCount: 0 },
      { ...completedRecord(), bestPulseCount: 1.5 },
      { ...completedRecord(), bestElapsedMs: -1 },
      { ...completedRecord(), bestElapsedMs: 1.5 },
      { ...completedRecord(), firstCompletedAt: 123 },
      { ...completedRecord(), firstCompletedAt: 'not-an-instant' },
      { ...completedRecord(), firstCompletedAt: '2026-08-26' },
      { ...completedRecord(), lastCompletedAt: 123 },
      { ...completedRecord(), lastCompletedAt: 'not-an-instant' },
      { ...completedRecord(), bestGrade: null },
      { ...completedRecord(), completed: false },
      {
        ...completedRecord(),
        firstCompletedAt: '2026-08-27T00:00:00.000Z',
        lastCompletedAt: '2026-08-26T00:00:00.000Z',
      },
    ];
    for (const candidate of invalidLabCandidates) {
      expect(labIssue(candidate)).toContain('lab-record:lab-a');
    }
    expect(labIssue(completedRecord(), '')).toContain('lab-record:');

    expect(dailyIssue(null)).toContain('daily-record:2026-08-26');
    expect(dailyIssue({ ...dailyRecord(), extra: true })).toContain('daily-record:2026-08-26');
    expect(dailyIssue({ ...dailyRecord(), bestGrade: 'D' })).toContain('daily-record:2026-08-26');
    for (const dateUtc of [123, 'bad', '0000-01-01', '2026-13-01', '2026-01-32', '2026-02-30']) {
      expect(dailyIssue({ ...dailyRecord(), dateUtc })).toContain('daily-record:2026-08-26');
    }
    expect(dailyIssue(dailyRecord('2026-08-25'))).toContain('daily-record:2026-08-26');
    expect(dailyIssue({ ...dailyRecord(), sharedCount: -1 })).toContain('daily-record:2026-08-26');
    expect(dailyIssue({ ...dailyRecord(), sharedCount: 1.5 })).toContain('daily-record:2026-08-26');

    const sprintMutations: readonly (readonly [string, unknown])[] = [
      ['score', -1],
      ['score', 1.5],
      ['solvedCount', -1],
      ['sGradeCount', -1],
      ['sGradeCount', 4],
      ['achievedAt', 123],
      ['achievedAt', 'invalid'],
      ['achievedAt', '2026-08-26'],
    ];
    const sprint = {
      score: 100,
      solvedCount: 3,
      sGradeCount: 2,
      achievedAt: '2026-08-26T00:00:00.000Z',
    };
    expect(normalizeProgress(progress({ sprintBest: 'bad' })).issues).toContain('sprint-best');
    expect(
      normalizeProgress(progress({ sprintBest: { ...sprint, extra: true } })).issues,
    ).toContain('sprint-best');
    for (const [field, value] of sprintMutations) {
      expect(
        normalizeProgress(progress({ sprintBest: { ...sprint, [field]: value } })).issues,
      ).toContain('sprint-best');
    }
  });

  it('guards the session envelope, identities, board, and primitive lifecycle fields', () => {
    expect(issueOf(null)).toBe('session-envelope-fields');
    expect(issueOf({ ...pulsingFixture.raw, extra: true })).toBe('session-envelope-fields');
    expect(issueOf({ ...pulsingFixture.raw, schemaVersion: 2 })).toBe('session-envelope-version');
    expect(
      normalizeSessionEnvelope({ schemaVersion: 1, resumableSession: null }, resolvePuzzle).valid,
    ).toBe(true);

    expect(issueOf({ schemaVersion: 1, resumableSession: null, extra: false })).toBe(
      'session-envelope-fields',
    );
    expect(issueOf({ schemaVersion: 1, resumableSession: 'bad' })).toBe('session-fields');
    expect(issueOf(pulsing({ extra: true }))).toBe('session-fields');
    expect(issueOf(pulsing({ sessionId: '' }))).toBe('session-identity');
    expect(issueOf(pulsing({ sessionId: ' storage-pulsing ' }))).toBe('session-identity');
    expect(issueOf(pulsing({ puzzleId: '' }))).toBe('session-identity');
    expect(issueOf(pulsing({ puzzleId: ' storage-puzzle ' }))).toBe('session-identity');
    expect(issueOf(pulsing({ puzzleId: 'unknown' }))).toBe('session-puzzle');
    expect(
      issueOf(pulsing(), () => {
        throw new Error('resolver failed');
      }),
    ).toBe('session-puzzle');
    expect(issueOf(pulsing({ currentRows: [8, 0, 0] }))).toBe('session-board');
    expect(issueOf(pulsing({ selectedRowsMask: 8 }))).toBe('session-board');
    expect(issueOf(pulsing({ selectedColsMask: 8 }))).toBe('session-board');
    expect(issueOf(pulsing(), () => ({ ...PUZZLE, targetRows: [8, 0, 0] }))).toBe('session-board');

    const scalarMutations: readonly (readonly [string, unknown])[] = [
      ['status', 'unknown'],
      ['moves', {}],
      ['acceptedPulseActionIds', {}],
      ['startedAtEpochMs', -1],
      ['startedAtEpochMs', 1.5],
      ['activeElapsedMs', -1],
      ['activeElapsedMs', 1.5],
      ['activeSinceEpochMs', -1],
      ['activeSinceEpochMs', 1.5],
      ['lastObservedEpochMs', -1],
      ['lastObservedEpochMs', 1.5],
      ['hiddenAtEpochMs', -1],
      ['hiddenAtEpochMs', 1.5],
      ['hintLevelUsed', 4],
      ['undoCount', -1],
      ['undoCount', 1.5],
      ['completedAtEpochMs', -1],
      ['completedAtEpochMs', 1.5],
    ];
    for (const [field, value] of scalarMutations) {
      expect(issueOf(pulsing({ [field]: value }))).toBe('session-values');
    }
  });

  it('enforces pre-start, active, paused, visible, and pulsing lifecycle invariants', () => {
    expect(normalizeSessionEnvelope(ready(), resolvePuzzle)).toMatchObject({
      valid: true,
      value: { resumableSession: { status: 'ready', hiddenAtEpochMs: null } },
    });

    const beforeStartMutations: readonly (readonly [string, unknown])[] = [
      ['status', 'selecting'],
      ['moves', [{ actionId: 'move', rowMask: 1, colMask: 1, appliedAtMs: 0 }]],
      ['acceptedPulseActionIds', ['move']],
      ['selectedRowsMask', 1],
      ['selectedColsMask', 1],
      ['activeElapsedMs', 1],
      ['activeSinceEpochMs', 0],
      ['hiddenAtEpochMs', 0],
      ['undoCount', 1],
    ];
    for (const [field, value] of beforeStartMutations) {
      expect(issueOf(ready({ [field]: value }))).toBe('session-before-start');
    }

    expect(normalizeSessionEnvelope(ready({ hintLevelUsed: 1 }), resolvePuzzle)).toMatchObject({
      valid: true,
      value: { resumableSession: { hintLevelUsed: 1, status: 'ready' } },
    });
    expect(
      normalizeSessionEnvelope(ready({ lastObservedEpochMs: 0 }), resolvePuzzle),
    ).toMatchObject({
      valid: true,
      value: { resumableSession: { lastObservedEpochMs: null, status: 'ready' } },
    });
    expect(
      normalizeSessionEnvelope(
        ready({ status: 'paused', lastObservedEpochMs: 0, hiddenAtEpochMs: 0 }),
        resolvePuzzle,
      ),
    ).toMatchObject({
      valid: true,
      value: { resumableSession: { hiddenAtEpochMs: null, status: 'ready' } },
    });

    expect(issueOf(pulsing({ status: 'ready' }))).toBe('session-started-state');
    expect(issueOf(pulsing({ lastObservedEpochMs: null }))).toBe('session-started-state');
    expect(issueOf(paused({ activeSinceEpochMs: 1000 }))).toBe('session-paused-clock');
    expect(issueOf(paused({ hiddenAtEpochMs: null }))).toBe('session-paused-clock');
    expect(issueOf(pulsing({ hiddenAtEpochMs: 1100 }))).toBe('session-visible-clock');
    expect(issueOf(pulsing({ selectedRowsMask: 1 }))).toBe('session-pulsing-state');
    expect(issueOf(pulsing({ selectedColsMask: 1 }))).toBe('session-pulsing-state');
    expect(issueOf(pulsing({ moves: [], currentRows: [0, 0, 0] }))).toBe('session-pulsing-state');
    expect(issueOf(pulsing({ activeSinceEpochMs: null }))).toBe('session-active-segment');
    expect(issueOf(pulsing({ status: 'selecting', activeSinceEpochMs: null }))).toBe(
      'session-active-segment',
    );
    expect(
      normalizeSessionEnvelope(
        pulsing({ status: 'selecting', selectedRowsMask: 1 }),
        resolvePuzzle,
      ),
    ).toMatchObject({
      valid: true,
      value: { resumableSession: { status: 'paused', selectedRowsMask: 1 } },
    });
    expect(normalizeSessionEnvelope(paused(), resolvePuzzle).valid).toBe(true);
  });

  it('rejects corrupt action ledgers, moves, ordering, and replay state', () => {
    expect(issueOf(pulsing({ acceptedPulseActionIds: [123] }))).toBe('session-action-ledger');
    expect(issueOf(pulsing({ acceptedPulseActionIds: [''] }))).toBe('session-action-ledger');
    expect(issueOf(pulsing({ acceptedPulseActionIds: [' pulse-pulsing-1 '] }))).toBe(
      'session-action-ledger',
    );
    expect(
      issueOf(pulsing({ acceptedPulseActionIds: ['pulse-pulsing-1', 'pulse-pulsing-1'] })),
    ).toBe('session-action-ledger');
    expect(issueOf(pulsing({ undoCount: 2 }))).toBe('session-undo-count');

    const malformedMove = pulsing();
    malformedMove.resumableSession.moves = [null as unknown as Record<string, unknown>];
    expect(issueOf(malformedMove)).toBe('session-move');
    const extraMove = pulsing();
    firstMove(extraMove).extra = true;
    expect(issueOf(extraMove)).toBe('session-move');
    for (const [field, value] of [
      ['rowMask', 8],
      ['colMask', 8],
    ] as const) {
      const envelope = pulsing();
      firstMove(envelope)[field] = value;
      expect(issueOf(envelope)).toBe('session-move-mask');
    }

    const moveValueMutations: readonly (readonly [string, unknown])[] = [
      ['actionId', ''],
      ['actionId', ' pulse-pulsing-1 '],
      ['actionId', 'not-accepted'],
      ['rowMask', 0],
      ['colMask', 0],
      ['appliedAtMs', -1],
      ['appliedAtMs', 1.5],
    ];
    for (const [field, value] of moveValueMutations) {
      const envelope = pulsing();
      firstMove(envelope)[field] = value;
      expect(issueOf(envelope)).toBe('session-move-values');
    }

    const duplicateMove = pulsing();
    duplicateMove.resumableSession.moves.push({ ...firstMove(duplicateMove) });
    expect(issueOf(duplicateMove)).toBe('session-move-values');

    const reversedLedger = pulsing();
    reversedLedger.resumableSession.moves.push({
      ...firstMove(reversedLedger),
      actionId: 'pulse-pulsing-2',
      appliedAtMs: 1100,
    });
    reversedLedger.resumableSession.acceptedPulseActionIds = ['pulse-pulsing-2', 'pulse-pulsing-1'];
    expect(issueOf(reversedLedger)).toBe('session-move-values');

    const reversedMoveTime = pulsing();
    reversedMoveTime.resumableSession.moves.push({
      ...firstMove(reversedMoveTime),
      actionId: 'pulse-pulsing-2',
      appliedAtMs: 1099,
    });
    reversedMoveTime.resumableSession.acceptedPulseActionIds.push('pulse-pulsing-2');
    expect(issueOf(reversedMoveTime)).toBe('session-move-values');

    expect(issueOf(pulsing({ currentRows: [4, 0, 0] }))).toBe('session-replay-mismatch');
    const corruptInitialPuzzle = { ...PUZZLE, initialRows: [8, 0, 0] } as PuzzleDefinition;
    expect(issueOf(pulsing(), () => corruptInitialPuzzle)).toBe('session-replay');
  });

  it('checks lifecycle clock order, closes an open segment once, and rejects overflow', () => {
    const clockMutations: readonly (readonly [Record<string, unknown>, string])[] = [
      [{ lastObservedEpochMs: 999 }, 'session-clock-order'],
      [{ activeElapsedMs: 101 }, 'session-clock-order'],
      [{ activeSinceEpochMs: 999 }, 'session-clock-order'],
      [{ activeSinceEpochMs: 1101 }, 'session-clock-order'],
    ];
    for (const [overrides, issue] of clockMutations) {
      expect(issueOf(pulsing(overrides))).toBe(issue);
    }
    expect(issueOf(paused({ hiddenAtEpochMs: 999 }))).toBe('session-paused-clock');
    expect(issueOf(paused({ hiddenAtEpochMs: 1101 }))).toBe('session-paused-clock');

    const moveBeforeStart = pulsing();
    firstMove(moveBeforeStart).appliedAtMs = 999;
    expect(issueOf(moveBeforeStart)).toBe('session-clock-order');
    const moveAfterObservation = pulsing();
    firstMove(moveAfterObservation).appliedAtMs = 1101;
    expect(issueOf(moveAfterObservation)).toBe('session-clock-order');

    expect(
      issueOf(
        pulsing({
          startedAtEpochMs: 0,
          lastObservedEpochMs: Number.MAX_SAFE_INTEGER,
          activeElapsedMs: Number.MAX_SAFE_INTEGER,
          activeSinceEpochMs: 0,
        }),
      ),
    ).toBe('session-clock-overflow');
    expect(
      issueOf(
        pulsing({ activeElapsedMs: 90, activeSinceEpochMs: 1000, lastObservedEpochMs: 1100 }),
      ),
    ).toBe('session-clock-order');

    const open = pulsing({ activeElapsedMs: 0, activeSinceEpochMs: 1000 });
    const first = normalizeSessionEnvelope(open, resolvePuzzle);
    expect(first).toMatchObject({
      valid: true,
      value: {
        resumableSession: {
          status: 'paused',
          activeElapsedMs: 100,
          activeSinceEpochMs: null,
          hiddenAtEpochMs: 1100,
        },
      },
    });
    const second = normalizeSessionEnvelope(first.value, resolvePuzzle);
    expect(second).toEqual(first);
  });

  it('validates completion event primitives and solved/unsolved cross-field ordering', () => {
    const malformedCompletion = solved();
    malformedCompletion.resumableSession.completionEvent = 'bad';
    expect(issueOf(malformedCompletion)).toBe('session-completion');
    const extraCompletion = solved();
    extraCompletion.resumableSession.completionEvent = {
      ...(extraCompletion.resumableSession.completionEvent as Record<string, unknown>),
      extra: true,
    };
    expect(issueOf(extraCompletion)).toBe('session-completion');

    const completionMutations: readonly (readonly [string, unknown])[] = [
      ['eventId', 'wrong'],
      ['sessionId', 'wrong'],
      ['puzzleId', 'wrong'],
      ['pulseCount', 0],
      ['pulseCount', 1.5],
      ['activeElapsedMs', -1],
      ['activeElapsedMs', 1.5],
      ['hintLevelUsed', 4],
      ['completedAtEpochMs', -1],
      ['completedAtEpochMs', 1.5],
    ];
    for (const [field, value] of completionMutations) {
      const envelope = solved();
      (envelope.resumableSession.completionEvent as Record<string, unknown>)[field] = value;
      expect(issueOf(envelope)).toBe('session-completion');
    }

    expect(issueOf(solved({ status: 'selecting' }))).toBe('session-solved-status');
    expect(normalizeSessionEnvelope(solved({ status: 'pulsing' }), resolvePuzzle).valid).toBe(true);
    expect(
      normalizeSessionEnvelope(solved({ status: 'paused', hiddenAtEpochMs: 1100 }), resolvePuzzle)
        .valid,
    ).toBe(true);

    const solvedCrossMutations: readonly (readonly [
      string,
      unknown,
      string | undefined,
      unknown,
    ])[] = [
      ['completedAtEpochMs', null, undefined, undefined],
      ['completionEvent', null, undefined, undefined],
      ['completedAtEpochMs', 1050, 'completedAtEpochMs', 1100],
      ['completionEvent', undefined, 'pulseCount', 2],
      ['completionEvent', undefined, 'activeElapsedMs', 99],
      ['completionEvent', undefined, 'hintLevelUsed', 1],
      ['completedAtEpochMs', 999, 'completedAtEpochMs', 999],
      ['completedAtEpochMs', 1200, 'completedAtEpochMs', 1200],
      ['activeSinceEpochMs', 1100, undefined, undefined],
      ['completedAtEpochMs', 1050, 'completedAtEpochMs', 1050],
    ];
    for (const [sessionField, sessionValue, eventField, eventValue] of solvedCrossMutations) {
      const envelope = solved();
      if (sessionValue !== undefined) envelope.resumableSession[sessionField] = sessionValue;
      if (eventField !== undefined) {
        (envelope.resumableSession.completionEvent as Record<string, unknown>)[eventField] =
          eventValue;
      }
      expect(issueOf(envelope)).toBe('session-solved-completion');
    }

    expect(issueOf(pulsing({ status: 'solved', activeSinceEpochMs: null }))).toBe(
      'session-unsolved-completion',
    );
    expect(issueOf(pulsing({ completedAtEpochMs: 1100 }))).toBe('session-unsolved-completion');
    const unsolvedCompletion = pulsing({ completedAtEpochMs: 1100 });
    unsolvedCompletion.resumableSession.completionEvent = {
      eventId: 'storage-pulsing:completed',
      sessionId: 'storage-pulsing',
      puzzleId: 'storage-puzzle',
      pulseCount: 1,
      activeElapsedMs: 100,
      hintLevelUsed: 1,
      completedAtEpochMs: 1100,
    };
    expect(issueOf(unsolvedCompletion)).toBe('session-unsolved-completion');
    expect(issueOf(pulsing({ status: 'error', activeSinceEpochMs: null }))).toBe(
      'session-error-status',
    );
  });

  it('rejects every generator map shape/value/schedule error and exposes version guards', () => {
    const valid = {
      schemaVersion: 1,
      defaultVersion: 'v2',
      schedule: [
        { effectiveFrom: '2026-01-01', version: 'v1' },
        { effectiveFrom: '2027-01-01', version: 'v2' },
      ],
    };
    expect(normalizeGeneratorMapSnapshot(valid).valid).toBe(true);
    expect(normalizeGeneratorMapSnapshot(null).issues).toEqual(['generator-map-fields']);
    expect(normalizeGeneratorMapSnapshot({ ...valid, extra: true }).issues).toEqual([
      'generator-map-fields',
    ]);
    for (const candidate of [
      { ...valid, schemaVersion: 2 },
      { ...valid, defaultVersion: '' },
      { ...valid, defaultVersion: ' v2 ' },
      { ...valid, defaultVersion: 'version-2' },
      { ...valid, schedule: 'bad' },
      { ...valid, schedule: [] },
    ]) {
      expect(normalizeGeneratorMapSnapshot(candidate).issues).toEqual(['generator-map-values']);
    }

    const badEntries: unknown[] = [
      null,
      { effectiveFrom: '2026-01-01', version: 'v2', extra: true },
      { effectiveFrom: 123, version: 'v2' },
      { effectiveFrom: 'bad', version: 'v2' },
      { effectiveFrom: '0000-01-01', version: 'v2' },
      { effectiveFrom: '2026-13-01', version: 'v2' },
      { effectiveFrom: '2026-01-32', version: 'v2' },
      { effectiveFrom: '2026-02-30', version: 'v2' },
      { effectiveFrom: '2026-01-01', version: '' },
      { effectiveFrom: '2026-01-01', version: ' v2 ' },
      { effectiveFrom: '2026-01-01', version: 'bad' },
    ];
    for (const entry of badEntries) {
      expect(normalizeGeneratorMapSnapshot({ ...valid, schedule: [entry] }).issues).toEqual([
        'generator-map-schedule',
      ]);
    }
    expect(
      normalizeGeneratorMapSnapshot({
        ...valid,
        schedule: [valid.schedule[1], valid.schedule[0]],
      }).issues,
    ).toEqual(['generator-map-schedule']);
    expect(
      normalizeGeneratorMapSnapshot({
        ...valid,
        defaultVersion: 'v3',
      }).issues,
    ).toEqual(['generator-map-default']);
    expect(
      normalizeGeneratorMapSnapshot({
        ...valid,
        defaultVersion: 'v1',
      }).issues,
    ).toEqual(['generator-map-latest']);

    const fallback = normalizeGeneratorMapSnapshot(null, DEFAULT_GENERATOR_MAP_SNAPSHOT);
    expect(fallback.value).toBe(DEFAULT_GENERATOR_MAP_SNAPSHOT);
    expect(schemaVersionOf(null)).toBeUndefined();
    expect(schemaVersionOf({ schemaVersion: '1' })).toBeUndefined();
    expect(schemaVersionOf({ schemaVersion: 0 })).toBe(0);
    expect(schemaVersionOf({ schemaVersion: 1 })).toBe(1);
  });
});
