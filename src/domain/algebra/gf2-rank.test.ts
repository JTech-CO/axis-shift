import { describe, expect, it } from 'vitest';

import { rankGF2 } from './gf2-rank.ts';
import rankSource from './gf2-rank.ts?raw';

describe('rankGF2', () => {
  it('returns rank zero for the algebraic zero matrix', () => {
    expect(rankGF2([0, 0, 0], 3)).toBe(0);
  });

  it('computes rank across matrices with pivots in different columns and rows', () => {
    expect(rankGF2([0b010, 0b001, 0], 3)).toBe(2);
    expect(rankGF2([0b001, 0b001, 0], 3)).toBe(1);
    expect(rankGF2([0b010, 0b100, 0], 3)).toBe(2);
    expect(rankGF2([0b001, 0b010, 0b100], 3)).toBe(3);
  });

  it('locks the non-observable low-column and first-available-row traversal contract', () => {
    const source = rankSource.replace(/\s+/gu, ' ');
    const columnLoop = source.indexOf(
      'for (let columnIndex = 0; columnIndex < size && rank < size; columnIndex += 1)',
    );
    const pivotStart = source.indexOf('let pivotRow = rank;', columnLoop);
    const pivotScan = source.indexOf(
      'while (pivotRow < size && ((reducedRows[pivotRow] as number) & (1 << columnIndex)) === 0)',
      pivotStart,
    );
    const pivotAdvance = source.indexOf('pivotRow += 1;', pivotScan);

    expect(columnLoop).toBeGreaterThanOrEqual(0);
    expect(pivotStart).toBeGreaterThan(columnLoop);
    expect(pivotScan).toBeGreaterThan(pivotStart);
    expect(pivotAdvance).toBeGreaterThan(pivotScan);
  });

  it('preserves rank under row swap and row XOR operations', () => {
    const original = [0b111, 0b101, 0b011];
    const swapped = [original[1] as number, original[0] as number, original[2] as number];
    const rowXor = [
      (original[0] as number) ^ (original[1] as number),
      original[1] as number,
      original[2] as number,
    ];
    expect(rankGF2(swapped, 3)).toBe(rankGF2(original, 3));
    expect(rankGF2(rowXor, 3)).toBe(rankGF2(original, 3));
  });

  it('does not mutate input and is stable across clones', () => {
    const rows = [0b111, 0b101, 0b011];
    const before = [...rows];
    const first = rankGF2(rows, 3);

    expect(rankGF2([...rows], 3)).toBe(first);
    expect(rows).toEqual(before);
  });

  it('rejects malformed matrices through the common board guard', () => {
    expect(() => rankGF2([0, 0], 3)).toThrow(/exactly 3 rows/u);
  });
});
