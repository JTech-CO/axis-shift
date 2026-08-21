import type { BoardRows } from '../types.ts';
import { assertBoardRows, assertBoardSize, assertCellIndex } from './guards.ts';

export function createEmptyBoard(size: number): number[] {
  assertBoardSize(size);
  return Array.from({ length: size }, () => 0);
}

export function cloneBoard(rows: BoardRows, size: number): number[] {
  assertBoardRows(rows, size);
  return [...rows];
}

export function readCell(
  rows: BoardRows,
  size: number,
  rowIndex: number,
  columnIndex: number,
): 0 | 1 {
  assertBoardRows(rows, size);
  assertCellIndex(rowIndex, size, 'row');
  assertCellIndex(columnIndex, size, 'column');
  return ((rows[rowIndex] as number) & (1 << columnIndex)) === 0 ? 0 : 1;
}

export function columnMask(rows: BoardRows, size: number, columnIndex: number): number {
  assertBoardRows(rows, size);
  assertCellIndex(columnIndex, size, 'column');
  let mask = 0;
  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    if (((rows[rowIndex] as number) & (1 << columnIndex)) !== 0) mask |= 1 << rowIndex;
  }
  return mask;
}

export function differenceRows(leftRows: BoardRows, rightRows: BoardRows, size: number): number[] {
  assertBoardRows(leftRows, size, 'leftRows');
  assertBoardRows(rightRows, size, 'rightRows');
  return leftRows.map((row, index) => row ^ (rightRows[index] as number));
}

export function isSolved(currentRows: BoardRows, targetRows: BoardRows, size: number): boolean {
  assertBoardRows(currentRows, size, 'currentRows');
  assertBoardRows(targetRows, size, 'targetRows');
  return currentRows.every((row, index) => row === targetRows[index]);
}

export function boardKey(rows: BoardRows, size: number): string {
  assertBoardRows(rows, size);
  return `${size}:${rows.join(',')}`;
}
