import {
  applyPulses,
  assertAxisMask,
  assertBoardRows,
  isCanonicalUtcIso,
  isSolved,
  type DailyRecord,
  type GameSession,
  type PuzzleBestRecord,
  type PuzzleDefinition,
  type SessionCompletionEvent,
} from '../../domain/index.ts';

export const STORAGE_SCHEMA_VERSION = 1 as const;

export const STORAGE_KEYS = Object.freeze({
  settings: 'axis-shift:settings:v1',
  progress: 'axis-shift:progress:v1',
  session: 'axis-shift:session:v1',
  generatorMap: 'axis-shift:generator-map:v1',
} as const);

export type StorageKeyKind = keyof typeof STORAGE_KEYS;
export type PrimaryStorageKey = (typeof STORAGE_KEYS)[StorageKeyKind];

export interface UserSettings {
  readonly schemaVersion: 1;
  readonly locale: 'ko' | 'en';
  readonly theme: 'dark' | 'light' | 'system';
  readonly soundEnabled: boolean;
  readonly soundVolume: number;
  readonly hapticsEnabled: boolean;
  readonly reducedMotion: 'system' | 'on' | 'off';
  readonly highContrastCells: boolean;
  readonly showKeyboardHints: boolean;
}

export interface SprintBestRecord {
  readonly score: number;
  readonly solvedCount: number;
  readonly sGradeCount: number;
  readonly achievedAt: string;
}

export interface ProgressEnvelopeV1 {
  readonly schemaVersion: 1;
  readonly tutorialCompleted: boolean;
  readonly labRecords: Readonly<Record<string, PuzzleBestRecord>>;
  readonly dailyRecords: Readonly<Record<string, DailyRecord>>;
  readonly sprintBest: SprintBestRecord | null;
}

export interface SessionEnvelopeV1 {
  readonly schemaVersion: 1;
  readonly resumableSession: GameSession | null;
}

export interface GeneratorScheduleEntry {
  readonly effectiveFrom: string;
  readonly version: string;
}

export interface GeneratorMapSnapshotV1 {
  readonly schemaVersion: 1;
  readonly defaultVersion: string;
  readonly schedule: readonly GeneratorScheduleEntry[];
}

export interface PersistedAppState extends ProgressEnvelopeV1 {
  readonly resumableSession: GameSession | null;
}

export interface SchemaNormalization<T> {
  readonly issues: readonly string[];
  readonly valid: boolean;
  readonly value: T;
}

export type PuzzleResolver = (puzzleId: string) => PuzzleDefinition | undefined;

type JsonObject = Record<string, unknown>;

const SETTINGS_FIELDS = [
  'hapticsEnabled',
  'highContrastCells',
  'locale',
  'reducedMotion',
  'schemaVersion',
  'showKeyboardHints',
  'soundEnabled',
  'soundVolume',
  'theme',
] as const;
const PROGRESS_FIELDS = [
  'dailyRecords',
  'labRecords',
  'schemaVersion',
  'sprintBest',
  'tutorialCompleted',
] as const;
const SESSION_ENVELOPE_FIELDS = ['resumableSession', 'schemaVersion'] as const;
const SESSION_FIELDS = [
  'acceptedPulseActionIds',
  'activeElapsedMs',
  'activeSinceEpochMs',
  'completedAtEpochMs',
  'completionEvent',
  'currentRows',
  'hiddenAtEpochMs',
  'hintLevelUsed',
  'lastObservedEpochMs',
  'moves',
  'puzzleId',
  'selectedColsMask',
  'selectedRowsMask',
  'sessionId',
  'startedAtEpochMs',
  'status',
  'undoCount',
] as const;
const MOVE_FIELDS = ['actionId', 'appliedAtMs', 'colMask', 'rowMask'] as const;
const COMPLETION_FIELDS = [
  'activeElapsedMs',
  'completedAtEpochMs',
  'eventId',
  'hintLevelUsed',
  'pulseCount',
  'puzzleId',
  'sessionId',
] as const;
const BEST_RECORD_FIELDS = [
  'bestElapsedMs',
  'bestGrade',
  'bestPulseCount',
  'completed',
  'firstCompletedAt',
  'lastCompletedAt',
  'puzzleId',
] as const;
const DAILY_RECORD_FIELDS = [...BEST_RECORD_FIELDS, 'dateUtc', 'sharedCount'] as const;
const SPRINT_FIELDS = ['achievedAt', 'sGradeCount', 'score', 'solvedCount'] as const;

export const DEFAULT_USER_SETTINGS: UserSettings = Object.freeze({
  schemaVersion: 1,
  locale: 'ko',
  theme: 'dark',
  soundEnabled: true,
  soundVolume: 0.7,
  hapticsEnabled: true,
  reducedMotion: 'system',
  highContrastCells: false,
  showKeyboardHints: true,
});

export const DEFAULT_PROGRESS: ProgressEnvelopeV1 = Object.freeze({
  schemaVersion: 1,
  tutorialCompleted: false,
  labRecords: Object.freeze({}),
  dailyRecords: Object.freeze({}),
  sprintBest: null,
});

export const DEFAULT_GENERATOR_MAP_SNAPSHOT: GeneratorMapSnapshotV1 = Object.freeze({
  schemaVersion: 1,
  defaultVersion: 'v1',
  schedule: Object.freeze([{ effectiveFrom: '2026-01-01', version: 'v1' }]),
});

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactFields(value: JsonObject, fields: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...fields].sort();
  return (
    actual.length === expected.length && actual.every((field, index) => field === expected[index])
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.trim() === value;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isPositiveSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function isNullableNonNegativeSafeInteger(value: unknown): value is number | null {
  return value === null || isNonNegativeSafeInteger(value);
}

function isUtcDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function cloneSettings(settings: UserSettings): UserSettings {
  return { ...settings };
}

export function normalizeSettings(
  value: unknown,
  fallback: UserSettings = DEFAULT_USER_SETTINGS,
): SchemaNormalization<UserSettings> {
  const issues: string[] = [];
  if (!isObject(value) || !hasExactFields(value, SETTINGS_FIELDS)) {
    issues.push('settings-fields');
    return { issues, valid: false, value: cloneSettings(fallback) };
  }
  if (
    value.schemaVersion !== 1 ||
    !['ko', 'en'].includes(value.locale as string) ||
    !['system', 'dark', 'light', 'high-contrast'].includes(value.theme as string) ||
    typeof value.soundEnabled !== 'boolean' ||
    typeof value.soundVolume !== 'number' ||
    !Number.isFinite(value.soundVolume) ||
    value.soundVolume < 0 ||
    value.soundVolume > 1 ||
    typeof value.hapticsEnabled !== 'boolean' ||
    !['system', 'on', 'off'].includes(value.reducedMotion as string) ||
    typeof value.highContrastCells !== 'boolean' ||
    typeof value.showKeyboardHints !== 'boolean'
  ) {
    issues.push('settings-values');
    return { issues, valid: false, value: cloneSettings(fallback) };
  }
  const legacyHighContrastTheme = value.theme === 'high-contrast';
  if (legacyHighContrastTheme) issues.push('settings-theme-high-contrast');

  return {
    issues,
    valid: true,
    value: {
      schemaVersion: 1,
      locale: value.locale as UserSettings['locale'],
      theme: legacyHighContrastTheme ? 'dark' : (value.theme as UserSettings['theme']),
      soundEnabled: value.soundEnabled,
      soundVolume: value.soundVolume,
      hapticsEnabled: value.hapticsEnabled,
      reducedMotion: value.reducedMotion as UserSettings['reducedMotion'],
      highContrastCells: value.highContrastCells,
      showKeyboardHints: value.showKeyboardHints,
    },
  };
}

function normalizeBestRecord(
  value: unknown,
  expectedPuzzleId?: string,
): PuzzleBestRecord | undefined {
  if (!isObject(value) || !hasExactFields(value, BEST_RECORD_FIELDS)) return undefined;
  if (
    !isNonEmptyString(value.puzzleId) ||
    (expectedPuzzleId !== undefined && value.puzzleId !== expectedPuzzleId)
  ) {
    return undefined;
  }
  if (typeof value.completed !== 'boolean') return undefined;
  const gradeValid =
    value.bestGrade === null || ['S', 'A', 'B', 'C'].includes(value.bestGrade as string);
  const pulseValid = value.bestPulseCount === null || isPositiveSafeInteger(value.bestPulseCount);
  const elapsedValid =
    value.bestElapsedMs === null || isNonNegativeSafeInteger(value.bestElapsedMs);
  const firstValid = value.firstCompletedAt === null || isCanonicalUtcIso(value.firstCompletedAt);
  const lastValid = value.lastCompletedAt === null || isCanonicalUtcIso(value.lastCompletedAt);
  if (!gradeValid || !pulseValid || !elapsedValid || !firstValid || !lastValid) return undefined;
  const valuesAreComplete =
    value.bestGrade !== null &&
    value.bestPulseCount !== null &&
    value.bestElapsedMs !== null &&
    value.firstCompletedAt !== null &&
    value.lastCompletedAt !== null;
  const valuesAreEmpty =
    value.bestGrade === null &&
    value.bestPulseCount === null &&
    value.bestElapsedMs === null &&
    value.firstCompletedAt === null &&
    value.lastCompletedAt === null;
  if ((value.completed && !valuesAreComplete) || (!value.completed && !valuesAreEmpty))
    return undefined;
  const firstCompletedAt = value.firstCompletedAt as string | null;
  const lastCompletedAt = value.lastCompletedAt as string | null;
  if (firstCompletedAt !== null && lastCompletedAt !== null && firstCompletedAt > lastCompletedAt) {
    return undefined;
  }
  return {
    puzzleId: value.puzzleId,
    completed: value.completed,
    bestGrade: value.bestGrade as PuzzleBestRecord['bestGrade'],
    bestPulseCount: value.bestPulseCount as number | null,
    bestElapsedMs: value.bestElapsedMs as number | null,
    firstCompletedAt: value.firstCompletedAt as string | null,
    lastCompletedAt: value.lastCompletedAt as string | null,
  };
}

function normalizeDailyRecord(value: unknown, expectedDate: string): DailyRecord | undefined {
  if (!isObject(value) || !hasExactFields(value, DAILY_RECORD_FIELDS)) return undefined;
  const base = normalizeBestRecord(
    Object.fromEntries(BEST_RECORD_FIELDS.map((field) => [field, value[field]])),
  );
  if (
    !base ||
    !isUtcDate(value.dateUtc) ||
    value.dateUtc !== expectedDate ||
    !isNonNegativeInteger(value.sharedCount)
  ) {
    return undefined;
  }
  return { ...base, dateUtc: value.dateUtc, sharedCount: value.sharedCount } as DailyRecord;
}

function normalizeSprintBest(value: unknown): SprintBestRecord | null | undefined {
  if (value === null) return null;
  if (!isObject(value) || !hasExactFields(value, SPRINT_FIELDS)) return undefined;
  if (
    !isNonNegativeInteger(value.score) ||
    !isNonNegativeInteger(value.solvedCount) ||
    !isNonNegativeInteger(value.sGradeCount) ||
    value.sGradeCount > value.solvedCount ||
    !isCanonicalUtcIso(value.achievedAt)
  ) {
    return undefined;
  }
  return {
    score: value.score,
    solvedCount: value.solvedCount,
    sGradeCount: value.sGradeCount,
    achievedAt: value.achievedAt,
  };
}

export function normalizeProgress(value: unknown): SchemaNormalization<ProgressEnvelopeV1> {
  const issues: string[] = [];
  const record = isObject(value) ? value : {};
  if (!isObject(value) || !hasExactFields(record, PROGRESS_FIELDS)) issues.push('progress-fields');
  if (record.schemaVersion !== 1) issues.push('progress-version');

  const labRecords: Record<string, PuzzleBestRecord> = Object.create(null) as Record<
    string,
    PuzzleBestRecord
  >;
  if (isObject(record.labRecords)) {
    for (const [puzzleId, candidate] of Object.entries(record.labRecords)) {
      const normalized = normalizeBestRecord(candidate, puzzleId);
      if (normalized) labRecords[puzzleId] = normalized;
      else issues.push(`lab-record:${puzzleId}`);
    }
  } else {
    issues.push('lab-records');
  }

  const dailyRecords: Record<string, DailyRecord> = {};
  if (isObject(record.dailyRecords)) {
    for (const [dateUtc, candidate] of Object.entries(record.dailyRecords)) {
      const normalized = normalizeDailyRecord(candidate, dateUtc);
      if (normalized) dailyRecords[dateUtc] = normalized;
      else issues.push(`daily-record:${dateUtc}`);
    }
  } else {
    issues.push('daily-records');
  }

  const sprintBest = normalizeSprintBest(record.sprintBest);
  if (sprintBest === undefined) issues.push('sprint-best');
  if (typeof record.tutorialCompleted !== 'boolean') issues.push('tutorial-completed');

  return {
    issues,
    valid: issues.length === 0,
    value: {
      schemaVersion: 1,
      tutorialCompleted:
        typeof record.tutorialCompleted === 'boolean' ? record.tutorialCompleted : false,
      labRecords,
      dailyRecords,
      sprintBest: sprintBest ?? null,
    },
  };
}

function normalizeCompletionEvent(
  value: unknown,
  sessionId: string,
  puzzleId: string,
): SessionCompletionEvent | null | undefined {
  if (value === null) return null;
  if (!isObject(value) || !hasExactFields(value, COMPLETION_FIELDS)) return undefined;
  if (
    value.eventId !== `${sessionId}:completed` ||
    value.sessionId !== sessionId ||
    value.puzzleId !== puzzleId ||
    !isPositiveSafeInteger(value.pulseCount) ||
    !isNonNegativeSafeInteger(value.activeElapsedMs) ||
    ![0, 1, 2, 3].includes(value.hintLevelUsed as number) ||
    !isNonNegativeSafeInteger(value.completedAtEpochMs)
  ) {
    return undefined;
  }
  return value as unknown as SessionCompletionEvent;
}

function normalizeGameSession(
  value: unknown,
  resolvePuzzle: PuzzleResolver,
): SchemaNormalization<GameSession | null> {
  const issues: string[] = [];
  if (!isObject(value) || !hasExactFields(value, SESSION_FIELDS)) {
    return { issues: ['session-fields'], valid: false, value: null };
  }
  if (!isNonEmptyString(value.sessionId) || !isNonEmptyString(value.puzzleId)) {
    return { issues: ['session-identity'], valid: false, value: null };
  }
  let puzzle: PuzzleDefinition | undefined;
  try {
    puzzle = resolvePuzzle(value.puzzleId);
  } catch {
    return { issues: ['session-puzzle'], valid: false, value: null };
  }
  if (!puzzle) return { issues: ['session-puzzle'], valid: false, value: null };

  let persistedBoardSolved: boolean;
  try {
    assertBoardRows(value.currentRows, puzzle.size, 'session.currentRows');
    assertAxisMask(value.selectedRowsMask, puzzle.size, 'row');
    assertAxisMask(value.selectedColsMask, puzzle.size, 'column');
    persistedBoardSolved = isSolved(value.currentRows, puzzle.targetRows, puzzle.size);
  } catch {
    return { issues: ['session-board'], valid: false, value: null };
  }
  const currentRows = value.currentRows as number[];

  if (
    !['ready', 'selecting', 'pulsing', 'paused', 'solved', 'error'].includes(
      value.status as string,
    ) ||
    !Array.isArray(value.moves) ||
    !Array.isArray(value.acceptedPulseActionIds) ||
    !isNullableNonNegativeSafeInteger(value.startedAtEpochMs) ||
    !isNonNegativeSafeInteger(value.activeElapsedMs) ||
    !isNullableNonNegativeSafeInteger(value.activeSinceEpochMs) ||
    !isNullableNonNegativeSafeInteger(value.lastObservedEpochMs) ||
    !isNullableNonNegativeSafeInteger(value.hiddenAtEpochMs) ||
    ![0, 1, 2, 3].includes(value.hintLevelUsed as number) ||
    !isNonNegativeInteger(value.undoCount) ||
    !isNullableNonNegativeSafeInteger(value.completedAtEpochMs)
  ) {
    return { issues: ['session-values'], valid: false, value: null };
  }

  const status = value.status as GameSession['status'];
  const startedAtEpochMs = value.startedAtEpochMs as number | null;
  const lastObservedEpochMs = value.lastObservedEpochMs as number | null;
  const activeSinceEpochMs = value.activeSinceEpochMs as number | null;
  const hiddenAtEpochMs = value.hiddenAtEpochMs as number | null;
  if (startedAtEpochMs === null) {
    const hasValidReadyClock =
      status === 'ready' && activeSinceEpochMs === null && hiddenAtEpochMs === null;
    const hasValidPausedClock =
      status === 'paused' &&
      activeSinceEpochMs === null &&
      lastObservedEpochMs !== null &&
      hiddenAtEpochMs === lastObservedEpochMs;
    if (
      (!hasValidReadyClock && !hasValidPausedClock) ||
      value.moves.length !== 0 ||
      value.acceptedPulseActionIds.length !== 0 ||
      value.selectedRowsMask !== 0 ||
      value.selectedColsMask !== 0 ||
      value.activeElapsedMs !== 0 ||
      value.undoCount !== 0
    ) {
      return { issues: ['session-before-start'], valid: false, value: null };
    }
  } else {
    if (status === 'ready' || lastObservedEpochMs === null) {
      return { issues: ['session-started-state'], valid: false, value: null };
    }
    if (status === 'paused') {
      if (
        activeSinceEpochMs !== null ||
        hiddenAtEpochMs === null ||
        hiddenAtEpochMs !== lastObservedEpochMs
      ) {
        return { issues: ['session-paused-clock'], valid: false, value: null };
      }
    } else if (hiddenAtEpochMs !== null) {
      return { issues: ['session-visible-clock'], valid: false, value: null };
    }
    if (
      status === 'pulsing' &&
      (value.selectedRowsMask !== 0 || value.selectedColsMask !== 0 || value.moves.length === 0)
    ) {
      return { issues: ['session-pulsing-state'], valid: false, value: null };
    }
    if (
      !persistedBoardSolved &&
      (status === 'selecting' || status === 'pulsing') &&
      activeSinceEpochMs === null
    ) {
      return { issues: ['session-active-segment'], valid: false, value: null };
    }
  }

  const acceptedPulseActionIds: string[] = [];
  const accepted = new Set<string>();
  for (const actionId of value.acceptedPulseActionIds) {
    if (!isNonEmptyString(actionId) || accepted.has(actionId)) {
      return { issues: ['session-action-ledger'], valid: false, value: null };
    }
    accepted.add(actionId);
    acceptedPulseActionIds.push(actionId);
  }

  if (value.undoCount > acceptedPulseActionIds.length) {
    return { issues: ['session-undo-count'], valid: false, value: null };
  }

  const moves: { actionId: string; rowMask: number; colMask: number; appliedAtMs: number }[] = [];
  let priorAppliedAt = -1;
  let priorLedgerIndex = -1;
  const moveActionIds = new Set<string>();
  for (const moveValue of value.moves) {
    if (!isObject(moveValue) || !hasExactFields(moveValue, MOVE_FIELDS)) {
      return { issues: ['session-move'], valid: false, value: null };
    }
    try {
      assertAxisMask(moveValue.rowMask, puzzle.size, 'row');
      assertAxisMask(moveValue.colMask, puzzle.size, 'column');
    } catch {
      return { issues: ['session-move-mask'], valid: false, value: null };
    }
    const ledgerIndex = acceptedPulseActionIds.indexOf(moveValue.actionId as string);
    if (
      !isNonEmptyString(moveValue.actionId) ||
      !accepted.has(moveValue.actionId) ||
      moveActionIds.has(moveValue.actionId) ||
      ledgerIndex <= priorLedgerIndex ||
      moveValue.rowMask === 0 ||
      moveValue.colMask === 0 ||
      !isNonNegativeSafeInteger(moveValue.appliedAtMs) ||
      moveValue.appliedAtMs < priorAppliedAt
    ) {
      return { issues: ['session-move-values'], valid: false, value: null };
    }
    priorAppliedAt = moveValue.appliedAtMs;
    priorLedgerIndex = ledgerIndex;
    moveActionIds.add(moveValue.actionId);
    moves.push({
      actionId: moveValue.actionId,
      rowMask: moveValue.rowMask,
      colMask: moveValue.colMask,
      appliedAtMs: moveValue.appliedAtMs,
    });
  }

  if (acceptedPulseActionIds.length !== moves.length + value.undoCount) {
    return { issues: ['session-action-ledger'], valid: false, value: null };
  }

  if (startedAtEpochMs !== null) {
    if (
      lastObservedEpochMs === null ||
      lastObservedEpochMs < startedAtEpochMs ||
      value.activeElapsedMs > lastObservedEpochMs - startedAtEpochMs ||
      (activeSinceEpochMs !== null &&
        (activeSinceEpochMs < startedAtEpochMs || activeSinceEpochMs > lastObservedEpochMs)) ||
      (hiddenAtEpochMs !== null &&
        (hiddenAtEpochMs < startedAtEpochMs || hiddenAtEpochMs > lastObservedEpochMs)) ||
      moves.some(
        (move) => move.appliedAtMs < startedAtEpochMs || move.appliedAtMs > lastObservedEpochMs,
      )
    ) {
      return { issues: ['session-clock-order'], valid: false, value: null };
    }
  }

  let normalizedActiveElapsedMs = value.activeElapsedMs;
  if (activeSinceEpochMs !== null && lastObservedEpochMs !== null) {
    const openSegmentMs = lastObservedEpochMs - activeSinceEpochMs;
    if (normalizedActiveElapsedMs > Number.MAX_SAFE_INTEGER - openSegmentMs) {
      return { issues: ['session-clock-overflow'], valid: false, value: null };
    }
    normalizedActiveElapsedMs += openSegmentMs;
  }
  if (
    startedAtEpochMs !== null &&
    lastObservedEpochMs !== null &&
    normalizedActiveElapsedMs > lastObservedEpochMs - startedAtEpochMs
  ) {
    return { issues: ['session-clock-order'], valid: false, value: null };
  }

  let replayedRows: number[];
  try {
    replayedRows = applyPulses(puzzle.initialRows, puzzle.size, moves);
  } catch {
    return { issues: ['session-replay'], valid: false, value: null };
  }
  if (replayedRows.some((row, index) => row !== currentRows[index])) {
    return { issues: ['session-replay-mismatch'], valid: false, value: null };
  }

  const completionEvent = normalizeCompletionEvent(
    value.completionEvent,
    value.sessionId,
    value.puzzleId,
  );
  if (completionEvent === undefined) {
    return { issues: ['session-completion'], valid: false, value: null };
  }
  const solved = persistedBoardSolved;
  if (solved) {
    if (status !== 'solved' && status !== 'pulsing' && status !== 'paused') {
      return { issues: ['session-solved-status'], valid: false, value: null };
    }
    if (
      value.completedAtEpochMs === null ||
      completionEvent === null ||
      completionEvent.completedAtEpochMs !== value.completedAtEpochMs ||
      completionEvent.pulseCount !== moves.length ||
      completionEvent.activeElapsedMs !== value.activeElapsedMs ||
      completionEvent.hintLevelUsed !== value.hintLevelUsed ||
      startedAtEpochMs === null ||
      lastObservedEpochMs === null ||
      value.completedAtEpochMs < startedAtEpochMs ||
      value.completedAtEpochMs > lastObservedEpochMs ||
      activeSinceEpochMs !== null ||
      moves.some((move) => move.appliedAtMs > (value.completedAtEpochMs as number))
    ) {
      return { issues: ['session-solved-completion'], valid: false, value: null };
    }
    return { issues, valid: true, value: null };
  }
  if (status === 'solved' || value.completedAtEpochMs !== null || completionEvent !== null) {
    return { issues: ['session-unsolved-completion'], valid: false, value: null };
  }
  if (status === 'error') {
    return { issues: ['session-error-status'], valid: false, value: null };
  }

  const normalizedStatus: GameSession['status'] = startedAtEpochMs === null ? 'ready' : 'paused';
  const normalized: GameSession = {
    sessionId: value.sessionId,
    puzzleId: value.puzzleId,
    status: normalizedStatus,
    currentRows: [...currentRows],
    selectedRowsMask: value.selectedRowsMask,
    selectedColsMask: value.selectedColsMask,
    moves,
    acceptedPulseActionIds,
    startedAtEpochMs,
    activeElapsedMs: normalizedActiveElapsedMs,
    activeSinceEpochMs: null,
    lastObservedEpochMs: startedAtEpochMs === null ? null : lastObservedEpochMs,
    hiddenAtEpochMs: startedAtEpochMs === null ? null : (lastObservedEpochMs ?? startedAtEpochMs),
    hintLevelUsed: value.hintLevelUsed as GameSession['hintLevelUsed'],
    undoCount: value.undoCount,
    completedAtEpochMs: null,
    completionEvent: null,
  };
  return { issues, valid: true, value: normalized };
}

export function normalizeSessionEnvelope(
  value: unknown,
  resolvePuzzle: PuzzleResolver,
): SchemaNormalization<SessionEnvelopeV1> {
  if (!isObject(value) || !hasExactFields(value, SESSION_ENVELOPE_FIELDS)) {
    return {
      issues: ['session-envelope-fields'],
      valid: false,
      value: { schemaVersion: 1, resumableSession: null },
    };
  }
  if (value.schemaVersion !== 1) {
    return {
      issues: ['session-envelope-version'],
      valid: false,
      value: { schemaVersion: 1, resumableSession: null },
    };
  }
  if (value.resumableSession === null) {
    return { issues: [], valid: true, value: { schemaVersion: 1, resumableSession: null } };
  }
  const normalized = normalizeGameSession(value.resumableSession, resolvePuzzle);
  return {
    issues: normalized.issues,
    valid: normalized.valid,
    value: { schemaVersion: 1, resumableSession: normalized.value },
  };
}

export function normalizeGeneratorMapSnapshot(
  value: unknown,
  fallback: GeneratorMapSnapshotV1 = DEFAULT_GENERATOR_MAP_SNAPSHOT,
): SchemaNormalization<GeneratorMapSnapshotV1> {
  const fields = ['defaultVersion', 'schedule', 'schemaVersion'] as const;
  if (!isObject(value) || !hasExactFields(value, fields)) {
    return { issues: ['generator-map-fields'], valid: false, value: fallback };
  }
  if (
    value.schemaVersion !== 1 ||
    !isNonEmptyString(value.defaultVersion) ||
    !/^v[1-9]\d*$/u.test(value.defaultVersion) ||
    !Array.isArray(value.schedule) ||
    value.schedule.length === 0
  ) {
    return { issues: ['generator-map-values'], valid: false, value: fallback };
  }
  const schedule: GeneratorScheduleEntry[] = [];
  let previousDate = '';
  for (const entryValue of value.schedule) {
    if (
      !isObject(entryValue) ||
      !hasExactFields(entryValue, ['effectiveFrom', 'version']) ||
      !isUtcDate(entryValue.effectiveFrom) ||
      !isNonEmptyString(entryValue.version) ||
      !/^v[1-9]\d*$/u.test(entryValue.version) ||
      (previousDate !== '' && entryValue.effectiveFrom <= previousDate)
    ) {
      return { issues: ['generator-map-schedule'], valid: false, value: fallback };
    }
    previousDate = entryValue.effectiveFrom;
    schedule.push({ effectiveFrom: entryValue.effectiveFrom, version: entryValue.version });
  }
  if (!schedule.some((entry) => entry.version === value.defaultVersion)) {
    return { issues: ['generator-map-default'], valid: false, value: fallback };
  }
  if (schedule.at(-1)?.version !== value.defaultVersion) {
    return { issues: ['generator-map-latest'], valid: false, value: fallback };
  }
  return {
    issues: [],
    valid: true,
    value: { schemaVersion: 1, defaultVersion: value.defaultVersion, schedule },
  };
}

export function composePersistedAppState(
  progress: ProgressEnvelopeV1,
  session: SessionEnvelopeV1,
): PersistedAppState {
  return {
    ...progress,
    resumableSession: session.resumableSession,
  };
}

export function splitPersistedAppState(state: PersistedAppState): {
  readonly progress: ProgressEnvelopeV1;
  readonly session: SessionEnvelopeV1;
} {
  return {
    progress: {
      schemaVersion: 1,
      tutorialCompleted: state.tutorialCompleted,
      labRecords: state.labRecords,
      dailyRecords: state.dailyRecords,
      sprintBest: state.sprintBest,
    },
    session: { schemaVersion: 1, resumableSession: state.resumableSession },
  };
}

export function schemaVersionOf(value: unknown): number | undefined {
  if (!isObject(value) || !Number.isSafeInteger(value.schemaVersion)) return undefined;
  return value.schemaVersion as number;
}
