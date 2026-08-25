export const SIGNAL_GRADES = ['S', 'A', 'B', 'C'] as const;

export type SignalGrade = (typeof SIGNAL_GRADES)[number];
export type HintLevelUsed = 0 | 1 | 2 | 3;

export type GradeInvariantCode =
  | 'hint-level-invalid'
  | 'optimal-pulse-count-invalid'
  | 'pulse-count-below-par'
  | 'used-pulse-count-invalid';

export class GradeInvariantError extends Error {
  readonly code: GradeInvariantCode;

  constructor(code: GradeInvariantCode, message: string) {
    super(message);
    this.name = 'GradeInvariantError';
    this.code = code;
  }
}

export interface SignalGradeInput {
  readonly hintLevelUsed: HintLevelUsed;
  readonly optimalPulseCount: number;
  readonly usedPulseCount: number;
}

const GRADE_ORDER: Readonly<Record<SignalGrade, number>> = Object.freeze({
  A: 1,
  B: 2,
  C: 3,
  S: 0,
});

function isPositiveSafeInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

function assertGradeInput(input: SignalGradeInput): void {
  if (!isPositiveSafeInteger(input.optimalPulseCount)) {
    throw new GradeInvariantError(
      'optimal-pulse-count-invalid',
      'optimalPulseCount must be a positive safe integer.',
    );
  }
  if (!isPositiveSafeInteger(input.usedPulseCount)) {
    throw new GradeInvariantError(
      'used-pulse-count-invalid',
      'usedPulseCount must be a positive safe integer.',
    );
  }
  if (![0, 1, 2, 3].includes(input.hintLevelUsed)) {
    throw new GradeInvariantError(
      'hint-level-invalid',
      'hintLevelUsed must be an integer in 0..3.',
    );
  }
  if (input.usedPulseCount < input.optimalPulseCount) {
    throw new GradeInvariantError(
      'pulse-count-below-par',
      'A solved puzzle cannot use fewer PULSE moves than its proven Par.',
    );
  }
}

function baseGradeForDelta(delta: number): SignalGrade {
  if (delta === 0) return 'S';
  if (delta === 1) return 'A';
  if (delta <= 3) return 'B';
  return 'C';
}

function hintGradeFloor(hintLevelUsed: HintLevelUsed): SignalGrade {
  if (hintLevelUsed === 2) return 'A';
  if (hintLevelUsed === 3) return 'B';
  return 'S';
}

export function isSignalGrade(value: unknown): value is SignalGrade {
  return typeof value === 'string' && SIGNAL_GRADES.includes(value as SignalGrade);
}

/** Negative means left is the better grade; positive means right is better. */
export function compareSignalGrades(left: SignalGrade, right: SignalGrade): number {
  return GRADE_ORDER[left] - GRADE_ORDER[right];
}

export function calculateSignalGrade(input: SignalGradeInput): SignalGrade {
  assertGradeInput(input);
  const baseGrade = baseGradeForDelta(input.usedPulseCount - input.optimalPulseCount);
  const capGrade = hintGradeFloor(input.hintLevelUsed);
  return GRADE_ORDER[baseGrade] >= GRADE_ORDER[capGrade] ? baseGrade : capGrade;
}
