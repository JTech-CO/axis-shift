import type { BoardRows } from '../types.ts';
import { assertBoardRows } from '../board/guards.ts';

export function rankGF2(rows: BoardRows, size: number): number {
  assertBoardRows(rows, size);
  const reducedRows = [...rows];
  let rank = 0;

  for (let columnIndex = 0; columnIndex < size && rank < size; columnIndex += 1) {
    let pivotRow = rank;
    while (pivotRow < size && ((reducedRows[pivotRow] as number) & (1 << columnIndex)) === 0) {
      pivotRow += 1;
    }
    if (pivotRow === size) continue;

    if (pivotRow !== rank) {
      const displaced = reducedRows[rank] as number;
      reducedRows[rank] = reducedRows[pivotRow] as number;
      reducedRows[pivotRow] = displaced;
    }

    const pivot = reducedRows[rank] as number;
    for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
      if (rowIndex !== rank && ((reducedRows[rowIndex] as number) & (1 << columnIndex)) !== 0) {
        reducedRows[rowIndex] = (reducedRows[rowIndex] as number) ^ pivot;
      }
    }
    rank += 1;
  }

  return rank;
}
