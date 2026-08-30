import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import type { GameUiCallbacks } from '../../components/game';
import {
  createGameSessionState,
  gameSessionReducer,
  mergePuzzleBestRecord,
  projectCompletionRecord,
  selectCanPulse,
  selectHint,
  selectIsPersistableStatus,
  type GameSession,
  type GameSessionState,
  type PuzzleBestRecord,
  type PuzzleDefinition,
} from '../../domain';
import { epochMsToCanonicalUtcIso, readClockNow } from '../../services/clock';
import {
  DEFAULT_PROGRESS,
  type PersistedAppState,
  type ProgressEnvelopeV1,
} from '../../services/storage';
import {
  presentGameSession,
  type GameSessionCopy,
  type GameSessionPresentation,
} from './presenter';
import type { GameSessionRuntime } from './runtime';

export type GameSessionPersistenceWarning =
  | 'clock-read-failed'
  | 'completion-failed'
  | 'load-failed'
  | 'progress-save-failed'
  | 'session-save-failed'
  | null;

export interface UseGameSessionControllerOptions {
  readonly completeTutorialOnSolve?: boolean;
  readonly copy: GameSessionCopy;
  readonly puzzle: PuzzleDefinition;
  readonly runtime: GameSessionRuntime;
  readonly tickIntervalMs?: number;
}

export interface GameSessionController {
  readonly callbacks: GameUiCallbacks;
  readonly clearSessionForTransition: () => boolean;
  readonly persistenceWarning: GameSessionPersistenceWarning;
  readonly presentation: GameSessionPresentation;
  readonly progress: ProgressEnvelopeV1;
  readonly retryPersistence: () => void;
  readonly runtime: GameSessionRuntime;
  readonly state: GameSessionState;
}

interface InitialControllerState {
  readonly game: GameSessionState;
  readonly progress: ProgressEnvelopeV1;
  readonly warning: GameSessionPersistenceWarning;
}

interface SaveAttempt {
  readonly fingerprint: string;
  readonly observedAt: number | null;
}

function cloneProgress(progress: ProgressEnvelopeV1): ProgressEnvelopeV1 {
  return {
    dailyRecords: { ...progress.dailyRecords },
    labRecords: Object.assign(Object.create(null), progress.labRecords) as Readonly<
      Record<string, PuzzleBestRecord>
    >,
    schemaVersion: 1,
    sprintBest: progress.sprintBest === null ? null : { ...progress.sprintBest },
    tutorialCompleted: progress.tutorialCompleted,
  };
}

function freshSession(puzzle: PuzzleDefinition, runtime: GameSessionRuntime): GameSessionState {
  return createGameSessionState(puzzle, runtime.idGenerator.nextId('session'));
}

function readNowOrFallback(runtime: GameSessionRuntime, fallback: number): number {
  try {
    return readClockNow(runtime.clock);
  } catch {
    return fallback;
  }
}

function safelyReadVisibility(runtime: GameSessionRuntime): boolean {
  try {
    return runtime.visibility.isHidden();
  } catch {
    return false;
  }
}

function resumeMatchingSession(
  puzzle: PuzzleDefinition,
  session: GameSession | null,
  runtime: GameSessionRuntime,
): GameSessionState | undefined {
  if (
    session === null ||
    session.puzzleId !== puzzle.id ||
    (session.status !== 'paused' && session.status !== 'ready')
  ) {
    return undefined;
  }

  let state: GameSessionState = Object.freeze({ puzzle, session });
  if (session.status === 'paused' && !safelyReadVisibility(runtime)) {
    const fallback = session.lastObservedEpochMs ?? session.startedAtEpochMs ?? 0;
    state = gameSessionReducer(state, {
      hidden: false,
      nowEpochMs: readNowOrFallback(runtime, fallback),
      type: 'VISIBILITY_CHANGED',
    });
  }
  return state;
}

function initializeController(
  puzzle: PuzzleDefinition,
  runtime: GameSessionRuntime,
): InitialControllerState {
  let persisted: PersistedAppState;
  let warning: GameSessionPersistenceWarning = null;
  try {
    persisted = runtime.loadAppState();
  } catch {
    persisted = { ...cloneProgress(DEFAULT_PROGRESS), resumableSession: null };
    warning = 'load-failed';
  }

  let game = resumeMatchingSession(puzzle, persisted.resumableSession, runtime);
  if (game === undefined) game = freshSession(puzzle, runtime);

  if (game.session.status === 'ready' && safelyReadVisibility(runtime)) {
    game = gameSessionReducer(game, {
      hidden: true,
      nowEpochMs: readNowOrFallback(runtime, 0),
      type: 'VISIBILITY_CHANGED',
    });
  }

  return Object.freeze({
    game,
    progress: cloneProgress(persisted),
    warning,
  });
}

function logicalSessionFingerprint(session: GameSession): string {
  return JSON.stringify([
    session.sessionId,
    session.status,
    session.currentRows,
    session.selectedRowsMask,
    session.selectedColsMask,
    session.moves,
    session.acceptedPulseActionIds,
    session.hintLevelUsed,
    session.undoCount,
    session.completedAtEpochMs,
  ]);
}

function updateLabProgress(
  progress: ProgressEnvelopeV1,
  puzzleId: string,
  record: PuzzleBestRecord,
): ProgressEnvelopeV1 {
  const labRecords = Object.assign(Object.create(null), progress.labRecords, {
    [puzzleId]: record,
  }) as Readonly<Record<string, PuzzleBestRecord>>;
  return { ...progress, labRecords };
}

function attemptPersistence(operation: () => boolean): boolean {
  try {
    return operation();
  } catch {
    return false;
  }
}

export function useGameSessionController(
  options: UseGameSessionControllerOptions,
): GameSessionController {
  const { completeTutorialOnSolve = false, copy, puzzle, runtime } = options;
  const tickIntervalMs = Math.max(50, Math.trunc(options.tickIntervalMs ?? 250));
  const [initial] = useState(() => initializeController(puzzle, runtime));
  const [state, dispatch] = useReducer(gameSessionReducer, initial.game);
  const [progress, setProgress] = useState(initial.progress);
  const [persistenceWarning, setPersistenceWarning] = useState<GameSessionPersistenceWarning>(
    initial.warning,
  );
  const [retryRevision, setRetryRevision] = useState(0);
  const lastObservedRef = useRef(state.session.lastObservedEpochMs);
  const lastSaveAttemptRef = useRef<SaveAttempt | null>(null);
  const processedCompletionEventsRef = useRef(new Set<string>());
  const pendingSessionClearRef = useRef(new Set<string>());

  useEffect(() => {
    lastObservedRef.current = state.session.lastObservedEpochMs;
  }, [state.session.lastObservedEpochMs]);

  const controllerNow = useCallback((): number => {
    try {
      return readClockNow(runtime.clock);
    } catch {
      setPersistenceWarning('clock-read-failed');
      return lastObservedRef.current ?? 0;
    }
  }, [runtime.clock]);

  const schedulePersistenceWarning = useCallback((warning: GameSessionPersistenceWarning): void => {
    globalThis.queueMicrotask(() => setPersistenceWarning(warning));
  }, []);
  const scheduleProgressUpdate = useCallback((nextProgress: ProgressEnvelopeV1): void => {
    globalThis.queueMicrotask(() => setProgress(nextProgress));
  }, []);
  useEffect(() => {
    const completion = state.session.completionEvent;
    if (completion !== null) {
      if (processedCompletionEventsRef.current.has(completion.eventId)) {
        if (pendingSessionClearRef.current.has(completion.eventId)) {
          const cleared = attemptPersistence(() => runtime.repository.saveSession(null));
          if (cleared) {
            pendingSessionClearRef.current.delete(completion.eventId);
            schedulePersistenceWarning(null);
          } else {
            schedulePersistenceWarning('session-save-failed');
          }
        }
        return;
      }

      let nextProgress = progress;
      let mustSaveProgress = false;
      try {
        if (puzzle.mode === 'lab') {
          const candidate = projectCompletionRecord(completion, puzzle, epochMsToCanonicalUtcIso);
          const current = nextProgress.labRecords[puzzle.id] ?? null;
          const record = mergePuzzleBestRecord(current, candidate);
          nextProgress = updateLabProgress(nextProgress, puzzle.id, record);
          mustSaveProgress = true;
        } else if (
          puzzle.mode === 'tutorial' &&
          completeTutorialOnSolve &&
          !nextProgress.tutorialCompleted
        ) {
          nextProgress = { ...nextProgress, tutorialCompleted: true };
          mustSaveProgress = true;
        }
      } catch {
        schedulePersistenceWarning('completion-failed');
        return;
      }

      const progressSaved =
        !mustSaveProgress ||
        attemptPersistence(() => runtime.repository.saveProgress(nextProgress));
      if (!progressSaved) {
        schedulePersistenceWarning('progress-save-failed');
        return;
      }

      if (mustSaveProgress) {
        scheduleProgressUpdate(nextProgress);
      }
      processedCompletionEventsRef.current.add(completion.eventId);

      const sessionCleared = attemptPersistence(() => runtime.repository.saveSession(null));
      if (!sessionCleared) {
        pendingSessionClearRef.current.add(completion.eventId);
        schedulePersistenceWarning('session-save-failed');
      } else {
        schedulePersistenceWarning(null);
      }
      return;
    }

    if (!selectIsPersistableStatus(state)) return;
    const fingerprint = logicalSessionFingerprint(state.session);
    const observedAt = state.session.lastObservedEpochMs;
    const prior = lastSaveAttemptRef.current;
    const timerOnlyWithinAutosaveWindow =
      prior !== null &&
      prior.fingerprint === fingerprint &&
      prior.observedAt !== null &&
      observedAt !== null &&
      observedAt - prior.observedAt < 1_000;
    if (timerOnlyWithinAutosaveWindow) return;

    lastSaveAttemptRef.current = { fingerprint, observedAt };
    const saved = attemptPersistence(() => runtime.repository.saveSession(state.session));
    schedulePersistenceWarning(saved ? null : 'session-save-failed');
  }, [
    completeTutorialOnSolve,
    progress,
    puzzle,
    retryRevision,
    runtime.repository,
    schedulePersistenceWarning,
    scheduleProgressUpdate,
    state,
  ]);

  useEffect(() => {
    if (
      (state.session.status !== 'selecting' && state.session.status !== 'pulsing') ||
      state.session.startedAtEpochMs === null ||
      state.session.activeSinceEpochMs === null
    ) {
      return;
    }

    const timer = globalThis.setInterval(() => {
      dispatch({ nowEpochMs: controllerNow(), type: 'TIMER_TICK' });
    }, tickIntervalMs);
    return () => globalThis.clearInterval(timer);
  }, [
    controllerNow,
    state.session.activeSinceEpochMs,
    state.session.startedAtEpochMs,
    state.session.status,
    tickIntervalMs,
  ]);

  useEffect(() => {
    try {
      return runtime.visibility.subscribe((hidden) => {
        dispatch({ hidden, nowEpochMs: controllerNow(), type: 'VISIBILITY_CHANGED' });
      });
    } catch {
      schedulePersistenceWarning('clock-read-failed');
      return undefined;
    }
  }, [controllerNow, runtime.visibility, schedulePersistenceWarning]);

  const onToggleRow = useCallback(
    (index: number): void => {
      dispatch({ index, nowEpochMs: controllerNow(), type: 'TOGGLE_ROW' });
    },
    [controllerNow],
  );

  const onToggleColumn = useCallback(
    (index: number): void => {
      dispatch({ index, nowEpochMs: controllerNow(), type: 'TOGGLE_COL' });
    },
    [controllerNow],
  );

  const onPulse = useCallback((): void => {
    if (!selectCanPulse(state)) return;
    try {
      dispatch({
        actionId: runtime.idGenerator.nextId('pulse'),
        nowEpochMs: controllerNow(),
        type: 'PULSE_COMMIT',
      });
    } catch {
      setPersistenceWarning('completion-failed');
    }
  }, [controllerNow, runtime.idGenerator, state]);

  const onPulseVisualComplete = useCallback((token: string): void => {
    dispatch({ actionId: token, type: 'PULSE_ANIMATION_FINISHED' });
  }, []);

  const onUndo = useCallback((): void => {
    dispatch({ nowEpochMs: controllerNow(), type: 'UNDO' });
  }, [controllerNow]);

  const onResetConfirmed = useCallback((): void => {
    try {
      dispatch({ sessionId: runtime.idGenerator.nextId('session'), type: 'RESET_CONFIRMED' });
    } catch {
      setPersistenceWarning('completion-failed');
    }
  }, [runtime.idGenerator]);

  const onHint = useCallback((): void => {
    if (state.session.status !== 'ready' && state.session.status !== 'selecting') return;
    const nextLevel = Math.min(3, state.session.hintLevelUsed + 1) as 1 | 2 | 3;
    dispatch({ level: nextLevel, type: 'USE_HINT' });
    if (nextLevel !== 3) return;

    const hint = selectHint(state, 3);
    if (hint?.level !== 3) return;
    const nowEpochMs = controllerNow();
    const rowDifference = state.session.selectedRowsMask ^ hint.pulse.rowMask;
    const columnDifference = state.session.selectedColsMask ^ hint.pulse.colMask;
    for (let index = 0; index < puzzle.size; index += 1) {
      if ((rowDifference & (1 << index)) !== 0) {
        dispatch({ index, nowEpochMs, type: 'TOGGLE_ROW' });
      }
    }
    for (let index = 0; index < puzzle.size; index += 1) {
      if ((columnDifference & (1 << index)) !== 0) {
        dispatch({ index, nowEpochMs, type: 'TOGGLE_COL' });
      }
    }
  }, [controllerNow, puzzle.size, state]);

  const onRecover = useCallback((): void => {
    dispatch({ type: 'SESSION_RECOVER' });
    setPersistenceWarning(null);
  }, []);

  const clearSessionForTransition = useCallback((): boolean => {
    const completionId = state.session.completionEvent?.eventId;
    if (completionId !== undefined && !processedCompletionEventsRef.current.has(completionId)) {
      setPersistenceWarning((warning) => warning ?? 'completion-failed');
      return false;
    }

    const cleared = attemptPersistence(() => runtime.repository.saveSession(null));
    if (!cleared) {
      if (completionId !== undefined) pendingSessionClearRef.current.add(completionId);
      setPersistenceWarning('session-save-failed');
      return false;
    }

    if (completionId !== undefined) pendingSessionClearRef.current.delete(completionId);
    setPersistenceWarning(null);
    return true;
  }, [runtime.repository, state.session.completionEvent]);

  const retryPersistence = useCallback((): void => {
    lastSaveAttemptRef.current = null;
    setRetryRevision((revision) => revision + 1);
  }, []);

  const callbacks = useMemo<GameUiCallbacks>(
    () => ({
      onHint,
      onPulse,
      onPulseVisualComplete,
      onRecover,
      onResetConfirmed,
      onToggleColumn,
      onToggleRow,
      onUndo,
    }),
    [
      onHint,
      onPulse,
      onPulseVisualComplete,
      onRecover,
      onResetConfirmed,
      onToggleColumn,
      onToggleRow,
      onUndo,
    ],
  );

  const presentationNow =
    state.session.lastObservedEpochMs ??
    state.session.completedAtEpochMs ??
    state.session.startedAtEpochMs ??
    0;
  const presentation = useMemo(
    () => presentGameSession(state, copy, presentationNow),
    [copy, presentationNow, state],
  );

  return {
    callbacks,
    clearSessionForTransition,
    persistenceWarning,
    presentation,
    progress,
    retryPersistence,
    runtime,
    state,
  };
}
