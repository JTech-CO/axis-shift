import type { BoardRows, EncodedPulse } from '../types.ts';
import { columnMask } from '../board/board.ts';
import { assertBoardRows } from '../board/guards.ts';

export function factorizeGF2(rows: BoardRows, size: number): EncodedPulse[] {
  assertBoardRows(rows, size);
  const basis: number[] = [];
  const columnCoefficients: number[] = [];
  const combinations = new Map<number, number>([[0, 0]]);

  for (let columnIndex = 0; columnIndex < size; columnIndex += 1) {
    const vector = columnMask(rows, size, columnIndex);
    const existing = combinations.get(vector);
    if (existing !== undefined) {
      columnCoefficients.push(existing);
      continue;
    }

    const basisBit = 1 << basis.length;
    const knownCombinations = [...combinations.entries()];
    basis.push(vector);
    for (const [combined, coefficientMask] of knownCombinations) {
      combinations.set(combined ^ vector, coefficientMask | basisBit);
    }
    columnCoefficients.push(basisBit);
  }

  return basis.map((rowMask, basisIndex) => {
    let colMask = 0;
    for (let columnIndex = 0; columnIndex < size; columnIndex += 1) {
      if (((columnCoefficients[columnIndex] as number) & (1 << basisIndex)) !== 0) {
        colMask |= 1 << columnIndex;
      }
    }
    return { colMask, rowMask };
  });
}
