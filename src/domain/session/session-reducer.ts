import { applyPulse, isSolved } from '../board/index.ts';
import type { PuzzleDefinition } from '../types.ts';
import {
  createGameSession,
  type GameSession,
  type GameSessionState,
  type HintLevel,
  type SessionCompletionEvent,
  sessionCompletionEventId,
} from './session.ts';

export type GameSessionAction =
  | { readonly type: 'TOGGLE_ROW'; readonly index: number; readonly nowEpochMs: number }
  | { readonly type: 'TOGGLE_COL'; readonly index: number; readonly nowEpochMs: number }
  | {
      readonly type: 'PULSE_COMMIT';
      readonly actionId: string;
      readonly nowEpochMs: number;
    }
  | { readonly type: 'PULSE_ANIMATION_FINISHED'; readonly actionId: string }
  | { readonly type: 'UNDO'; readonly nowEpochMs: number }
  | { readonly type: 'RESET_CONFIRMED'; readonly sessionId: string }
  | { readonly type: 'USE_HINT'; readonly level: 1 | 2 | 3 }
  | { readonly type: 'TIMER_TICK'; readonly nowEpochMs: number }
  | {
      readonly type: 'VISIBILITY_CHANGED';
      readonly hidden: boolean;
      readonly nowEpochMs: number;
    }
  | { readonly type: 'SESSION_ERROR' }
  | { readonly type: 'SESSION_RECOVER' };

function isValidEpochMs(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function isValidIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.trim() === value;
}

function isValidAxisIndex(index: number, puzzle: PuzzleDefinition): boolean {
  return Number.isInteger(index) && index >= 0 && index < puzzle.size;
}

function observedNow(session: GameSession, nowEpochMs: number): number | undefined {
  if (!isValidEpochMs(nowEpochMs)) return undefined;
  return Math.max(session.lastObservedEpochMs ?? nowEpochMs, nowEpochMs);
}

function freezeCompletionEvent(event: SessionCompletionEvent): SessionCompletionEvent {
  return Object.freeze(event);
}

function freezeSession(session: GameSession): GameSession {
  return Object.freeze(session);
}

function replaceSession(state: GameSessionState, session: GameSession): GameSessionState {
  return Object.freeze({ puzzle: state.puzzle, session: freezeSession(session) });
}

function closeActiveSegment(session: GameSession, nowEpochMs: number): number {
  if (session.activeSinceEpochMs === null) return session.activeElapsedMs;
  return session.activeElapsedMs + Math.max(0, nowEpochMs - session.activeSinceEpochMs);
}

function toggleAxis(
  state: GameSessionState,
  axis: 'column' | 'row',
  index: number,
  nowEpochMs: number,
): GameSessionState {
  const { puzzle, session } = state;
  if (
    (session.status !== 'ready' && session.status !== 'selecting') ||
    !isValidAxisIndex(index, puzzle)
  ) {
    return state;
  }
  const now = observedNow(session, nowEpochMs);
  if (now === undefined) return state;

  const bit = 1 << index;
  const firstSelection = session.startedAtEpochMs === null;
  return replaceSession(state, {
    ...session,
    activeSinceEpochMs: firstSelection ? now : session.activeSinceEpochMs,
    lastObservedEpochMs: now,
    selectedColsMask: axis === 'column' ? session.selectedColsMask ^ bit : session.selectedColsMask,
    selectedRowsMask: axis === 'row' ? session.selectedRowsMask ^ bit : session.selectedRowsMask,
    startedAtEpochMs: firstSelection ? now : session.startedAtEpochMs,
    status: 'selecting',
  });
}

function commitPulse(
  state: GameSessionState,
  actionId: string,
  nowEpochMs: number,
): GameSessionState {
  const { puzzle, session } = state;
  if (
    session.status !== 'selecting' ||
    session.selectedRowsMask === 0 ||
    session.selectedColsMask === 0 ||
    !isValidIdentifier(actionId) ||
    session.acceptedPulseActionIds.includes(actionId)
  ) {
    return state;
  }
  const now = observedNow(session, nowEpochMs);
  if (now === undefined) return state;

  const currentRows = Object.freeze(
    applyPulse(
      session.currentRows,
      puzzle.size,
      session.selectedRowsMask,
      session.selectedColsMask,
    ),
  );
  const solved = isSolved(currentRows, puzzle.targetRows, puzzle.size);
  const moves = Object.freeze([
    ...session.moves,
    Object.freeze({
      actionId,
      appliedAtMs: now,
      colMask: session.selectedColsMask,
      rowMask: session.selectedRowsMask,
    }),
  ]);
  const activeElapsedMs = solved ? closeActiveSegment(session, now) : session.activeElapsedMs;
  const completionEvent = solved
    ? freezeCompletionEvent({
        activeElapsedMs,
        completedAtEpochMs: now,
        eventId: sessionCompletionEventId(session.sessionId),
        hintLevelUsed: session.hintLevelUsed,
        pulseCount: moves.length,
        puzzleId: session.puzzleId,
        sessionId: session.sessionId,
      })
    : null;

  return replaceSession(state, {
    ...session,
    acceptedPulseActionIds: Object.freeze([...session.acceptedPulseActionIds, actionId]),
    activeElapsedMs,
    activeSinceEpochMs: solved ? null : session.activeSinceEpochMs,
    completedAtEpochMs: solved ? now : null,
    completionEvent,
    currentRows,
    lastObservedEpochMs: now,
    moves,
    selectedColsMask: 0,
    selectedRowsMask: 0,
    status: 'pulsing',
  });
}

function finishPulseAnimation(state: GameSessionState, actionId: string): GameSessionState {
  const { session } = state;
  const lastMove = session.moves.at(-1);
  if (
    session.status !== 'pulsing' ||
    !isValidIdentifier(actionId) ||
    lastMove?.actionId !== actionId
  ) {
    return state;
  }
  return replaceSession(state, {
    ...session,
    status: session.completionEvent === null ? 'selecting' : 'solved',
  });
}

function undo(state: GameSessionState, nowEpochMs: number): GameSessionState {
  const { puzzle, session } = state;
  const move = session.moves.at(-1);
  if (session.status !== 'selecting' || move === undefined) return state;
  const now = observedNow(session, nowEpochMs);
  if (now === undefined) return state;

  return replaceSession(state, {
    ...session,
    currentRows: Object.freeze(
      applyPulse(session.currentRows, puzzle.size, move.rowMask, move.colMask),
    ),
    lastObservedEpochMs: now,
    moves: Object.freeze(session.moves.slice(0, -1)),
    selectedColsMask: 0,
    selectedRowsMask: 0,
    undoCount: session.undoCount + 1,
  });
}

function recordHintUse(state: GameSessionState, level: 1 | 2 | 3): GameSessionState {
  const { session } = state;
  if (
    (session.status !== 'ready' && session.status !== 'selecting') ||
    (level !== 1 && level !== 2 && level !== 3) ||
    level <= session.hintLevelUsed
  ) {
    return state;
  }
  return replaceSession(state, { ...session, hintLevelUsed: level as HintLevel });
}

function tickTimer(state: GameSessionState, nowEpochMs: number): GameSessionState {
  const { session } = state;
  if (
    (session.status !== 'selecting' && session.status !== 'pulsing') ||
    session.startedAtEpochMs === null ||
    session.activeSinceEpochMs === null ||
    session.hiddenAtEpochMs !== null ||
    session.lastObservedEpochMs === null ||
    !isValidEpochMs(nowEpochMs) ||
    nowEpochMs <= session.lastObservedEpochMs
  ) {
    return state;
  }

  return replaceSession(state, {
    ...session,
    lastObservedEpochMs: nowEpochMs,
  });
}

function changeVisibility(
  state: GameSessionState,
  hidden: boolean,
  nowEpochMs: number,
): GameSessionState {
  const { session } = state;
  if (hidden) {
    if (
      session.status !== 'ready' &&
      session.status !== 'selecting' &&
      session.status !== 'pulsing'
    ) {
      return state;
    }
    const now = observedNow(session, nowEpochMs);
    if (now === undefined) return state;
    return replaceSession(state, {
      ...session,
      activeElapsedMs: closeActiveSegment(session, now),
      activeSinceEpochMs: null,
      hiddenAtEpochMs: now,
      lastObservedEpochMs: now,
      status: 'paused',
    });
  }

  if (session.status !== 'paused' || session.hiddenAtEpochMs === null) return state;
  const now = observedNow(session, nowEpochMs);
  if (now === undefined) return state;
  const completed = session.completionEvent !== null;
  return replaceSession(state, {
    ...session,
    activeSinceEpochMs: session.startedAtEpochMs !== null && !completed ? now : null,
    hiddenAtEpochMs: null,
    lastObservedEpochMs: now,
    status: completed ? 'solved' : session.startedAtEpochMs === null ? 'ready' : 'selecting',
  });
}

export function gameSessionReducer(
  state: GameSessionState,
  action: GameSessionAction,
): GameSessionState {
  switch (action.type) {
    case 'TOGGLE_ROW':
      return toggleAxis(state, 'row', action.index, action.nowEpochMs);
    case 'TOGGLE_COL':
      return toggleAxis(state, 'column', action.index, action.nowEpochMs);
    case 'PULSE_COMMIT':
      return commitPulse(state, action.actionId, action.nowEpochMs);
    case 'PULSE_ANIMATION_FINISHED':
      return finishPulseAnimation(state, action.actionId);
    case 'UNDO':
      return undo(state, action.nowEpochMs);
    case 'RESET_CONFIRMED': {
      if (
        state.session.status === 'pulsing' ||
        !isValidIdentifier(action.sessionId) ||
        action.sessionId === state.session.sessionId
      ) {
        return state;
      }
      return Object.freeze({
        puzzle: state.puzzle,
        session: createGameSession(state.puzzle, action.sessionId),
      });
    }
    case 'USE_HINT':
      return recordHintUse(state, action.level);
    case 'TIMER_TICK':
      return tickTimer(state, action.nowEpochMs);
    case 'VISIBILITY_CHANGED':
      return changeVisibility(state, action.hidden, action.nowEpochMs);
    case 'SESSION_ERROR':
      return state.session.status === 'ready'
        ? replaceSession(state, { ...state.session, status: 'error' })
        : state;
    case 'SESSION_RECOVER':
      return state.session.status === 'error'
        ? replaceSession(state, { ...state.session, status: 'ready' })
        : state;
    default:
      return state;
  }
}
