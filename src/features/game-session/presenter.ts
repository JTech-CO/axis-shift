import type {
  CellPreview,
  GameErrorViewModel,
  GameStatusViewModel,
  GameUiLabels,
  GameUiPhase,
  GameUiViewModel,
  TensorGridViewModel,
} from '../../components/game';
import {
  calculateSignalGrade,
  readCell,
  selectActiveElapsedMs,
  selectCanPulse,
  selectCanUndo,
  selectHint,
  type GameSessionState,
  type PuzzleDefinition,
  type SessionHint,
} from '../../domain';

export type GameGridKind = 'board' | 'target';

export interface GameCellLabelInput {
  readonly columnIndex: number;
  readonly kind: GameGridKind;
  readonly preview: CellPreview;
  readonly rowIndex: number;
  readonly targetValue: 0 | 1;
  readonly value: 0 | 1;
}

export interface PulseStatusInput {
  readonly disabledReason?: string;
  readonly enabled: boolean;
  readonly phase: GameUiPhase;
}

export interface GameSessionCopy {
  readonly affectedCellsLabel: (count: number) => string;
  readonly axisAccessibleLabel: (
    axis: 'column' | 'row',
    label: string,
    selected: boolean,
  ) => string;
  readonly cellAccessibleLabel: (input: GameCellLabelInput) => string;
  readonly disabledReason: (phase: GameUiPhase) => string | undefined;
  readonly error: GameErrorViewModel;
  readonly eyebrow: (puzzle: PuzzleDefinition) => string;
  readonly formatElapsed: (activeElapsedMs: number) => string;
  readonly gridLabel: (kind: GameGridKind, puzzle: PuzzleDefinition) => string;
  readonly gridSummary: (kind: GameGridKind, size: number, onCellCount: number) => string;
  readonly hintDescription: (hint: SessionHint | undefined) => string;
  readonly puzzleTitle: (puzzle: PuzzleDefinition) => string;
  readonly pulseStatus: (input: PulseStatusInput) => string;
  readonly resultHeading: (puzzle: PuzzleDefinition) => string;
  readonly resultHintSummary: (hintLevelUsed: 0 | 1 | 2 | 3) => string;
  readonly status: (phase: GameUiPhase, activeElapsedText: string) => GameStatusViewModel;
  readonly uiLabels: GameUiLabels;
}

export interface GameSessionPresentation {
  readonly activeElapsedMs: number;
  readonly activeElapsedText: string;
  readonly hint: SessionHint | undefined;
  readonly view: GameUiViewModel;
}

function popCount(mask: number): number {
  let count = 0;
  let remaining = mask;
  while (remaining !== 0) {
    count += remaining & 1;
    remaining >>>= 1;
  }
  return count;
}

export function gameUiPhase(state: GameSessionState): GameUiPhase {
  const { session } = state;
  if (session.status === 'ready') return 'idle';
  if (session.status === 'pulsing') return 'pulsing';
  if (session.status === 'paused') return 'paused';
  if (session.status === 'solved') return 'solved';
  if (session.status === 'error') return 'error';
  if (session.selectedRowsMask !== 0 && session.selectedColsMask !== 0) return 'preview';
  if (session.selectedRowsMask !== 0 || session.selectedColsMask !== 0) return 'selected';
  return 'idle';
}

function cellPreview(
  state: GameSessionState,
  rowIndex: number,
  columnIndex: number,
  value: 0 | 1,
): CellPreview {
  const selected =
    (state.session.selectedRowsMask & (1 << rowIndex)) !== 0 &&
    (state.session.selectedColsMask & (1 << columnIndex)) !== 0;
  if (!selected) return 'none';
  return value === 0 ? 'turn-on' : 'turn-off';
}

function createGrid(
  state: GameSessionState,
  kind: GameGridKind,
  phase: GameUiPhase,
  copy: GameSessionCopy,
): TensorGridViewModel {
  const { puzzle, session } = state;
  const targetOnly = kind === 'target';
  const sourceRows = targetOnly ? puzzle.targetRows : session.currentRows;
  const lastMove = session.moves.at(-1);
  let onCellCount = 0;

  const cells = Object.freeze(
    Array.from({ length: puzzle.size * puzzle.size }, (_, flatIndex) => {
      const rowIndex = Math.floor(flatIndex / puzzle.size);
      const columnIndex = flatIndex % puzzle.size;
      const value = readCell(sourceRows, puzzle.size, rowIndex, columnIndex);
      const targetValue = readCell(puzzle.targetRows, puzzle.size, rowIndex, columnIndex);
      if (value === 1) onCellCount += 1;
      const preview = targetOnly ? 'none' : cellPreview(state, rowIndex, columnIndex, value);
      const pulseActive =
        !targetOnly &&
        phase === 'pulsing' &&
        lastMove !== undefined &&
        (lastMove.rowMask & (1 << rowIndex)) !== 0 &&
        (lastMove.colMask & (1 << columnIndex)) !== 0;

      return Object.freeze({
        accessibleLabel: copy.cellAccessibleLabel({
          columnIndex,
          kind,
          preview,
          rowIndex,
          targetValue,
          value,
        }),
        columnIndex,
        id: `${puzzle.id}:${kind}:${String(rowIndex)}:${String(columnIndex)}`,
        preview,
        pulseActive,
        rowIndex,
        targetValue,
        value,
      });
    }),
  );

  return Object.freeze({
    cells,
    label: copy.gridLabel(kind, puzzle),
    size: puzzle.size,
    summary: copy.gridSummary(kind, puzzle.size, onCellCount),
  });
}

function hintedMask(hint: SessionHint | undefined, axis: 'column' | 'row'): number {
  if (hint?.level === 2) return axis === 'row' ? hint.rowMask : 0;
  if (hint?.level === 3) return axis === 'row' ? hint.pulse.rowMask : hint.pulse.colMask;
  return 0;
}

export function presentGameSession(
  state: GameSessionState,
  copy: GameSessionCopy,
  nowEpochMs: number,
): GameSessionPresentation {
  const { puzzle, session } = state;
  const phase = gameUiPhase(state);
  const axesEnabled = session.status === 'ready' || session.status === 'selecting';
  const pulseEnabled = selectCanPulse(state);
  const affectedCellCount = popCount(session.selectedRowsMask) * popCount(session.selectedColsMask);
  const activeElapsedMs = selectActiveElapsedMs(state, nowEpochMs);
  const activeElapsedText = copy.formatElapsed(activeElapsedMs);
  const hint = session.hintLevelUsed === 0 ? undefined : selectHint(state, session.hintLevelUsed);
  const disabledReason = copy.disabledReason(phase);

  const axisItems = (axis: 'column' | 'row') => {
    const mask = axis === 'row' ? session.selectedRowsMask : session.selectedColsMask;
    const suggestedMask = hintedMask(hint, axis);
    return Object.freeze(
      Array.from({ length: puzzle.size }, (_, index) => {
        const selected = (mask & (1 << index)) !== 0;
        const label = axis === 'row' ? String.fromCharCode(65 + index) : String(index + 1);
        return Object.freeze({
          accessibleLabel: copy.axisAccessibleLabel(axis, label, selected),
          disabled: !axesEnabled,
          hinted: (suggestedMask & (1 << index)) !== 0,
          index,
          label,
          selected,
        });
      }),
    );
  };

  const completion = session.completionEvent;
  const result =
    phase === 'solved' && completion !== null
      ? Object.freeze({
          activeElapsedText: copy.formatElapsed(completion.activeElapsedMs),
          grade: calculateSignalGrade({
            hintLevelUsed: completion.hintLevelUsed,
            optimalPulseCount: puzzle.optimalPulseCount,
            usedPulseCount: completion.pulseCount,
          }),
          heading: copy.resultHeading(puzzle),
          hintSummary: copy.resultHintSummary(completion.hintLevelUsed),
          optimalPulseCount: puzzle.optimalPulseCount,
          pulseCount: completion.pulseCount,
          undoCount: session.undoCount,
        })
      : undefined;

  const uiLabels = Object.freeze({
    ...copy.uiLabels,
    hintDescription: copy.hintDescription(hint),
  });

  return Object.freeze({
    activeElapsedMs,
    activeElapsedText,
    hint,
    view: Object.freeze({
      board: createGrid(state, 'board', phase, copy),
      columns: axisItems('column'),
      controls: Object.freeze({
        affectedCellCount,
        affectedCellsLabel: copy.affectedCellsLabel(affectedCellCount),
        axesEnabled,
        disabledReason,
        hintEnabled: axesEnabled && session.hintLevelUsed < 3,
        pulseEnabled,
        pulseLocked: session.status === 'pulsing' || !axesEnabled,
        pulseStatusLabel: copy.pulseStatus({ disabledReason, enabled: pulseEnabled, phase }),
        resetEnabled: session.status !== 'pulsing' && session.status !== 'error',
        undoEnabled: selectCanUndo(state),
      }),
      error: phase === 'error' ? copy.error : undefined,
      eyebrow: copy.eyebrow(puzzle),
      labels: uiLabels,
      phase,
      pulseToken: phase === 'pulsing' ? session.moves.at(-1)?.actionId : undefined,
      puzzleId: puzzle.id,
      result,
      rows: axisItems('row'),
      status: copy.status(phase, activeElapsedText),
      target: createGrid(state, 'target', phase, copy),
      title: copy.puzzleTitle(puzzle),
    }),
  });
}
