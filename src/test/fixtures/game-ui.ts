import {
  applyPulses,
  calculateSignalGrade,
  createGameSessionState,
  gameSessionReducer,
  readCell,
  selectCanPulse,
  selectCanUndo,
  type EncodedPulse,
  type GameSessionAction,
  type GameSessionState,
  type PuzzleDefinition,
} from '../../domain';
import type {
  CellPreview,
  GameUiCallbacks,
  GameUiPhase,
  GameUiViewModel,
  TensorGridViewModel,
} from '../../components/game';

export const UI_FIXTURE_NAMES = [
  'idle',
  'selected',
  'preview',
  'pulsing',
  'paused',
  'solved',
  'error',
  'disabled',
] as const;

export type UiFixtureName = (typeof UI_FIXTURE_NAMES)[number];

const INITIAL_ROWS = Object.freeze([0b010101, 0b001010, 0b111000, 0b100001, 0b010110, 0b101001]);

const SOLUTION_PULSES: readonly EncodedPulse[] = Object.freeze([
  Object.freeze({ rowMask: 0b001011, colMask: 0b010101 }),
  Object.freeze({ rowMask: 0b110100, colMask: 0b101010 }),
  Object.freeze({ rowMask: 0b100001, colMask: 0b111100 }),
]);

const MAIN_PUZZLE: PuzzleDefinition = Object.freeze({
  canonicalSolution: SOLUTION_PULSES,
  complexityScore: 86,
  difficulty: 'hard',
  generatorVersion: 'fixture-v1',
  id: 'm05-hard-6x6',
  initialRows: INITIAL_ROWS,
  mode: 'lab',
  optimalPulseCount: 3,
  schemaVersion: 1,
  size: 6,
  tags: Object.freeze(['dense', 'overlap', 'asymmetric'] as const),
  targetRows: Object.freeze(applyPulses(INITIAL_ROWS, 6, SOLUTION_PULSES)),
});

const SOLVED_PULSE: EncodedPulse = Object.freeze({
  rowMask: 0b001011,
  colMask: 0b100101,
});

const SOLVED_PUZZLE: PuzzleDefinition = Object.freeze({
  canonicalSolution: Object.freeze([SOLVED_PULSE]),
  complexityScore: 34,
  difficulty: 'easy',
  generatorVersion: 'fixture-v1',
  id: 'm05-solved-6x6',
  initialRows: Object.freeze([0b000001, 0b000010, 0b000100, 0b001000, 0b010000, 0b100000]),
  mode: 'lab',
  optimalPulseCount: 1,
  schemaVersion: 1,
  size: 6,
  tags: Object.freeze(['sparse', 'symmetric'] as const),
  targetRows: Object.freeze(
    applyPulses([0b000001, 0b000010, 0b000100, 0b001000, 0b010000, 0b100000], 6, [SOLVED_PULSE]),
  ),
});

const LABELS = Object.freeze({
  cancel: '취소',
  columnAxis: '열 축 선택',
  confirmReset: '초기화',
  hint: '힌트',
  hintDescription: '남은 신호의 구조만 단계적으로 확인합니다.',
  hintHeading: '신호 분석',
  pulse: 'PULSE',
  pulseBlocked: '행과 열을 선택하세요',
  pulseReady: '실행 준비',
  reset: '초기화',
  resetDescription: '현재 선택과 이동 기록을 지우고 처음부터 시작합니다.',
  resetHeading: '퍼즐을 초기화할까요?',
  resultAligned: '신호 정렬 완료',
  resultGrade: '등급',
  resultPar: 'PAR',
  resultPulse: 'PULSE',
  resultTime: '시간',
  resultUndo: '되돌리기',
  rowAxis: '행 축 선택',
  target: '목표 신호',
  undo: '되돌리기',
});

function reduce(
  state: GameSessionState,
  ...actions: readonly GameSessionAction[]
): GameSessionState {
  return actions.reduce(gameSessionReducer, state);
}

function selectMask(
  state: GameSessionState,
  axis: 'column' | 'row',
  mask: number,
  nowEpochMs: number,
): GameSessionState {
  let next = state;
  for (let index = 0; index < state.puzzle.size; index += 1) {
    if ((mask & (1 << index)) === 0) continue;
    next = gameSessionReducer(next, {
      index,
      nowEpochMs,
      type: axis === 'row' ? 'TOGGLE_ROW' : 'TOGGLE_COL',
    });
  }
  return next;
}

function mainState(name: UiFixtureName): GameSessionState {
  const ready = createGameSessionState(MAIN_PUZZLE, 'fixture-session-main');
  if (name === 'idle') return ready;
  if (name === 'error') return reduce(ready, { type: 'SESSION_ERROR' });

  const selected = reduce(ready, { index: 0, nowEpochMs: 1_000, type: 'TOGGLE_ROW' });
  if (name === 'selected') return selected;

  const preview = reduce(
    selected,
    { index: 2, nowEpochMs: 1_100, type: 'TOGGLE_ROW' },
    { index: 0, nowEpochMs: 1_200, type: 'TOGGLE_COL' },
    { index: 1, nowEpochMs: 1_300, type: 'TOGGLE_COL' },
  );
  if (name === 'preview') return preview;

  if (name === 'paused' || name === 'disabled') {
    return reduce(preview, {
      hidden: true,
      nowEpochMs: 2_200,
      type: 'VISIBILITY_CHANGED',
    });
  }

  return reduce(preview, {
    actionId: 'fixture-pulse-001',
    nowEpochMs: 2_200,
    type: 'PULSE_COMMIT',
  });
}

function solvedState(): GameSessionState {
  let state = createGameSessionState(SOLVED_PUZZLE, 'fixture-session-solved');
  state = selectMask(state, 'row', SOLVED_PULSE.rowMask, 1_000);
  state = selectMask(state, 'column', SOLVED_PULSE.colMask, 1_200);
  state = reduce(state, {
    actionId: 'fixture-pulse-solved',
    nowEpochMs: 4_800,
    type: 'PULSE_COMMIT',
  });
  return reduce(state, {
    actionId: 'fixture-pulse-solved',
    type: 'PULSE_ANIMATION_FINISHED',
  });
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

function uiPhase(state: GameSessionState, fixtureName: UiFixtureName | 'interactive'): GameUiPhase {
  if (fixtureName === 'disabled') return 'disabled';
  const { session } = state;
  if (session.status === 'ready') return 'idle';
  if (session.status === 'pulsing') return 'pulsing';
  if (session.status === 'paused') return 'paused';
  if (session.status === 'solved') return 'solved';
  if (session.status === 'error') return 'error';
  if (session.selectedRowsMask !== 0 && session.selectedColsMask !== 0) return 'preview';
  return session.selectedRowsMask !== 0 || session.selectedColsMask !== 0 ? 'selected' : 'idle';
}

function statusFor(phase: GameUiPhase) {
  switch (phase) {
    case 'idle':
      return {
        eyebrow: '선택 상태',
        message: '행과 열을 선택하세요',
        detail: '선택한 두 축의 교차점이 반전됩니다.',
        tone: 'neutral' as const,
      };
    case 'selected':
      return {
        eyebrow: '축 고정',
        message: '반대쪽 축을 선택하세요',
        detail: '선택한 축은 마름모 노드로 표시됩니다.',
        tone: 'active' as const,
      };
    case 'preview':
      return {
        eyebrow: '교차점 미리보기',
        message: 'PULSE 실행 준비',
        detail: '+는 켜짐, −는 꺼짐으로 바뀔 셀입니다.',
        tone: 'ready' as const,
      };
    case 'pulsing':
      return {
        eyebrow: '신호 전송',
        message: '축 교차점을 반전하는 중',
        detail: '중복 입력은 잠시 잠깁니다.',
        tone: 'active' as const,
      };
    case 'solved':
      return {
        eyebrow: '신호 정렬',
        message: '목표 패턴과 일치했습니다',
        tone: 'success' as const,
      };
    case 'error':
      return {
        eyebrow: '세션 오류',
        message: '보드를 복구해야 합니다',
        tone: 'error' as const,
      };
    case 'paused':
      return {
        eyebrow: '일시 정지',
        message: '탭이 다시 활성화되면 계속합니다',
        tone: 'neutral' as const,
      };
    case 'disabled':
      return {
        eyebrow: '입력 잠금',
        message: '현재 보드를 조작할 수 없습니다',
        tone: 'neutral' as const,
      };
  }
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

function makeGrid(
  state: GameSessionState,
  fixtureName: UiFixtureName | 'interactive',
  targetOnly: boolean,
): TensorGridViewModel {
  const { puzzle, session } = state;
  const phase = uiPhase(state, fixtureName);
  const lastMove = session.moves.at(-1);
  const sourceRows = targetOnly ? puzzle.targetRows : session.currentRows;
  const label = targetOnly ? '목표 신호 ' + fixtureName : '현재 신호 ' + fixtureName;
  const onCount = sourceRows.reduce((total, row) => total + popCount(row), 0);

  return Object.freeze({
    cells: Object.freeze(
      Array.from({ length: puzzle.size * puzzle.size }, (_, flatIndex) => {
        const rowIndex = Math.floor(flatIndex / puzzle.size);
        const columnIndex = flatIndex % puzzle.size;
        const value = readCell(sourceRows, puzzle.size, rowIndex, columnIndex);
        const targetValue = readCell(puzzle.targetRows, puzzle.size, rowIndex, columnIndex);
        const preview = targetOnly ? 'none' : cellPreview(state, rowIndex, columnIndex, value);
        const pulseActive =
          !targetOnly &&
          phase === 'pulsing' &&
          lastMove !== undefined &&
          (lastMove.rowMask & (1 << rowIndex)) !== 0 &&
          (lastMove.colMask & (1 << columnIndex)) !== 0;
        const previewText =
          preview === 'turn-on'
            ? ', PULSE 후 켜짐'
            : preview === 'turn-off'
              ? ', PULSE 후 꺼짐'
              : '';

        return Object.freeze({
          accessibleLabel:
            String.fromCharCode(65 + rowIndex) +
            '행 ' +
            String(columnIndex + 1) +
            '열, 현재 ' +
            (value === 1 ? '켜짐' : '꺼짐') +
            ', 목표 ' +
            (targetValue === 1 ? '켜짐' : '꺼짐') +
            previewText,
          columnIndex,
          id: label + '-' + rowIndex + '-' + columnIndex,
          preview,
          pulseActive,
          rowIndex,
          targetValue,
          value,
        });
      }),
    ),
    label,
    size: puzzle.size,
    summary: puzzle.size + '×' + puzzle.size + ' 보드, 켜진 셀 ' + onCount + '개',
  });
}

function presentGameUiState(
  state: GameSessionState,
  name: UiFixtureName | 'interactive',
): GameUiViewModel {
  const phase = uiPhase(state, name);
  const { puzzle, session } = state;
  const axesEnabled = session.status === 'ready' || session.status === 'selecting';
  const lastMove = session.moves.at(-1);
  const affectedCellCount = popCount(session.selectedRowsMask) * popCount(session.selectedColsMask);
  const disabledReason =
    phase === 'paused'
      ? '백그라운드에서 시간과 입력이 일시 정지되었습니다.'
      : phase === 'disabled'
        ? '외부 잠금이 해제될 때까지 입력할 수 없습니다.'
        : phase === 'error'
          ? '세션을 안전한 초기 상태로 복구하세요.'
          : undefined;
  const pulseEnabled = selectCanPulse(state);
  const pulseStatusLabel = pulseEnabled
    ? LABELS.pulseReady
    : (disabledReason ??
      (phase === 'pulsing'
        ? '신호 반전 중입니다.'
        : phase === 'solved'
          ? '완료된 퍼즐은 잠겨 있습니다.'
          : LABELS.pulseBlocked));

  const axisItems = (axis: 'column' | 'row') =>
    Object.freeze(
      Array.from({ length: puzzle.size }, (_, index) => {
        const selected =
          ((axis === 'row' ? session.selectedRowsMask : session.selectedColsMask) &
            (1 << index)) !==
          0;
        const label = axis === 'row' ? String.fromCharCode(65 + index) : String(index + 1);
        return Object.freeze({
          accessibleLabel:
            (axis === 'row' ? '행 ' : '열 ') + label + (selected ? ' 선택됨' : ' 선택 안 됨'),
          disabled: !axesEnabled,
          index,
          label,
          selected,
        });
      }),
    );

  const completion = session.completionEvent;
  const result =
    phase === 'solved' && completion
      ? Object.freeze({
          activeElapsedText: (completion.activeElapsedMs / 1_000).toFixed(1) + '초',
          grade: calculateSignalGrade({
            hintLevelUsed: completion.hintLevelUsed,
            optimalPulseCount: puzzle.optimalPulseCount,
            usedPulseCount: completion.pulseCount,
          }),
          heading: '패턴 일치',
          hintSummary: '힌트 없이 신호를 정렬했습니다.',
          optimalPulseCount: puzzle.optimalPulseCount,
          pulseCount: completion.pulseCount,
          undoCount: session.undoCount,
        })
      : undefined;

  return Object.freeze({
    board: makeGrid(state, name, false),
    columns: axisItems('column'),
    controls: Object.freeze({
      affectedCellCount,
      affectedCellsLabel: affectedCellCount > 0 ? affectedCellCount + '개 교차점 반전' : '',
      axesEnabled,
      disabledReason,
      hintEnabled: axesEnabled,
      pulseEnabled,
      pulseLocked: session.status === 'pulsing' || !axesEnabled,
      pulseStatusLabel,
      resetEnabled: session.status !== 'pulsing' && session.status !== 'error',
      undoEnabled: selectCanUndo(state),
    }),
    error:
      phase === 'error'
        ? Object.freeze({
            description: '마지막 안전한 보드 상태로 돌아가 다시 시작할 수 있습니다.',
            heading: '신호 연결을 복구하세요',
            recoverLabel: '안전하게 복구',
          })
        : undefined,
    eyebrow: 'M05 / DESIGN SYSTEM',
    labels: LABELS,
    phase,
    pulseToken: phase === 'pulsing' ? lastMove?.actionId : undefined,
    puzzleId: puzzle.id + '-' + name,
    result,
    rows: axisItems('row'),
    status: Object.freeze(statusFor(phase)),
    target: makeGrid(state, name, true),
    title: name === 'solved' ? 'EASY / 정렬 완료' : 'HARD / 여섯 번째 축',
  });
}

export function createGameUiFixture(name: UiFixtureName): GameUiViewModel {
  const state = name === 'solved' ? solvedState() : mainState(name);
  return presentGameUiState(state, name);
}

export function createInteractiveGameUiState(): GameSessionState {
  return createGameSessionState(MAIN_PUZZLE, 'fixture-session-interactive');
}

export function presentInteractiveGameUiState(state: GameSessionState): GameUiViewModel {
  return presentGameUiState(state, 'interactive');
}

export const GAME_UI_FIXTURES: Readonly<Record<UiFixtureName, GameUiViewModel>> = Object.freeze(
  Object.fromEntries(UI_FIXTURE_NAMES.map((name) => [name, createGameUiFixture(name)])) as Record<
    UiFixtureName,
    GameUiViewModel
  >,
);

export const NOOP_GAME_UI_CALLBACKS: GameUiCallbacks = Object.freeze({
  onHint: () => undefined,
  onPulse: () => undefined,
  onPulseVisualComplete: () => undefined,
  onRecover: () => undefined,
  onResetConfirmed: () => undefined,
  onToggleColumn: () => undefined,
  onToggleRow: () => undefined,
  onUndo: () => undefined,
});
