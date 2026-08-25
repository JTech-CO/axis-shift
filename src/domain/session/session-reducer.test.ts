import { describe, expect, it } from 'vitest';

import { factorizeGF2 } from '../algebra/factorization.ts';
import { rankGF2 } from '../algebra/gf2-rank.ts';
import { differenceRows } from '../board/board.ts';
import { outerProductRows } from '../board/pulse.ts';
import type { EncodedPulse, PuzzleDefinition } from '../types.ts';
import { gameSessionReducer, type GameSessionAction } from './session-reducer.ts';
import {
  createGameSession,
  createGameSessionState,
  sessionCompletionEventId,
  type GameSessionState,
} from './session.ts';

function puzzleForTarget(
  size: number,
  targetRows: readonly number[],
  id = `session-test-${size}`,
): PuzzleDefinition {
  const initialRows = Object.freeze(Array.from({ length: size }, () => 0));
  const difference = differenceRows(initialRows, targetRows, size);
  const canonicalSolution = Object.freeze(
    factorizeGF2(difference, size).map((pulse) => Object.freeze({ ...pulse })),
  );
  return Object.freeze({
    canonicalSolution,
    complexityScore: 0,
    difficulty: 'normal',
    generatorVersion: 'v1',
    id,
    initialRows,
    mode: 'lab',
    optimalPulseCount: rankGF2(difference, size),
    schemaVersion: 1,
    size,
    tags: Object.freeze([]),
    targetRows: Object.freeze([...targetRows]),
  });
}

function rankOnePuzzle(size = 3): PuzzleDefinition {
  return puzzleForTarget(size, outerProductRows(size, 0b101, 0b011), `rank-one-${size}`);
}

function rankTwoPuzzle(size: number): PuzzleDefinition {
  return puzzleForTarget(
    size,
    [0b011, 0b101, ...Array.from({ length: size - 2 }, () => 0)],
    `rank-two-${size}`,
  );
}

function selectMask(
  state: GameSessionState,
  axis: 'column' | 'row',
  mask: number,
  nowEpochMs: number,
): GameSessionState {
  let selected = state;
  for (let index = 0; index < state.puzzle.size; index += 1) {
    if ((mask & (1 << index)) === 0) continue;
    selected = gameSessionReducer(selected, {
      type: axis === 'row' ? 'TOGGLE_ROW' : 'TOGGLE_COL',
      index,
      nowEpochMs,
    });
  }
  return selected;
}

function selectPulse(
  state: GameSessionState,
  pulse: EncodedPulse,
  nowEpochMs: number,
): GameSessionState {
  return selectMask(
    selectMask(state, 'row', pulse.rowMask, nowEpochMs),
    'column',
    pulse.colMask,
    nowEpochMs,
  );
}

describe('GameSession creation and transition guards', () => {
  it('creates a detached JSON-safe ready attempt and deterministic completion id', () => {
    const puzzle = rankOnePuzzle();
    const session = createGameSession(puzzle, 'attempt-1');

    expect(session).toMatchObject({
      acceptedPulseActionIds: [],
      activeElapsedMs: 0,
      activeSinceEpochMs: null,
      completedAtEpochMs: null,
      completionEvent: null,
      currentRows: [0, 0, 0],
      hiddenAtEpochMs: null,
      hintLevelUsed: 0,
      lastObservedEpochMs: null,
      moves: [],
      puzzleId: puzzle.id,
      selectedColsMask: 0,
      selectedRowsMask: 0,
      sessionId: 'attempt-1',
      startedAtEpochMs: null,
      status: 'ready',
      undoCount: 0,
    });
    expect(session.currentRows).not.toBe(puzzle.initialRows);
    expect(Object.isFrozen(session)).toBe(true);
    expect(Object.isFrozen(session.currentRows)).toBe(true);
    expect(sessionCompletionEventId('attempt-1')).toBe('attempt-1:completed');
    expect(JSON.parse(JSON.stringify(session))).toEqual(session);
  });

  it('rejects invalid creation identifiers and trivial puzzle pairs', () => {
    const puzzle = rankOnePuzzle();
    expect(() => createGameSession(puzzle, '')).toThrow(/sessionId/u);
    expect(() => createGameSession(puzzle, ' padded ')).toThrow(/sessionId/u);
    expect(() => createGameSession({ ...puzzle, id: '' }, 'attempt')).toThrow(/puzzle\.id/u);
    expect(() =>
      createGameSession(
        {
          ...puzzle,
          canonicalSolution: [],
          initialRows: puzzle.targetRows,
          optimalPulseCount: 0,
        },
        'attempt',
      ),
    ).toThrow(/target state/u);
  });

  it('returns the identical state reference for invalid actions and transitions', () => {
    const state = createGameSessionState(rankOnePuzzle(), 'guarded');
    const invalidActions: readonly GameSessionAction[] = [
      { type: 'TOGGLE_ROW', index: -1, nowEpochMs: 1 },
      { type: 'TOGGLE_ROW', index: 3, nowEpochMs: 1 },
      { type: 'TOGGLE_COL', index: 1.5, nowEpochMs: 1 },
      { type: 'TOGGLE_COL', index: 0, nowEpochMs: Number.NaN },
      { type: 'TOGGLE_COL', index: 0, nowEpochMs: 1.5 },
      { type: 'PULSE_COMMIT', actionId: 'empty-axes', nowEpochMs: 1 },
      { type: 'PULSE_ANIMATION_FINISHED', actionId: 'not-pulsing' },
      { type: 'UNDO', nowEpochMs: 1 },
      { type: 'RESET_CONFIRMED', sessionId: 'guarded' },
      { type: 'VISIBILITY_CHANGED', hidden: false, nowEpochMs: 1 },
      { type: 'SESSION_RECOVER' },
      { type: 'USE_HINT', level: 4 } as unknown as GameSessionAction,
      { type: 'UNKNOWN' } as unknown as GameSessionAction,
    ];

    for (const action of invalidActions) {
      expect(gameSessionReducer(state, action)).toBe(state);
    }

    const error = gameSessionReducer(state, { type: 'SESSION_ERROR' });
    expect(error.session.status).toBe('error');
    expect(gameSessionReducer(error, { type: 'SESSION_ERROR' })).toBe(error);
    const recovered = gameSessionReducer(error, { type: 'SESSION_RECOVER' });
    expect(recovered.session.status).toBe('ready');

    const selecting = gameSessionReducer(state, {
      type: 'TOGGLE_ROW',
      index: 0,
      nowEpochMs: 10,
    });
    expect(gameSessionReducer(selecting, { type: 'SESSION_ERROR' })).toBe(selecting);

    const fullySelected = gameSessionReducer(selecting, {
      type: 'TOGGLE_COL',
      index: 0,
      nowEpochMs: 10,
    });
    const invalidCommits: readonly GameSessionAction[] = [
      { type: 'PULSE_COMMIT', actionId: '', nowEpochMs: 20 },
      { type: 'PULSE_COMMIT', actionId: ' padded ', nowEpochMs: 20 },
      { type: 'PULSE_COMMIT', actionId: 'valid-id', nowEpochMs: Number.NaN },
      {
        type: 'PULSE_COMMIT',
        actionId: 'unsafe-epoch',
        nowEpochMs: Number.MAX_SAFE_INTEGER + 1,
      },
      {
        type: 'PULSE_COMMIT',
        actionId: null,
        nowEpochMs: 20,
      } as unknown as GameSessionAction,
    ];
    for (const action of invalidCommits) {
      expect(gameSessionReducer(fullySelected, action)).toBe(fullySelected);
    }

    expect(
      gameSessionReducer(state, {
        type: 'VISIBILITY_CHANGED',
        hidden: true,
        nowEpochMs: Number.NaN,
      }),
    ).toBe(state);
    const paused = gameSessionReducer(state, {
      type: 'VISIBILITY_CHANGED',
      hidden: true,
      nowEpochMs: 20,
    });
    expect(
      gameSessionReducer(paused, {
        type: 'VISIBILITY_CHANGED',
        hidden: false,
        nowEpochMs: Number.NaN,
      }),
    ).toBe(paused);
    expect(gameSessionReducer(paused, { type: 'USE_HINT', level: 1 })).toBe(paused);
  });
});

describe('atomic PULSE and completion idempotency', () => {
  it('commits board, move, action ledger, elapsed time, and completion exactly once', () => {
    const puzzle = rankOnePuzzle();
    const initial = createGameSessionState(puzzle, 'atomic');
    const selected = selectPulse(initial, puzzle.canonicalSolution?.[0] as EncodedPulse, 1_000);
    const selectedRowsBefore = [...selected.session.currentRows];

    const committed = gameSessionReducer(selected, {
      type: 'PULSE_COMMIT',
      actionId: 'pulse-1',
      nowEpochMs: 1_500,
    });

    expect(committed.session).toMatchObject({
      acceptedPulseActionIds: ['pulse-1'],
      activeElapsedMs: 500,
      activeSinceEpochMs: null,
      completedAtEpochMs: 1_500,
      currentRows: puzzle.targetRows,
      lastObservedEpochMs: 1_500,
      selectedColsMask: 0,
      selectedRowsMask: 0,
      status: 'pulsing',
    });
    expect(committed.session.moves).toEqual([
      {
        actionId: 'pulse-1',
        appliedAtMs: 1_500,
        colMask: puzzle.canonicalSolution?.[0]?.colMask,
        rowMask: puzzle.canonicalSolution?.[0]?.rowMask,
      },
    ]);
    expect(committed.session.completionEvent).toEqual({
      activeElapsedMs: 500,
      completedAtEpochMs: 1_500,
      eventId: 'atomic:completed',
      hintLevelUsed: 0,
      pulseCount: 1,
      puzzleId: puzzle.id,
      sessionId: 'atomic',
    });
    expect(selected.session.currentRows).toEqual(selectedRowsBefore);
    expect(selected.session.moves).toEqual([]);
    expect(initial.session.currentRows).toEqual(puzzle.initialRows);

    expect(
      gameSessionReducer(committed, {
        type: 'PULSE_COMMIT',
        actionId: 'rapid-different-id',
        nowEpochMs: 1_501,
      }),
    ).toBe(committed);

    let replayed = committed;
    for (let index = 0; index < 100; index += 1) {
      replayed = gameSessionReducer(replayed, {
        type: 'PULSE_COMMIT',
        actionId: 'pulse-1',
        nowEpochMs: 2_000 + index,
      });
      expect(replayed).toBe(committed);
    }
    expect(
      gameSessionReducer(committed, {
        type: 'PULSE_ANIMATION_FINISHED',
        actionId: 'stale',
      }),
    ).toBe(committed);

    const solved = gameSessionReducer(committed, {
      type: 'PULSE_ANIMATION_FINISHED',
      actionId: 'pulse-1',
    });
    expect(solved.session.status).toBe('solved');
    expect(solved.session.completionEvent).toBe(committed.session.completionEvent);
    expect(
      gameSessionReducer(solved, {
        type: 'PULSE_COMMIT',
        actionId: 'new-after-solved',
        nowEpochMs: 9_000,
      }),
    ).toBe(solved);
    expect(
      gameSessionReducer(solved, {
        type: 'PULSE_ANIMATION_FINISHED',
        actionId: 'pulse-1',
      }),
    ).toBe(solved);
  });

  it('starts Reset as a new attempt while refusing Reset during pulsing', () => {
    const puzzle = rankOnePuzzle();
    const selected = selectPulse(
      createGameSessionState(puzzle, 'old-attempt'),
      puzzle.canonicalSolution?.[0] as EncodedPulse,
      100,
    );
    const pulsing = gameSessionReducer(selected, {
      type: 'PULSE_COMMIT',
      actionId: 'reusable-token',
      nowEpochMs: 200,
    });
    expect(
      gameSessionReducer(pulsing, {
        type: 'RESET_CONFIRMED',
        sessionId: 'new-attempt',
      }),
    ).toBe(pulsing);

    const solved = gameSessionReducer(pulsing, {
      type: 'PULSE_ANIMATION_FINISHED',
      actionId: 'reusable-token',
    });
    const reset = gameSessionReducer(solved, {
      type: 'RESET_CONFIRMED',
      sessionId: 'new-attempt',
    });
    expect(reset.session).toEqual(createGameSession(puzzle, 'new-attempt'));
    expect(reset.session.acceptedPulseActionIds).toEqual([]);
    expect(reset.session.completionEvent).toBeNull();

    const reselected = selectPulse(reset, puzzle.canonicalSolution?.[0] as EncodedPulse, 300);
    const recommitted = gameSessionReducer(reselected, {
      type: 'PULSE_COMMIT',
      actionId: 'reusable-token',
      nowEpochMs: 400,
    });
    expect(recommitted.session.moves).toHaveLength(1);
    expect(recommitted.session.completionEvent?.eventId).toBe('new-attempt:completed');
  });
});

describe('Undo and accepted action history', () => {
  it('inverts the last PULSE for every board size while retaining the attempt ledger', () => {
    for (let size = 3; size <= 8; size += 1) {
      const puzzle = rankTwoPuzzle(size);
      const firstPulse = puzzle.canonicalSolution?.[0] as EncodedPulse;
      const initial = createGameSessionState(puzzle, `undo-${size}`);
      const selected = selectPulse(initial, firstPulse, 100);
      const committed = gameSessionReducer(selected, {
        type: 'PULSE_COMMIT',
        actionId: `pulse-${size}`,
        nowEpochMs: 200,
      });
      expect(committed.session.status).toBe('pulsing');
      expect(committed.session.completionEvent).toBeNull();
      expect(gameSessionReducer(committed, { type: 'UNDO', nowEpochMs: 250 })).toBe(committed);

      const stable = gameSessionReducer(committed, {
        type: 'PULSE_ANIMATION_FINISHED',
        actionId: `pulse-${size}`,
      });
      expect(stable.session.status).toBe('selecting');
      expect(
        rankGF2(differenceRows(stable.session.currentRows, puzzle.targetRows, size), size),
      ).toBe(puzzle.optimalPulseCount - 1);

      expect(gameSessionReducer(stable, { type: 'UNDO', nowEpochMs: Number.NaN })).toBe(stable);
      const undone = gameSessionReducer(stable, { type: 'UNDO', nowEpochMs: 300 });
      expect(undone.session.currentRows).toEqual(puzzle.initialRows);
      expect(undone.session.moves).toEqual([]);
      expect(undone.session.acceptedPulseActionIds).toEqual([`pulse-${size}`]);
      expect(undone.session.undoCount).toBe(1);
      expect(stable.session.currentRows).not.toEqual(puzzle.initialRows);

      const reselected = selectPulse(undone, firstPulse, 350);
      const replay = gameSessionReducer(reselected, {
        type: 'PULSE_COMMIT',
        actionId: `pulse-${size}`,
        nowEpochMs: 400,
      });
      expect(replay).toBe(reselected);
      expect(replay.session.currentRows).toEqual(puzzle.initialRows);

      const freshCommit = gameSessionReducer(reselected, {
        type: 'PULSE_COMMIT',
        actionId: `pulse-${size}-fresh`,
        nowEpochMs: 400,
      });
      expect(freshCommit.session.moves).toHaveLength(1);
      expect(freshCommit.session.acceptedPulseActionIds).toEqual([
        `pulse-${size}`,
        `pulse-${size}-fresh`,
      ]);
    }
  });
});

describe('active elapsed time and visibility', () => {
  it('commits against the latest TIMER_TICK high-water without elapsed regression', () => {
    const puzzle = puzzleForTarget(3, [1, 0, 0], 'tick-high-water');
    const ready = createGameSessionState(puzzle, 'tick-attempt');
    expect(gameSessionReducer(ready, { type: 'TIMER_TICK', nowEpochMs: 10_000 })).toBe(ready);

    const rowSelected = gameSessionReducer(ready, {
      type: 'TOGGLE_ROW',
      index: 0,
      nowEpochMs: 1_000,
    });
    const selected = gameSessionReducer(rowSelected, {
      type: 'TOGGLE_COL',
      index: 0,
      nowEpochMs: 1_000,
    });
    const ticked = gameSessionReducer(selected, {
      type: 'TIMER_TICK',
      nowEpochMs: 10_000,
    });
    expect(ticked.session.lastObservedEpochMs).toBe(10_000);
    expect(gameSessionReducer(ticked, { type: 'TIMER_TICK', nowEpochMs: 10_000 })).toBe(ticked);
    expect(gameSessionReducer(ticked, { type: 'TIMER_TICK', nowEpochMs: 6_000 })).toBe(ticked);
    expect(gameSessionReducer(ticked, { type: 'TIMER_TICK', nowEpochMs: 10_000.5 })).toBe(ticked);

    const completed = gameSessionReducer(ticked, {
      type: 'PULSE_COMMIT',
      actionId: 'tick-solve',
      nowEpochMs: 6_000,
    });
    expect(completed.session.moves[0]?.appliedAtMs).toBe(10_000);
    expect(completed.session.completedAtEpochMs).toBe(10_000);
    expect(completed.session.activeElapsedMs).toBe(9_000);
    expect(completed.session.completionEvent?.activeElapsedMs).toBe(9_000);
    expect(gameSessionReducer(completed, { type: 'TIMER_TICK', nowEpochMs: 11_000 })).toBe(
      completed,
    );

    const solved = gameSessionReducer(completed, {
      type: 'PULSE_ANIMATION_FINISHED',
      actionId: 'tick-solve',
    });
    expect(gameSessionReducer(solved, { type: 'TIMER_TICK', nowEpochMs: 12_000 })).toBe(solved);

    const paused = gameSessionReducer(selected, {
      type: 'VISIBILITY_CHANGED',
      hidden: true,
      nowEpochMs: 2_000,
    });
    expect(gameSessionReducer(paused, { type: 'TIMER_TICK', nowEpochMs: 3_000 })).toBe(paused);

    const error = gameSessionReducer(ready, { type: 'SESSION_ERROR' });
    expect(gameSessionReducer(error, { type: 'TIMER_TICK', nowEpochMs: 10_000 })).toBe(error);

    const rankTwo = rankTwoPuzzle(3);
    const firstPulse = rankTwo.canonicalSolution?.[0] as EncodedPulse;
    const rankTwoSelected = selectPulse(
      createGameSessionState(rankTwo, 'tick-pulsing'),
      firstPulse,
      1_000,
    );
    const pulsing = gameSessionReducer(rankTwoSelected, {
      type: 'PULSE_COMMIT',
      actionId: 'tick-unsolved',
      nowEpochMs: 2_000,
    });
    const pulsingTick = gameSessionReducer(pulsing, {
      type: 'TIMER_TICK',
      nowEpochMs: 3_000,
    });
    expect(pulsingTick.session.status).toBe('pulsing');
    expect(pulsingTick.session.lastObservedEpochMs).toBe(3_000);
  });

  it('starts on the first valid axis, clamps clock reversal, and excludes hidden intervals', () => {
    const puzzle = puzzleForTarget(3, [1, 0, 0], 'clock');
    const initial = createGameSessionState(puzzle, 'clock-attempt');
    expect(initial.session.activeElapsedMs).toBe(0);

    const rowSelected = gameSessionReducer(initial, {
      type: 'TOGGLE_ROW',
      index: 0,
      nowEpochMs: 1_000,
    });
    expect(rowSelected.session).toMatchObject({
      activeSinceEpochMs: 1_000,
      lastObservedEpochMs: 1_000,
      startedAtEpochMs: 1_000,
      status: 'selecting',
    });
    const bothSelected = gameSessionReducer(rowSelected, {
      type: 'TOGGLE_COL',
      index: 0,
      nowEpochMs: 5_000,
    });
    expect(bothSelected.session.lastObservedEpochMs).toBe(5_000);

    const hidden = gameSessionReducer(bothSelected, {
      type: 'VISIBILITY_CHANGED',
      hidden: true,
      nowEpochMs: 2_000,
    });
    expect(hidden.session).toMatchObject({
      activeElapsedMs: 4_000,
      activeSinceEpochMs: null,
      hiddenAtEpochMs: 5_000,
      lastObservedEpochMs: 5_000,
      status: 'paused',
    });
    expect(
      gameSessionReducer(hidden, {
        type: 'VISIBILITY_CHANGED',
        hidden: true,
        nowEpochMs: 9_000,
      }),
    ).toBe(hidden);

    const resumed = gameSessionReducer(hidden, {
      type: 'VISIBILITY_CHANGED',
      hidden: false,
      nowEpochMs: 3_000,
    });
    expect(resumed.session).toMatchObject({
      activeElapsedMs: 4_000,
      activeSinceEpochMs: 5_000,
      hiddenAtEpochMs: null,
      lastObservedEpochMs: 5_000,
      status: 'selecting',
    });
    const hiddenAgain = gameSessionReducer(resumed, {
      type: 'VISIBILITY_CHANGED',
      hidden: true,
      nowEpochMs: 5_500,
    });
    expect(hiddenAgain.session.activeElapsedMs).toBe(4_500);
    const resumedAgain = gameSessionReducer(hiddenAgain, {
      type: 'VISIBILITY_CHANGED',
      hidden: false,
      nowEpochMs: 4_500,
    });
    expect(resumedAgain.session.activeSinceEpochMs).toBe(5_500);

    const completed = gameSessionReducer(resumedAgain, {
      type: 'PULSE_COMMIT',
      actionId: 'clock-pulse',
      nowEpochMs: 6_000,
    });
    expect(completed.session.activeElapsedMs).toBe(5_000);
    expect(completed.session.completedAtEpochMs).toBe(6_000);

    const hiddenWhilePulsing = gameSessionReducer(completed, {
      type: 'VISIBILITY_CHANGED',
      hidden: true,
      nowEpochMs: 6_500,
    });
    expect(hiddenWhilePulsing.session.status).toBe('paused');
    expect(hiddenWhilePulsing.session.activeElapsedMs).toBe(5_000);
    expect(
      gameSessionReducer(hiddenWhilePulsing, {
        type: 'PULSE_ANIMATION_FINISHED',
        actionId: 'clock-pulse',
      }),
    ).toBe(hiddenWhilePulsing);
    const resumedSolved = gameSessionReducer(hiddenWhilePulsing, {
      type: 'VISIBILITY_CHANGED',
      hidden: false,
      nowEpochMs: 7_000,
    });
    expect(resumedSolved.session.status).toBe('solved');
    expect(resumedSolved.session.completedAtEpochMs).toBe(6_000);
    expect(resumedSolved.session.completionEvent?.activeElapsedMs).toBe(5_000);
  });

  it('pauses and resumes a not-yet-started attempt without starting its clock', () => {
    const state = createGameSessionState(rankOnePuzzle(), 'idle-pause');
    const paused = gameSessionReducer(state, {
      type: 'VISIBILITY_CHANGED',
      hidden: true,
      nowEpochMs: 100,
    });
    expect(paused.session.status).toBe('paused');
    expect(paused.session.startedAtEpochMs).toBeNull();
    expect(paused.session.activeElapsedMs).toBe(0);

    const resumed = gameSessionReducer(paused, {
      type: 'VISIBILITY_CHANGED',
      hidden: false,
      nowEpochMs: 500,
    });
    expect(resumed.session.status).toBe('ready');
    expect(resumed.session.activeSinceEpochMs).toBeNull();
    expect(resumed.session.activeElapsedMs).toBe(0);
  });
});
