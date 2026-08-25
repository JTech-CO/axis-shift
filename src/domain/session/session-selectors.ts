import type { EncodedPulse } from '../types.ts';
import { factorizeGF2, rankGF2 } from '../algebra/index.ts';
import { differenceRows } from '../board/index.ts';
import type { GameSessionState } from './session.ts';

export interface DepthHint {
  readonly level: 1;
  readonly remainingPulseCount: number;
}

export interface AxisHint {
  readonly level: 2;
  readonly rowMask: number;
}

export interface PulseHint {
  readonly level: 3;
  readonly pulse: EncodedPulse;
}

export type SessionHint = DepthHint | AxisHint | PulseHint;

function isValidEpochMs(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

export function selectCanPulse(state: GameSessionState): boolean {
  const { session } = state;
  return (
    session.status === 'selecting' &&
    session.selectedRowsMask !== 0 &&
    session.selectedColsMask !== 0
  );
}

export function selectCanUndo(state: GameSessionState): boolean {
  return state.session.status === 'selecting' && state.session.moves.length > 0;
}

export function selectPulseCount(state: GameSessionState): number {
  return state.session.moves.length;
}

export function selectRemainingRows(state: GameSessionState): number[] {
  return differenceRows(state.session.currentRows, state.puzzle.targetRows, state.puzzle.size);
}

export function selectRemainingRank(state: GameSessionState): number {
  return rankGF2(selectRemainingRows(state), state.puzzle.size);
}

export function selectNextCanonicalPulse(state: GameSessionState): EncodedPulse | undefined {
  const pulse = factorizeGF2(selectRemainingRows(state), state.puzzle.size)[0];
  return pulse === undefined ? undefined : Object.freeze({ ...pulse });
}

export function selectHint(state: GameSessionState, level: 1 | 2 | 3): SessionHint | undefined {
  if (level === 1) {
    return Object.freeze({ level, remainingPulseCount: selectRemainingRank(state) });
  }

  const pulse = selectNextCanonicalPulse(state);
  if (pulse === undefined) return undefined;
  if (level === 2) return Object.freeze({ level, rowMask: pulse.rowMask });
  return Object.freeze({ level, pulse });
}

export function selectActiveElapsedMs(state: GameSessionState, nowEpochMs: number): number {
  const { session } = state;
  if (
    session.startedAtEpochMs === null ||
    session.activeSinceEpochMs === null ||
    session.completedAtEpochMs !== null ||
    !isValidEpochMs(nowEpochMs)
  ) {
    return session.activeElapsedMs;
  }

  const observedNow = Math.max(session.lastObservedEpochMs ?? nowEpochMs, nowEpochMs);
  return session.activeElapsedMs + Math.max(0, observedNow - session.activeSinceEpochMs);
}

export function selectIsPersistableStatus(state: GameSessionState): boolean {
  return state.session.status !== 'error';
}
