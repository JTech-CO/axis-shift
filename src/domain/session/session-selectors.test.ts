import { describe, expect, it } from 'vitest';

import { factorizeGF2, rankGF2 } from '../algebra/index.ts';
import { differenceRows } from '../board/board.ts';
import { applyPulse } from '../board/pulse.ts';
import type { EncodedPulse, PuzzleDefinition } from '../types.ts';
import { gameSessionReducer } from './session-reducer.ts';
import {
  selectActiveElapsedMs,
  selectCanPulse,
  selectCanUndo,
  selectHint,
  selectIsPersistableStatus,
  selectNextCanonicalPulse,
  selectPulseCount,
  selectRemainingRank,
  selectRemainingRows,
} from './session-selectors.ts';
import { createGameSessionState, type GameSessionState } from './session.ts';

function puzzleForTarget(size: number, targetRows: readonly number[]): PuzzleDefinition {
  const initialRows = Object.freeze(Array.from({ length: size }, () => 0));
  const difference = differenceRows(initialRows, targetRows, size);
  return Object.freeze({
    canonicalSolution: Object.freeze(
      factorizeGF2(difference, size).map((pulse) => Object.freeze({ ...pulse })),
    ),
    complexityScore: 0,
    difficulty: 'normal',
    generatorVersion: 'v1',
    id: `selector-${size}`,
    initialRows,
    mode: 'lab',
    optimalPulseCount: rankGF2(difference, size),
    schemaVersion: 1,
    size,
    tags: Object.freeze([]),
    targetRows: Object.freeze([...targetRows]),
  });
}

function rankTwoPuzzle(size: number): PuzzleDefinition {
  return puzzleForTarget(size, [0b011, 0b101, ...Array.from({ length: size - 2 }, () => 0)]);
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

describe('session interaction selectors', () => {
  it('derives pulse, undo, count, and persistence readiness without storing duplicates', () => {
    const puzzle = rankTwoPuzzle(3);
    const ready = createGameSessionState(puzzle, 'selector-state');
    expect(selectCanPulse(ready)).toBe(false);
    expect(selectCanUndo(ready)).toBe(false);
    expect(selectPulseCount(ready)).toBe(0);
    expect(selectIsPersistableStatus(ready)).toBe(true);

    const pulse = puzzle.canonicalSolution?.[0] as EncodedPulse;
    const rowsSelected = selectMask(ready, 'row', pulse.rowMask, 100);
    expect(selectCanPulse(rowsSelected)).toBe(false);
    const selected = selectMask(rowsSelected, 'column', pulse.colMask, 100);
    expect(selectCanPulse(selected)).toBe(true);

    const pulsing = gameSessionReducer(selected, {
      type: 'PULSE_COMMIT',
      actionId: 'selector-pulse',
      nowEpochMs: 200,
    });
    expect(selectCanPulse(pulsing)).toBe(false);
    expect(selectCanUndo(pulsing)).toBe(false);
    expect(selectPulseCount(pulsing)).toBe(1);
    expect(selectIsPersistableStatus(pulsing)).toBe(true);

    const selecting = gameSessionReducer(pulsing, {
      type: 'PULSE_ANIMATION_FINISHED',
      actionId: 'selector-pulse',
    });
    expect(selectCanUndo(selecting)).toBe(true);
    expect(selectIsPersistableStatus(selecting)).toBe(true);

    const paused = gameSessionReducer(selecting, {
      type: 'VISIBILITY_CHANGED',
      hidden: true,
      nowEpochMs: 300,
    });
    expect(selectIsPersistableStatus(paused)).toBe(true);

    const idle = createGameSessionState(puzzle, 'error-selector');
    const error = gameSessionReducer(idle, { type: 'SESSION_ERROR' });
    expect(selectIsPersistableStatus(error)).toBe(false);
  });

  it('projects current remaining rows without mutating session or target arrays', () => {
    const puzzle = rankTwoPuzzle(4);
    const state = createGameSessionState(puzzle, 'remaining');
    const sessionRowsBefore = [...state.session.currentRows];
    const targetRowsBefore = [...puzzle.targetRows];

    expect(selectRemainingRows(state)).toEqual(puzzle.targetRows);
    expect(selectRemainingRank(state)).toBe(2);
    expect(state.session.currentRows).toEqual(sessionRowsBefore);
    expect(puzzle.targetRows).toEqual(targetRowsBefore);
  });
});

describe('canonical session hints', () => {
  it('uses one current canonical factorization and lowers remaining rank by one for sizes 3..8', () => {
    for (let size = 3; size <= 8; size += 1) {
      const puzzle = rankTwoPuzzle(size);
      const ready = createGameSessionState(puzzle, `hint-${size}`);
      const beforeRank = selectRemainingRank(ready);
      const nextPulse = selectNextCanonicalPulse(ready);
      const depth = selectHint(ready, 1);
      const axis = selectHint(ready, 2);
      const full = selectHint(ready, 3);

      expect(beforeRank).toBe(2);
      expect(depth).toEqual({ level: 1, remainingPulseCount: beforeRank });
      expect(axis).toEqual({ level: 2, rowMask: nextPulse?.rowMask });
      expect(full).toEqual({ level: 3, pulse: nextPulse });
      expect(Object.isFrozen(nextPulse)).toBe(true);

      if (nextPulse === undefined) throw new Error('Expected a canonical next pulse.');
      const nextRows = applyPulse(
        ready.session.currentRows,
        size,
        nextPulse.rowMask,
        nextPulse.colMask,
      );
      expect(rankGF2(differenceRows(nextRows, puzzle.targetRows, size), size)).toBe(beforeRank - 1);

      const selected = selectPulse(ready, nextPulse, 100);
      const committed = gameSessionReducer(selected, {
        type: 'PULSE_COMMIT',
        actionId: `hint-pulse-${size}`,
        nowEpochMs: 200,
      });
      const stable = gameSessionReducer(committed, {
        type: 'PULSE_ANIMATION_FINISHED',
        actionId: `hint-pulse-${size}`,
      });
      expect(selectRemainingRank(stable)).toBe(beforeRank - 1);
    }
  });

  it('tracks only the highest used hint without starting the timer', () => {
    const state = createGameSessionState(rankTwoPuzzle(3), 'hint-level');
    const hintOne = gameSessionReducer(state, { type: 'USE_HINT', level: 1 });
    expect(hintOne.session.hintLevelUsed).toBe(1);
    expect(hintOne.session.startedAtEpochMs).toBeNull();
    expect(hintOne.session.status).toBe('ready');
    expect(gameSessionReducer(hintOne, { type: 'USE_HINT', level: 1 })).toBe(hintOne);

    const hintThree = gameSessionReducer(hintOne, { type: 'USE_HINT', level: 3 });
    expect(hintThree.session.hintLevelUsed).toBe(3);
    expect(gameSessionReducer(hintThree, { type: 'USE_HINT', level: 2 })).toBe(hintThree);
  });

  it('returns rank zero but no axis or pulse after the board is solved', () => {
    const puzzle = puzzleForTarget(3, [1, 0, 0]);
    const pulse = puzzle.canonicalSolution?.[0] as EncodedPulse;
    const selected = selectPulse(createGameSessionState(puzzle, 'solved-hint'), pulse, 100);
    const committed = gameSessionReducer(selected, {
      type: 'PULSE_COMMIT',
      actionId: 'solve',
      nowEpochMs: 200,
    });
    const solved = gameSessionReducer(committed, {
      type: 'PULSE_ANIMATION_FINISHED',
      actionId: 'solve',
    });

    expect(selectHint(solved, 1)).toEqual({ level: 1, remainingPulseCount: 0 });
    expect(selectHint(solved, 2)).toBeUndefined();
    expect(selectHint(solved, 3)).toBeUndefined();
    expect(selectNextCanonicalPulse(solved)).toBeUndefined();
    expect(selectIsPersistableStatus(solved)).toBe(true);
  });
});

describe('active elapsed selector', () => {
  it('uses the clamped observation without mutating stored elapsed time', () => {
    const ready = createGameSessionState(rankTwoPuzzle(3), 'elapsed-selector');
    expect(selectActiveElapsedMs(ready, 9_000)).toBe(0);

    const started = gameSessionReducer(ready, {
      type: 'TOGGLE_ROW',
      index: 0,
      nowEpochMs: 1_000,
    });
    const observedLater = gameSessionReducer(started, {
      type: 'TOGGLE_ROW',
      index: 1,
      nowEpochMs: 5_000,
    });
    expect(selectActiveElapsedMs(observedLater, 2_000)).toBe(4_000);
    expect(selectActiveElapsedMs(observedLater, 5_500)).toBe(4_500);
    expect(selectActiveElapsedMs(observedLater, Number.NaN)).toBe(0);
    expect(selectActiveElapsedMs(observedLater, 5_500.5)).toBe(0);
    expect(selectActiveElapsedMs(observedLater, Number.MAX_SAFE_INTEGER + 1)).toBe(0);
    expect(observedLater.session.activeElapsedMs).toBe(0);

    const paused = gameSessionReducer(observedLater, {
      type: 'VISIBILITY_CHANGED',
      hidden: true,
      nowEpochMs: 5_500,
    });
    expect(selectActiveElapsedMs(paused, 99_000)).toBe(4_500);
  });
});
