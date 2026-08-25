import type { BoardRows, PuzzleDefinition } from '../types.ts';
import { assertPlayablePuzzlePair } from '../board/index.ts';

export type SessionStatus = 'ready' | 'selecting' | 'pulsing' | 'paused' | 'solved' | 'error';

export type HintLevel = 0 | 1 | 2 | 3;
export type RevealedHintLevel = Exclude<HintLevel, 0>;

export interface PulseMove {
  readonly actionId: string;
  readonly rowMask: number;
  readonly colMask: number;
  readonly appliedAtMs: number;
}

export interface SessionCompletionEvent {
  readonly eventId: string;
  readonly sessionId: string;
  readonly puzzleId: string;
  readonly pulseCount: number;
  readonly activeElapsedMs: number;
  readonly hintLevelUsed: HintLevel;
  readonly completedAtEpochMs: number;
}

export interface GameSession {
  readonly sessionId: string;
  readonly puzzleId: string;
  readonly status: SessionStatus;
  readonly currentRows: BoardRows;
  readonly selectedRowsMask: number;
  readonly selectedColsMask: number;
  readonly moves: readonly PulseMove[];
  readonly acceptedPulseActionIds: readonly string[];
  readonly startedAtEpochMs: number | null;
  readonly activeElapsedMs: number;
  readonly activeSinceEpochMs: number | null;
  readonly lastObservedEpochMs: number | null;
  readonly hiddenAtEpochMs: number | null;
  readonly hintLevelUsed: HintLevel;
  readonly undoCount: number;
  readonly completedAtEpochMs: number | null;
  readonly completionEvent: SessionCompletionEvent | null;
}

export interface GameSessionState {
  readonly puzzle: PuzzleDefinition;
  readonly session: GameSession;
}

function requireIdentifier(value: string, label: string): void {
  if (value.length === 0 || value.trim() !== value) {
    throw new TypeError(`${label} must be a non-empty, trimmed string.`);
  }
}

export function sessionCompletionEventId(sessionId: string): string {
  requireIdentifier(sessionId, 'sessionId');
  return `${sessionId}:completed`;
}

export function createGameSession(puzzle: PuzzleDefinition, sessionId: string): GameSession {
  requireIdentifier(puzzle.id, 'puzzle.id');
  requireIdentifier(sessionId, 'sessionId');
  assertPlayablePuzzlePair(puzzle.initialRows, puzzle.targetRows, puzzle.size);

  return Object.freeze({
    acceptedPulseActionIds: Object.freeze([]),
    activeElapsedMs: 0,
    activeSinceEpochMs: null,
    completedAtEpochMs: null,
    completionEvent: null,
    currentRows: Object.freeze([...puzzle.initialRows]),
    hiddenAtEpochMs: null,
    hintLevelUsed: 0,
    lastObservedEpochMs: null,
    moves: Object.freeze([]),
    puzzleId: puzzle.id,
    selectedColsMask: 0,
    selectedRowsMask: 0,
    sessionId,
    startedAtEpochMs: null,
    status: 'ready',
    undoCount: 0,
  });
}

export function createGameSessionState(
  puzzle: PuzzleDefinition,
  sessionId: string,
): GameSessionState {
  return Object.freeze({ puzzle, session: createGameSession(puzzle, sessionId) });
}
