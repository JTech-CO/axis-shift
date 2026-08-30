import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { GameStatusViewModel, GameUiPhase } from '../../components/game';
import {
  createGameSessionState,
  gameSessionReducer,
  selectHint,
  type PuzzleDefinition,
  type GameSession,
} from '../../domain';
import type { Clock } from '../../services/clock';
import { createUniqueIdGenerator } from '../../services/id';
import {
  createMemoryStorageAdapter,
  createStorageRepository,
  type StorageRepository,
} from '../../services/storage';
import { presentGameSession, type GameSessionCopy } from './presenter';
import {
  createBrowserGameSessionRuntime,
  createGameSessionRuntime,
  type GameSessionRuntime,
  type VisibilityPort,
} from './runtime';
import {
  useGameSessionController,
  type GameSessionController,
} from './use-game-session-controller';

const LAB_PUZZLE: PuzzleDefinition = Object.freeze({
  canonicalSolution: Object.freeze([{ colMask: 1, rowMask: 1 }]),
  complexityScore: 3,
  difficulty: 'easy',
  generatorVersion: 'v1',
  id: 'lab-controller-fixture',
  initialRows: Object.freeze([0, 0, 0]),
  mode: 'lab',
  optimalPulseCount: 1,
  schemaVersion: 1,
  size: 3,
  tags: Object.freeze(['sparse'] as const),
  targetRows: Object.freeze([1, 0, 0]),
});

const TUTORIAL_PUZZLE: PuzzleDefinition = Object.freeze({
  ...LAB_PUZZLE,
  id: 'tutorial-controller-fixture',
  mode: 'tutorial',
  tags: Object.freeze(['sparse', 'tutorial'] as const),
  tutorialStepIds: Object.freeze(['tutorial.execute-pulse'] as const),
});

const PHASE_TONES: Readonly<Record<GameUiPhase, GameStatusViewModel['tone']>> = Object.freeze({
  disabled: 'neutral',
  error: 'error',
  idle: 'neutral',
  paused: 'neutral',
  preview: 'ready',
  pulsing: 'active',
  selected: 'active',
  solved: 'success',
});

const COPY = Object.freeze({
  affectedCellsLabel: (count) => `${String(count)} affected`,
  axisAccessibleLabel: (axis, label, selected) =>
    `${axis} ${label} ${selected ? 'selected' : 'not selected'}`,
  cellAccessibleLabel: ({ columnIndex, kind, preview, rowIndex, targetValue, value }) =>
    `${kind} ${String(rowIndex)} ${String(columnIndex)} ${String(value)} ${String(targetValue)} ${preview}`,
  disabledReason: (phase) =>
    phase === 'paused' ? 'paused' : phase === 'error' ? 'error' : undefined,
  error: Object.freeze({
    description: 'recover safely',
    heading: 'error',
    recoverLabel: 'recover',
  }),
  eyebrow: (puzzle) => puzzle.mode,
  formatElapsed: (activeElapsedMs) => `${String(activeElapsedMs)}ms`,
  gridLabel: (kind, puzzle) => `${kind} ${puzzle.id}`,
  gridSummary: (kind, size, onCellCount) => `${kind} ${String(size)} ${String(onCellCount)}`,
  hintDescription: (hint) => (hint === undefined ? 'no hint' : `hint ${String(hint.level)}`),
  puzzleTitle: (puzzle) => puzzle.id,
  pulseStatus: ({ enabled, phase }) => (enabled ? 'ready' : `blocked ${phase}`),
  resultHeading: () => 'aligned',
  resultHintSummary: (level) => `hint level ${String(level)}`,
  status: (phase, activeElapsedText) => ({
    detail: activeElapsedText,
    eyebrow: phase,
    message: phase,
    tone: PHASE_TONES[phase],
  }),
  uiLabels: Object.freeze({
    cancel: 'cancel',
    columnAxis: 'columns',
    confirmReset: 'reset',
    hint: 'hint',
    hintDescription: 'hint description',
    hintHeading: 'hint heading',
    pulse: 'PULSE',
    pulseBlocked: 'blocked',
    pulseReady: 'ready',
    reset: 'reset',
    resetDescription: 'reset description',
    resetHeading: 'reset heading',
    resultAligned: 'aligned',
    resultGrade: 'grade',
    resultPar: 'par',
    resultPulse: 'pulse',
    resultTime: 'time',
    resultUndo: 'undo',
    rowAxis: 'rows',
    target: 'target',
    undo: 'undo',
  }),
} satisfies GameSessionCopy);

class MutableClock implements Clock {
  value = 1_000;

  nowEpochMs(): number {
    return this.value;
  }
}

class MutableVisibility implements VisibilityPort {
  hidden = false;
  private readonly listeners = new Set<(hidden: boolean) => void>();

  isHidden(): boolean {
    return this.hidden;
  }

  subscribe(listener: (hidden: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(hidden: boolean): void {
    this.hidden = hidden;
    for (const listener of this.listeners) listener(hidden);
  }
}

interface RuntimeHarness {
  readonly clock: MutableClock;
  readonly repository: StorageRepository;
  readonly runtime: GameSessionRuntime;
  readonly visibility: MutableVisibility;
}

function runtimeHarness(
  puzzle: PuzzleDefinition,
  repositoryOverride?: (repository: StorageRepository) => StorageRepository,
): RuntimeHarness {
  const clock = new MutableClock();
  const visibility = new MutableVisibility();
  let id = 0;
  const idGenerator = createUniqueIdGenerator((scope) => `${scope}-${String(++id)}`);
  const storage = createMemoryStorageAdapter();
  const baseRepository = createStorageRepository({
    resolvePuzzle: (idToResolve) => (idToResolve === puzzle.id ? puzzle : undefined),
    storage,
  });
  const repository = repositoryOverride?.(baseRepository) ?? baseRepository;
  const runtime = createGameSessionRuntime({ clock, idGenerator, repository, visibility });
  return { clock, repository, runtime, visibility };
}

function solveCurrentPuzzle(
  controller: { readonly current: GameSessionController },
  clock: MutableClock,
): void {
  act(() => controller.current.callbacks.onToggleRow(0));
  clock.value = 1_100;
  act(() => controller.current.callbacks.onToggleColumn(0));
  clock.value = 1_250;
  act(() => {
    controller.current.callbacks.onPulse();
    controller.current.callbacks.onPulse();
  });
}

afterEach(() => {
  vi.useRealTimers();
});

describe('game-session runtime and presenter', () => {
  it('creates scoped crypto IDs and wires browser storage and visibility adapters', () => {
    let uuid = 0;
    const listeners = new Set<() => void>();
    const visibilitySource = {
      visibilityState: 'visible',
      addEventListener: (_type: 'visibilitychange', listener: () => void) =>
        listeners.add(listener),
      removeEventListener: (_type: 'visibilitychange', listener: () => void) =>
        listeners.delete(listener),
    };
    const runtime = createBrowserGameSessionRuntime({
      cryptoSource: {
        getRandomValues: (array) => array,
        randomUUID: () => `uuid-${String(++uuid)}`,
      },
      storage: createMemoryStorageAdapter(),
      visibilitySource,
    });

    expect(runtime.idGenerator.nextId('session')).toBe('session-uuid-1');
    expect(runtime.idGenerator.nextId('pulse')).toBe('pulse-uuid-2');
    expect(runtime.loadAppState()).toMatchObject({
      tutorialCompleted: false,
      resumableSession: null,
    });
    expect(runtime.visibility.isHidden()).toBe(false);
    const listener = vi.fn();
    const unsubscribe = runtime.visibility.subscribe(listener);
    visibilitySource.visibilityState = 'hidden';
    for (const notify of listeners) notify();
    expect(listener).toHaveBeenCalledWith(true);
    unsubscribe();
    expect(listeners.size).toBe(0);
  });

  it('maps a live domain selection into the M05 view model without test fixtures', () => {
    let state = createGameSessionState(LAB_PUZZLE, 'presenter-session');
    state = gameSessionReducer(state, { index: 0, nowEpochMs: 1_000, type: 'TOGGLE_ROW' });
    state = gameSessionReducer(state, { index: 0, nowEpochMs: 1_050, type: 'TOGGLE_COL' });
    const presentation = presentGameSession(state, COPY, 1_100);

    expect(presentation.view.phase).toBe('preview');
    expect(presentation.view.controls.affectedCellCount).toBe(1);
    expect(presentation.view.rows[0]).toMatchObject({ selected: true, hinted: false });
    expect(presentation.view.columns[0]).toMatchObject({ selected: true, hinted: false });
    expect(presentation.view.board.cells[0]).toMatchObject({ preview: 'turn-on', value: 0 });
    expect(presentation.activeElapsedMs).toBe(100);
  });
});

describe('useGameSessionController', () => {
  it('cycles Hint 1→2→3 and makes Hint 3 select the exact canonical next axes', () => {
    const harness = runtimeHarness(LAB_PUZZLE);
    const { result } = renderHook(() =>
      useGameSessionController({ copy: COPY, puzzle: LAB_PUZZLE, runtime: harness.runtime }),
    );

    act(() => result.current.callbacks.onHint());
    expect(result.current.state.session.hintLevelUsed).toBe(1);
    act(() => result.current.callbacks.onHint());
    expect(result.current.state.session.hintLevelUsed).toBe(2);
    const expected = selectHint(result.current.state, 3);
    expect(expected?.level).toBe(3);
    act(() => result.current.callbacks.onHint());

    expect(result.current.state.session.hintLevelUsed).toBe(3);
    expect(result.current.state.session.selectedRowsMask).toBe(
      expected?.level === 3 ? expected.pulse.rowMask : -1,
    );
    expect(result.current.state.session.selectedColsMask).toBe(
      expected?.level === 3 ? expected.pulse.colMask : -1,
    );
    expect(result.current.presentation.view.rows[0]?.hinted).toBe(true);
    expect(result.current.presentation.view.columns[0]?.hinted).toBe(true);
  });

  it('wires PULSE animation, Undo, and Reset into fresh attempts', () => {
    const harness = runtimeHarness(LAB_PUZZLE);
    const { result } = renderHook(() =>
      useGameSessionController({ copy: COPY, puzzle: LAB_PUZZLE, runtime: harness.runtime }),
    );

    act(() => result.current.callbacks.onToggleRow(0));
    act(() => result.current.callbacks.onToggleColumn(1));
    harness.clock.value = 1_250;
    act(() => result.current.callbacks.onPulse());
    const token = result.current.state.session.moves[0]?.actionId ?? '';
    act(() => result.current.callbacks.onPulseVisualComplete(token));

    expect(result.current.state.session).toMatchObject({
      currentRows: [2, 0, 0],
      status: 'selecting',
    });
    harness.clock.value = 1_500;
    act(() => result.current.callbacks.onUndo());
    expect(result.current.state.session).toMatchObject({
      currentRows: [0, 0, 0],
      moves: [],
      undoCount: 1,
    });

    const priorSessionId = result.current.state.session.sessionId;
    act(() => result.current.callbacks.onResetConfirmed());
    expect(result.current.state.session).toMatchObject({
      completionEvent: null,
      moves: [],
      status: 'ready',
      undoCount: 0,
    });
    expect(result.current.state.session.sessionId).not.toBe(priorSessionId);
  });

  it('falls back to a fresh session when persisted hydration fails', () => {
    const harness = runtimeHarness(LAB_PUZZLE);
    const runtime: GameSessionRuntime = {
      ...harness.runtime,
      loadAppState: () => {
        throw new Error('invalid persisted state');
      },
    };
    const { result } = renderHook(() =>
      useGameSessionController({ copy: COPY, puzzle: LAB_PUZZLE, runtime }),
    );

    expect(result.current.state.session.status).toBe('ready');
    expect(result.current.persistenceWarning).toBe('load-failed');
  });
  it('commits one rapid PULSE, saves a Lab best once, then clears the session', async () => {
    let saveProgressCount = 0;
    let allowTransitionClear = true;
    const savedSessions: (GameSession | null)[] = [];
    const harness = runtimeHarness(LAB_PUZZLE, (base) => ({
      ...base,
      saveProgress: (progress) => {
        saveProgressCount += 1;
        return base.saveProgress(progress);
      },
      saveSession: (session) => {
        savedSessions.push(session);
        if (session === null && !allowTransitionClear) return false;
        return base.saveSession(session);
      },
    }));
    const { result } = renderHook(() =>
      useGameSessionController({ copy: COPY, puzzle: LAB_PUZZLE, runtime: harness.runtime }),
    );

    solveCurrentPuzzle(result, harness.clock);
    expect(result.current.state.session.moves).toHaveLength(1);
    const token = result.current.state.session.moves[0]?.actionId ?? '';
    act(() => result.current.callbacks.onPulseVisualComplete(token));

    await waitFor(() => expect(result.current.progress.labRecords[LAB_PUZZLE.id]).toBeDefined());
    expect(result.current.state.session.status).toBe('solved');
    expect(result.current.progress.labRecords[LAB_PUZZLE.id]).toMatchObject({
      bestElapsedMs: 250,
      bestGrade: 'S',
      bestPulseCount: 1,
      completed: true,
    });
    expect(saveProgressCount).toBe(1);
    expect(savedSessions).toContain(null);
    expect(result.current.persistenceWarning).toBeNull();

    allowTransitionClear = false;
    let transitioned = true;
    act(() => {
      transitioned = result.current.clearSessionForTransition();
    });
    expect(transitioned).toBe(false);
    expect(result.current.persistenceWarning).toBe('session-save-failed');

    allowTransitionClear = true;
    act(() => result.current.retryPersistence());
    await waitFor(() => expect(result.current.persistenceWarning).toBeNull());
  });

  it('does not clear a solved session when Lab progress persistence fails', async () => {
    const saveProgress = vi.fn(() => false);
    const saveSession = vi.fn((session: GameSession | null) => {
      void session;
      return true;
    });
    const harness = runtimeHarness(LAB_PUZZLE, (base) => ({
      ...base,
      saveProgress,
      saveSession,
    }));
    const { result } = renderHook(() =>
      useGameSessionController({ copy: COPY, puzzle: LAB_PUZZLE, runtime: harness.runtime }),
    );

    solveCurrentPuzzle(result, harness.clock);
    await waitFor(() => expect(result.current.persistenceWarning).toBe('progress-save-failed'));

    expect(saveProgress).toHaveBeenCalledTimes(1);
    expect(saveSession.mock.calls.some(([session]) => session === null)).toBe(false);
    expect(result.current.progress.labRecords[LAB_PUZZLE.id]).toBeUndefined();

    let transitioned = true;
    act(() => {
      transitioned = result.current.clearSessionForTransition();
    });
    expect(transitioned).toBe(false);
    expect(saveSession.mock.calls.some(([session]) => session === null)).toBe(false);
  });

  it('marks Tutorial completion only for the configured final step', async () => {
    const harness = runtimeHarness(TUTORIAL_PUZZLE);
    const { result } = renderHook(() =>
      useGameSessionController({
        completeTutorialOnSolve: true,
        copy: COPY,
        puzzle: TUTORIAL_PUZZLE,
        runtime: harness.runtime,
      }),
    );

    solveCurrentPuzzle(result, harness.clock);
    await waitFor(() => expect(result.current.progress.tutorialCompleted).toBe(true));
    expect(harness.repository.loadProgress().tutorialCompleted).toBe(true);
  });

  it('resumes the same paused puzzle at the injected current time and reserves its ID', () => {
    const harness = runtimeHarness(LAB_PUZZLE);
    let persisted = createGameSessionState(LAB_PUZZLE, 'persisted-session');
    persisted = gameSessionReducer(persisted, {
      index: 0,
      nowEpochMs: 1_000,
      type: 'TOGGLE_ROW',
    });
    persisted = gameSessionReducer(persisted, {
      hidden: true,
      nowEpochMs: 1_500,
      type: 'VISIBILITY_CHANGED',
    });
    expect(harness.repository.saveSession(persisted.session)).toBe(true);
    harness.clock.value = 5_000;

    const { result } = renderHook(() =>
      useGameSessionController({ copy: COPY, puzzle: LAB_PUZZLE, runtime: harness.runtime }),
    );

    expect(result.current.state.session).toMatchObject({
      activeElapsedMs: 500,
      activeSinceEpochMs: 5_000,
      selectedRowsMask: 1,
      sessionId: 'persisted-session',
      status: 'selecting',
    });
    expect(result.current.runtime.idGenerator.hasIssued('persisted-session')).toBe(true);
  });

  it('excludes hidden time and continues ticking after visibility resumes', () => {
    vi.useFakeTimers();
    const harness = runtimeHarness(LAB_PUZZLE);
    const { result } = renderHook(() =>
      useGameSessionController({
        copy: COPY,
        puzzle: LAB_PUZZLE,
        runtime: harness.runtime,
        tickIntervalMs: 100,
      }),
    );

    act(() => result.current.callbacks.onToggleRow(0));
    harness.clock.value = 1_500;
    act(() => harness.visibility.emit(true));
    expect(result.current.state.session).toMatchObject({ activeElapsedMs: 500, status: 'paused' });

    harness.clock.value = 5_000;
    act(() => harness.visibility.emit(false));
    harness.clock.value = 5_300;
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.presentation.activeElapsedMs).toBe(800);
  });
});
