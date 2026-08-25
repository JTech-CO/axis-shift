import type { SessionCompletionEvent } from '../session/session.ts';
import type { PuzzleDefinition } from '../types.ts';
import {
  calculateSignalGrade,
  compareSignalGrades,
  isSignalGrade,
  type SignalGrade,
} from './grade.ts';

const PROJECTED_RECORD_CANDIDATE = Symbol('projected-record-candidate');
const PROJECTED_RECORD_CANDIDATES = new WeakSet<object>();

export type CompletionTimestampFormatter = (epochMs: number) => string;

export interface PuzzleRecordCandidate {
  readonly [PROJECTED_RECORD_CANDIDATE]: true;
  readonly activeElapsedMs: number;
  readonly completedAt: string;
  readonly completedAtEpochMs: number;
  readonly eventId: string;
  readonly grade: SignalGrade;
  readonly hintLevelUsed: 0 | 1 | 2 | 3;
  readonly optimalPulseCount: number;
  readonly pulseCount: number;
  readonly puzzleId: string;
  readonly sessionId: string;
}

export interface PuzzleBestRecord {
  readonly bestElapsedMs: number | null;
  readonly bestGrade: SignalGrade | null;
  readonly bestPulseCount: number | null;
  readonly completed: boolean;
  readonly firstCompletedAt: string | null;
  readonly lastCompletedAt: string | null;
  readonly puzzleId: string;
}

export interface DailyRecord extends PuzzleBestRecord {
  readonly dateUtc: string;
  readonly sharedCount: number;
}

export interface DailyRecordCandidate extends PuzzleRecordCandidate {
  readonly dateUtc: string;
}

export type BestRecordValidationCode =
  | 'active-elapsed-invalid'
  | 'completed-at-invalid'
  | 'completion-event-invalid'
  | 'date-utc-invalid'
  | 'grade-invalid'
  | 'pulse-count-invalid'
  | 'puzzle-id-invalid'
  | 'puzzle-id-mismatch'
  | 'record-invalid'
  | 'shared-count-invalid';

export class BestRecordValidationError extends Error {
  readonly code: BestRecordValidationCode;

  constructor(code: BestRecordValidationCode, message: string) {
    super(message);
    this.name = 'BestRecordValidationError';
    this.code = code;
  }
}

const UTC_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u;
const UTC_ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/u;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  return (
    year >= 1 &&
    year <= 9999 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  );
}

export function isCanonicalUtcDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = UTC_DATE_PATTERN.exec(value);
  if (!match) return false;
  return isValidCalendarDate(Number(match[1]), Number(match[2]), Number(match[3]));
}

export function isCanonicalUtcIso(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = UTC_ISO_PATTERN.exec(value);
  if (!match) return false;
  return (
    isValidCalendarDate(Number(match[1]), Number(match[2]), Number(match[3])) &&
    Number(match[4]) <= 23 &&
    Number(match[5]) <= 59 &&
    Number(match[6]) <= 59
  );
}

function assertPuzzleId(value: unknown): asserts value is string {
  if (typeof value !== 'string' || value.length === 0 || value.trim() !== value) {
    throw new BestRecordValidationError(
      'puzzle-id-invalid',
      'puzzleId must be a non-empty string without surrounding whitespace.',
    );
  }
}

function assertNonNegativeSafeInteger(
  value: unknown,
  code: BestRecordValidationCode,
  label: string,
): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new BestRecordValidationError(code, label + ' must be a non-negative safe integer.');
  }
}

function assertPositiveSafeInteger(
  value: unknown,
  code: BestRecordValidationCode,
  label: string,
): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0) {
    throw new BestRecordValidationError(code, label + ' must be a positive safe integer.');
  }
}

function markProjected<T extends object>(
  value: T,
): T & { readonly [PROJECTED_RECORD_CANDIDATE]: true } {
  Object.defineProperty(value, PROJECTED_RECORD_CANDIDATE, { value: true });
  const projected = Object.freeze(value) as T & {
    readonly [PROJECTED_RECORD_CANDIDATE]: true;
  };
  PROJECTED_RECORD_CANDIDATES.add(projected);
  return projected;
}

function assertSessionId(value: unknown): asserts value is string {
  if (typeof value !== 'string' || value.length === 0 || value.trim() !== value) {
    throw new BestRecordValidationError(
      'completion-event-invalid',
      'sessionId must be a non-empty string without surrounding whitespace.',
    );
  }
}

function assertCandidate(candidate: PuzzleRecordCandidate): void {
  if (
    typeof candidate !== 'object' ||
    candidate === null ||
    !PROJECTED_RECORD_CANDIDATES.has(candidate) ||
    !Object.hasOwn(candidate, PROJECTED_RECORD_CANDIDATE) ||
    candidate[PROJECTED_RECORD_CANDIDATE] !== true ||
    !Object.isFrozen(candidate)
  ) {
    throw new BestRecordValidationError(
      'completion-event-invalid',
      'Record candidates must come from projectCompletionRecord().',
    );
  }
  assertPuzzleId(candidate.puzzleId);
  assertSessionId(candidate.sessionId);
  if (candidate.eventId !== `${candidate.sessionId}:completed`) {
    throw new BestRecordValidationError(
      'completion-event-invalid',
      'eventId must be derived from sessionId.',
    );
  }
  if (!isSignalGrade(candidate.grade)) {
    throw new BestRecordValidationError('grade-invalid', 'grade must be S, A, B, or C.');
  }
  assertPositiveSafeInteger(candidate.pulseCount, 'pulse-count-invalid', 'pulseCount');
  assertPositiveSafeInteger(
    candidate.optimalPulseCount,
    'pulse-count-invalid',
    'optimalPulseCount',
  );
  assertNonNegativeSafeInteger(
    candidate.activeElapsedMs,
    'active-elapsed-invalid',
    'activeElapsedMs',
  );
  assertNonNegativeSafeInteger(
    candidate.completedAtEpochMs,
    'completed-at-invalid',
    'completedAtEpochMs',
  );
  if (!isCanonicalUtcIso(candidate.completedAt)) {
    throw new BestRecordValidationError(
      'completed-at-invalid',
      'completedAt must be a canonical UTC ISO timestamp with millisecond precision.',
    );
  }
  const expectedGrade = calculateSignalGrade({
    hintLevelUsed: candidate.hintLevelUsed,
    optimalPulseCount: candidate.optimalPulseCount,
    usedPulseCount: candidate.pulseCount,
  });
  if (candidate.grade !== expectedGrade) {
    throw new BestRecordValidationError(
      'grade-invalid',
      'grade must be derived from Par, pulseCount, and hintLevelUsed.',
    );
  }
}

export function projectCompletionRecord(
  completion: SessionCompletionEvent,
  puzzle: PuzzleDefinition,
  formatTimestamp: CompletionTimestampFormatter,
): PuzzleRecordCandidate {
  assertPuzzleId(puzzle.id);
  if (completion.puzzleId !== puzzle.id) {
    throw new BestRecordValidationError(
      'puzzle-id-mismatch',
      'Completion event and puzzle IDs must match.',
    );
  }
  assertSessionId(completion.sessionId);
  if (completion.eventId !== `${completion.sessionId}:completed`) {
    throw new BestRecordValidationError(
      'completion-event-invalid',
      'Completion event ID must be derived from sessionId.',
    );
  }
  assertNonNegativeSafeInteger(
    completion.completedAtEpochMs,
    'completed-at-invalid',
    'completedAtEpochMs',
  );
  const completedAt = formatTimestamp(completion.completedAtEpochMs);
  const grade = calculateSignalGrade({
    hintLevelUsed: completion.hintLevelUsed,
    optimalPulseCount: puzzle.optimalPulseCount,
    usedPulseCount: completion.pulseCount,
  });
  const candidate = markProjected({
    activeElapsedMs: completion.activeElapsedMs,
    completedAt,
    completedAtEpochMs: completion.completedAtEpochMs,
    eventId: completion.eventId,
    grade,
    hintLevelUsed: completion.hintLevelUsed,
    optimalPulseCount: puzzle.optimalPulseCount,
    pulseCount: completion.pulseCount,
    puzzleId: completion.puzzleId,
    sessionId: completion.sessionId,
  });
  assertCandidate(candidate);
  return candidate;
}

function assertNullableCanonicalIso(value: unknown, label: string): void {
  if (value !== null && !isCanonicalUtcIso(value)) {
    throw new BestRecordValidationError(
      'record-invalid',
      label + ' must be null or a canonical UTC ISO timestamp.',
    );
  }
}

function assertRecord(record: PuzzleBestRecord): void {
  assertPuzzleId(record.puzzleId);
  assertNullableCanonicalIso(record.firstCompletedAt, 'firstCompletedAt');
  assertNullableCanonicalIso(record.lastCompletedAt, 'lastCompletedAt');

  if (!record.completed) {
    if (
      record.bestElapsedMs !== null ||
      record.bestGrade !== null ||
      record.bestPulseCount !== null ||
      record.firstCompletedAt !== null ||
      record.lastCompletedAt !== null
    ) {
      throw new BestRecordValidationError(
        'record-invalid',
        'An incomplete record cannot contain completion metrics or timestamps.',
      );
    }
    return;
  }

  if (
    !isSignalGrade(record.bestGrade) ||
    !Number.isSafeInteger(record.bestPulseCount) ||
    (record.bestPulseCount as number) <= 0 ||
    !Number.isSafeInteger(record.bestElapsedMs) ||
    (record.bestElapsedMs as number) < 0 ||
    !isCanonicalUtcIso(record.firstCompletedAt) ||
    !isCanonicalUtcIso(record.lastCompletedAt)
  ) {
    throw new BestRecordValidationError(
      'record-invalid',
      'A completed record must contain valid best metrics and canonical timestamps.',
    );
  }
  if (record.firstCompletedAt > record.lastCompletedAt) {
    throw new BestRecordValidationError(
      'record-invalid',
      'firstCompletedAt cannot be later than lastCompletedAt.',
    );
  }
}

type ComparablePuzzleResult = Pick<
  PuzzleRecordCandidate,
  'activeElapsedMs' | 'grade' | 'pulseCount'
>;

function existingResult(record: PuzzleBestRecord): ComparablePuzzleResult {
  if (
    !record.completed ||
    record.bestElapsedMs === null ||
    record.bestGrade === null ||
    record.bestPulseCount === null ||
    record.lastCompletedAt === null
  ) {
    throw new BestRecordValidationError('record-invalid', 'The record has no winning result.');
  }
  return {
    activeElapsedMs: record.bestElapsedMs,
    grade: record.bestGrade,
    pulseCount: record.bestPulseCount,
  };
}

function compareResultTuple(left: ComparablePuzzleResult, right: ComparablePuzzleResult): number {
  const gradeComparison = compareSignalGrades(left.grade, right.grade);
  if (gradeComparison !== 0) return gradeComparison;
  const pulseComparison = Math.sign(left.pulseCount - right.pulseCount);
  if (pulseComparison !== 0) return pulseComparison;
  return Math.sign(left.activeElapsedMs - right.activeElapsedMs);
}

/** Negative means left wins; positive means right wins. Completion time is not a tie-break. */
export function comparePuzzleRecordCandidates(
  left: PuzzleRecordCandidate,
  right: PuzzleRecordCandidate,
): number {
  assertCandidate(left);
  assertCandidate(right);
  return compareResultTuple(left, right);
}

export function createEmptyPuzzleBestRecord(puzzleId: string): PuzzleBestRecord {
  assertPuzzleId(puzzleId);
  return Object.freeze({
    bestElapsedMs: null,
    bestGrade: null,
    bestPulseCount: null,
    completed: false,
    firstCompletedAt: null,
    lastCompletedAt: null,
    puzzleId,
  });
}

export function createPuzzleBestRecord(candidate: PuzzleRecordCandidate): PuzzleBestRecord {
  return mergePuzzleBestRecord(null, candidate);
}

export function mergePuzzleBestRecord(
  current: PuzzleBestRecord | null,
  candidate: PuzzleRecordCandidate,
): PuzzleBestRecord {
  assertCandidate(candidate);
  if (current === null || !current.completed) {
    if (current !== null) {
      assertRecord(current);
      if (current.puzzleId !== candidate.puzzleId) {
        throw new BestRecordValidationError(
          'puzzle-id-mismatch',
          'Cannot merge results from different puzzles.',
        );
      }
    }
    return Object.freeze({
      bestElapsedMs: candidate.activeElapsedMs,
      bestGrade: candidate.grade,
      bestPulseCount: candidate.pulseCount,
      completed: true,
      firstCompletedAt: candidate.completedAt,
      lastCompletedAt: candidate.completedAt,
      puzzleId: candidate.puzzleId,
    });
  }

  assertRecord(current);
  if (current.puzzleId !== candidate.puzzleId) {
    throw new BestRecordValidationError(
      'puzzle-id-mismatch',
      'Cannot merge results from different puzzles.',
    );
  }

  const candidateWins = compareResultTuple(candidate, existingResult(current)) < 0;
  const lastCompletedAt =
    current.lastCompletedAt === null || candidate.completedAt > current.lastCompletedAt
      ? candidate.completedAt
      : current.lastCompletedAt;

  return Object.freeze({
    bestElapsedMs: candidateWins ? candidate.activeElapsedMs : current.bestElapsedMs,
    bestGrade: candidateWins ? candidate.grade : current.bestGrade,
    bestPulseCount: candidateWins ? candidate.pulseCount : current.bestPulseCount,
    completed: true,
    firstCompletedAt: current.firstCompletedAt,
    lastCompletedAt,
    puzzleId: current.puzzleId,
  });
}

export function projectDailyCompletionRecord(
  candidate: PuzzleRecordCandidate,
  dateUtc: string,
): DailyRecordCandidate {
  assertCandidate(candidate);
  if (!isCanonicalUtcDate(dateUtc)) {
    throw new BestRecordValidationError(
      'date-utc-invalid',
      'dateUtc must be a valid canonical YYYY-MM-DD UTC date.',
    );
  }
  return markProjected({
    activeElapsedMs: candidate.activeElapsedMs,
    completedAt: candidate.completedAt,
    completedAtEpochMs: candidate.completedAtEpochMs,
    dateUtc,
    eventId: candidate.eventId,
    grade: candidate.grade,
    hintLevelUsed: candidate.hintLevelUsed,
    optimalPulseCount: candidate.optimalPulseCount,
    pulseCount: candidate.pulseCount,
    puzzleId: candidate.puzzleId,
    sessionId: candidate.sessionId,
  });
}

export function createDailyRecord(candidate: DailyRecordCandidate): DailyRecord {
  return mergeDailyRecord(null, candidate);
}

export function mergeDailyRecord(
  current: DailyRecord | null,
  candidate: DailyRecordCandidate,
): DailyRecord {
  if (!isCanonicalUtcDate(candidate.dateUtc)) {
    throw new BestRecordValidationError(
      'date-utc-invalid',
      'dateUtc must be a valid canonical YYYY-MM-DD UTC date.',
    );
  }
  if (current !== null) {
    if (!isCanonicalUtcDate(current.dateUtc)) {
      throw new BestRecordValidationError('record-invalid', 'Daily record dateUtc is invalid.');
    }
    assertNonNegativeSafeInteger(current.sharedCount, 'shared-count-invalid', 'sharedCount');
    if (current.dateUtc !== candidate.dateUtc) {
      throw new BestRecordValidationError(
        'date-utc-invalid',
        'Cannot merge Daily results from different UTC dates.',
      );
    }
  }

  const merged = mergePuzzleBestRecord(current, candidate);
  return Object.freeze({
    ...merged,
    dateUtc: candidate.dateUtc,
    sharedCount: current?.sharedCount ?? 0,
  });
}
