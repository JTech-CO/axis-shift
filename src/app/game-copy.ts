import type { PuzzleDefinition, SessionHint } from '../domain';
import type {
  GameCellLabelInput,
  GameSessionCopy,
  PulseStatusInput,
} from '../features/game-session';
import { DEFAULT_LOCALE, t, type Locale, type MessageKey } from '../i18n';
type GameUiPhase = Parameters<GameSessionCopy['disabledReason']>[0];
type GameStatus = ReturnType<GameSessionCopy['status']>;

const STATUS_KEY_BY_PHASE = Object.freeze({
  disabled: 'disabled',
  error: 'error',
  idle: 'idle',
  paused: 'paused',
  preview: 'preview',
  pulsing: 'pulsing',
  selected: 'selected',
  solved: 'solved',
} satisfies Readonly<Record<GameUiPhase, string>>);

function message(key: string, locale: Locale): string {
  return t(key as MessageKey, locale);
}

function formatAxisMask(mask: number, axis: 'column' | 'row'): string {
  const labels: string[] = [];
  for (let index = 0; index < 8; index += 1) {
    if ((mask & (1 << index)) === 0) continue;
    labels.push(axis === 'row' ? String.fromCharCode(65 + index) : String(index + 1));
  }
  return labels.join(', ');
}

function hintDescription(hint: SessionHint | undefined, locale: Locale): string {
  if (hint === undefined) return t('hint.description', locale);
  if (hint.level === 1) {
    return `${t('hint.depth.label', locale)}: ${String(hint.remainingPulseCount)}`;
  }
  if (hint.level === 2) {
    return `${t('hint.axis.label', locale)}: ${formatAxisMask(hint.rowMask, 'row')}`;
  }
  return `${t('hint.pulse.row', locale)} ${formatAxisMask(
    hint.pulse.rowMask,
    'row',
  )} · ${t('hint.pulse.column', locale)} ${formatAxisMask(hint.pulse.colMask, 'column')}`;
}

function cellLabel(input: GameCellLabelInput, locale: Locale): string {
  const row = String.fromCharCode(65 + input.rowIndex);
  const column = String(input.columnIndex + 1);
  const current = input.value === 1 ? t('game.board.on', locale) : t('game.board.off', locale);
  const target = input.targetValue === 1 ? t('game.board.on', locale) : t('game.board.off', locale);
  const preview =
    input.preview === 'turn-on'
      ? `, ${t('game.board.previewOn', locale)}`
      : input.preview === 'turn-off'
        ? `, ${t('game.board.previewOff', locale)}`
        : '';
  return `${t('game.axis.row', locale)} ${row}, ${t('game.axis.column', locale)} ${column}, ${t(
    'game.board.current',
    locale,
  )} ${current}, ${t('game.board.target', locale)} ${target}${preview}`;
}

function pulseStatus(input: PulseStatusInput, locale: Locale): string {
  if (input.enabled) return t('game.pulse.ready', locale);
  if (input.disabledReason) return input.disabledReason;
  if (input.phase === 'pulsing') return t('game.pulse.running', locale);
  if (input.phase === 'solved') return t('game.pulse.solved', locale);
  return t('game.pulse.blocked', locale);
}

function resultHintSummary(level: 0 | 1 | 2 | 3, locale: Locale): string {
  const key = ['hint.used.none', 'hint.used.depth', 'hint.used.axis', 'hint.used.pulse'][level];
  return message(key ?? 'hint.used.none', locale);
}

export function createGameSessionCopy(locale: Locale = DEFAULT_LOCALE): GameSessionCopy {
  const formatNumber = new Intl.NumberFormat(locale);
  const formatSeconds = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
    style: 'unit',
    unit: 'second',
    unitDisplay: 'short',
  });

  return Object.freeze({
    affectedCellsLabel: (count: number): string =>
      count === 0 ? '' : `${formatNumber.format(count)} ${t('game.affectedCells', locale)}`,
    axisAccessibleLabel: (axis: 'column' | 'row', label: string): string =>
      `${t(axis === 'row' ? 'game.axis.row' : 'game.axis.column', locale)} ${label}`,
    cellAccessibleLabel: (input: GameCellLabelInput): string => cellLabel(input, locale),
    disabledReason: (phase: GameUiPhase): string | undefined => {
      if (phase === 'paused' || phase === 'error' || phase === 'disabled') {
        return message(`game.status.${STATUS_KEY_BY_PHASE[phase]}.detail`, locale);
      }
      return undefined;
    },
    error: Object.freeze({
      description: t('game.error.description', locale),
      heading: t('game.error.title', locale),
      recoverLabel: t('game.error.recover', locale),
    }),
    eyebrow: (puzzle: PuzzleDefinition): string =>
      t(puzzle.mode === 'tutorial' ? 'game.eyebrow.tutorial' : 'game.eyebrow.lab', locale),
    formatElapsed: (activeElapsedMs: number): string =>
      formatSeconds.format(activeElapsedMs / 1_000),
    gridLabel: (kind: 'board' | 'target', puzzle: PuzzleDefinition): string =>
      `${t(kind === 'target' ? 'game.target' : 'game.current', locale)} · ${
        puzzle.titleKey ? message(puzzle.titleKey, locale) : puzzle.id
      }`,
    gridSummary: (kind: 'board' | 'target', size: number, onCellCount: number): string =>
      `${String(size)}×${String(size)} ${t('game.board.summary', locale)}, ${t(
        kind === 'target' ? 'game.board.target' : 'game.board.current',
        locale,
      )}: ${formatNumber.format(onCellCount)} ${t('game.board.on', locale)}`,
    hintDescription: (hint: SessionHint | undefined): string => hintDescription(hint, locale),
    puzzleTitle: (puzzle: PuzzleDefinition): string =>
      puzzle.titleKey ? message(puzzle.titleKey, locale) : puzzle.id,
    pulseStatus: (input: PulseStatusInput): string => pulseStatus(input, locale),
    resultHeading: (): string => t('result.title', locale),
    resultHintSummary: (level: 0 | 1 | 2 | 3): string => resultHintSummary(level, locale),
    status: (phase: GameUiPhase, activeElapsedText: string) => {
      const phaseKey = STATUS_KEY_BY_PHASE[phase];
      const detail = message(`game.status.${phaseKey}.detail`, locale);
      return Object.freeze({
        detail: `${detail} · ${activeElapsedText}`,
        eyebrow: message(`game.status.${phaseKey}.eyebrow`, locale),
        message: message(`game.status.${phaseKey}.message`, locale),
        tone:
          phase === 'error'
            ? 'error'
            : phase === 'solved'
              ? 'success'
              : phase === 'preview'
                ? 'ready'
                : phase === 'selected' || phase === 'pulsing'
                  ? 'active'
                  : 'neutral',
      } satisfies GameStatus);
    },
    uiLabels: Object.freeze({
      cancel: t('reset.cancel', locale),
      columnAxis: t('game.axis.column', locale),
      confirmReset: t('reset.confirm', locale),
      hint: t('hint.action', locale),
      hintDescription: t('hint.description', locale),
      hintHeading: t('hint.heading', locale),
      pulse: t('game.action.pulse', locale),
      pulseBlocked: t('game.pulse.blocked', locale),
      pulseReady: t('game.pulse.ready', locale),
      reset: t('reset.action', locale),
      resetDescription: `${t('reset.description', locale)} ${t(
        'reset.completeRecordPreserved',
        locale,
      )}`,
      resetHeading: t('reset.heading', locale),
      resultAligned: t('result.eyebrow', locale),
      resultGrade: t('result.grade', locale),
      resultPar: t('result.par', locale),
      resultPulse: t('result.pulse', locale),
      resultTime: t('result.time', locale),
      resultUndo: t('result.undo', locale),
      rowAxis: t('game.axis.row', locale),
      target: t('game.target', locale),
      undo: t('game.action.undo', locale),
    }),
  });
}
