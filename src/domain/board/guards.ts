export const MIN_BOARD_SIZE = 3;
export const MAX_BOARD_SIZE = 8;

export type BoardValidationCode =
  | 'board-length'
  | 'board-not-array'
  | 'coordinate-not-integer'
  | 'coordinate-out-of-range'
  | 'mask-negative'
  | 'mask-not-integer'
  | 'mask-out-of-range'
  | 'row-negative'
  | 'row-not-integer'
  | 'row-out-of-range'
  | 'size-not-integer'
  | 'size-out-of-range'
  | 'trivial-puzzle';

export class BoardValidationError extends Error {
  readonly code: BoardValidationCode;

  constructor(code: BoardValidationCode, message: string) {
    super(message);
    this.name = 'BoardValidationError';
    this.code = code;
  }
}

export function assertBoardSize(size: unknown): asserts size is number {
  if (!Number.isInteger(size)) {
    throw new BoardValidationError('size-not-integer', 'Board size must be an integer.');
  }
  if ((size as number) < MIN_BOARD_SIZE || (size as number) > MAX_BOARD_SIZE) {
    throw new BoardValidationError(
      'size-out-of-range',
      `Board size must be in ${MIN_BOARD_SIZE}..${MAX_BOARD_SIZE}.`,
    );
  }
}

export function boardMaskForSize(size: number): number {
  assertBoardSize(size);
  return (1 << size) - 1;
}

export function assertBoardRows(
  value: unknown,
  size: number,
  label = 'board',
): asserts value is number[] {
  const boardMask = boardMaskForSize(size);
  if (!Array.isArray(value)) {
    throw new BoardValidationError('board-not-array', `${label} must be an array.`);
  }
  if (value.length !== size) {
    throw new BoardValidationError('board-length', `${label} must contain exactly ${size} rows.`);
  }

  for (const [index, row] of value.entries()) {
    if (!Number.isInteger(row)) {
      throw new BoardValidationError('row-not-integer', `${label}[${index}] must be an integer.`);
    }
    if (row < 0) {
      throw new BoardValidationError('row-negative', `${label}[${index}] cannot be negative.`);
    }
    if (row > boardMask) {
      throw new BoardValidationError(
        'row-out-of-range',
        `${label}[${index}] contains bits outside the ${size}x${size} board.`,
      );
    }
  }
}

export function assertAxisMask(
  value: unknown,
  size: number,
  axis: 'column' | 'row',
): asserts value is number {
  const boardMask = boardMaskForSize(size);
  if (!Number.isInteger(value)) {
    throw new BoardValidationError('mask-not-integer', `${axis} mask must be an integer.`);
  }
  if ((value as number) < 0) {
    throw new BoardValidationError('mask-negative', `${axis} mask cannot be negative.`);
  }
  if ((value as number) > boardMask) {
    throw new BoardValidationError(
      'mask-out-of-range',
      `${axis} mask contains bits outside the ${size}x${size} board.`,
    );
  }
}

export function assertCellIndex(
  value: unknown,
  size: number,
  axis: 'column' | 'row',
): asserts value is number {
  assertBoardSize(size);
  if (!Number.isInteger(value)) {
    throw new BoardValidationError('coordinate-not-integer', `${axis} index must be an integer.`);
  }
  if ((value as number) < 0 || (value as number) >= size) {
    throw new BoardValidationError(
      'coordinate-out-of-range',
      `${axis} index must be in 0..${size - 1}.`,
    );
  }
}

export function assertPlayablePuzzlePair(
  initialRows: unknown,
  targetRows: unknown,
  size: number,
): void {
  assertBoardRows(initialRows, size, 'initialRows');
  assertBoardRows(targetRows, size, 'targetRows');
  if (initialRows.every((row, index) => row === targetRows[index])) {
    throw new BoardValidationError(
      'trivial-puzzle',
      'A playable puzzle must not begin in its target state.',
    );
  }
}
