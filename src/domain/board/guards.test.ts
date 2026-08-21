import { describe, expect, it } from 'vitest';

import {
  assertAxisMask,
  assertBoardRows,
  assertBoardSize,
  assertCellIndex,
  assertPlayablePuzzlePair,
  boardMaskForSize,
  BoardValidationError,
  type BoardValidationCode,
} from './guards.ts';

function expectValidationCode(run: () => void, code: BoardValidationCode): void {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(BoardValidationError);
    expect((error as BoardValidationError).code).toBe(code);
    expect((error as Error).name).toBe('BoardValidationError');
    return;
  }
  throw new Error(`Expected BoardValidationError with code ${code}.`);
}

describe('board guards', () => {
  it('accepts only integer board sizes from 3 through 8', () => {
    expect(() => assertBoardSize(3)).not.toThrow();
    expect(() => assertBoardSize(8)).not.toThrow();
    expect(boardMaskForSize(3)).toBe(0b111);
    expect(boardMaskForSize(8)).toBe(0xff);
    expectValidationCode(() => assertBoardSize(3.5), 'size-not-integer');
    expectValidationCode(() => assertBoardSize(Number.NaN), 'size-not-integer');
    expectValidationCode(() => assertBoardSize(2), 'size-out-of-range');
    expectValidationCode(() => assertBoardSize(9), 'size-out-of-range');
  });

  it('distinguishes board shape and row failures without truncating bits', () => {
    expect(() => assertBoardRows([0, 1, 7], 3)).not.toThrow();
    expectValidationCode(() => assertBoardRows(null, 3), 'board-not-array');
    expectValidationCode(() => assertBoardRows([0, 1], 3), 'board-length');
    expectValidationCode(() => assertBoardRows([0, 1, 2, 3], 3), 'board-length');
    expectValidationCode(() => assertBoardRows([0, 1.5, 2], 3, 'fixture'), 'row-not-integer');
    expectValidationCode(() => assertBoardRows([0, Number.NaN, 2], 3), 'row-not-integer');
    expectValidationCode(() => assertBoardRows([0, -1, 2], 3), 'row-negative');
    expectValidationCode(() => assertBoardRows([0, 8, 2], 3), 'row-out-of-range');

    for (let size = 3; size <= 8; size += 1) {
      const mask = (1 << size) - 1;
      expect(() =>
        assertBoardRows(
          Array.from({ length: size }, () => mask),
          size,
        ),
      ).not.toThrow();
      expectValidationCode(
        () => assertBoardRows([1 << size, ...Array.from({ length: size - 1 }, () => 0)], size),
        'row-out-of-range',
      );
    }
  });

  it('accepts empty axes and rejects malformed or out-of-board masks', () => {
    expect(() => assertAxisMask(0, 3, 'row')).not.toThrow();
    expect(() => assertAxisMask(0b111, 3, 'column')).not.toThrow();
    expectValidationCode(() => assertAxisMask(1.5, 3, 'row'), 'mask-not-integer');
    expectValidationCode(() => assertAxisMask(-1, 3, 'column'), 'mask-negative');
    expectValidationCode(() => assertAxisMask(0b1000, 3, 'row'), 'mask-out-of-range');
  });

  it('guards visible row and column coordinates', () => {
    expect(() => assertCellIndex(0, 3, 'row')).not.toThrow();
    expect(() => assertCellIndex(2, 3, 'column')).not.toThrow();
    expectValidationCode(() => assertCellIndex(1.5, 3, 'row'), 'coordinate-not-integer');
    expectValidationCode(() => assertCellIndex(-1, 3, 'column'), 'coordinate-out-of-range');
    expectValidationCode(() => assertCellIndex(3, 3, 'row'), 'coordinate-out-of-range');
  });

  it('keeps algebraic zero valid but rejects trivial playable puzzle pairs', () => {
    expect(() => assertPlayablePuzzlePair([0, 0, 0], [1, 0, 0], 3)).not.toThrow();
    expectValidationCode(() => assertPlayablePuzzlePair([0, 0], [1, 0, 0], 3), 'board-length');
    expectValidationCode(() => assertPlayablePuzzlePair([0, 0, 0], [1, 0], 3), 'board-length');
    expectValidationCode(() => assertPlayablePuzzlePair([0, 0, 0], [0, 0, 0], 3), 'trivial-puzzle');
  });
});
