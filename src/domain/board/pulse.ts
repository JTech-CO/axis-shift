import type { BoardRows, EncodedPulse } from '../types.ts';
import { assertAxisMask, assertBoardRows, assertBoardSize } from './guards.ts';

export function outerProductRows(size: number, rowMask: number, colMask: number): number[] {
  assertBoardSize(size);
  assertAxisMask(rowMask, size, 'row');
  assertAxisMask(colMask, size, 'column');
  return Array.from({ length: size }, (_, rowIndex) =>
    (rowMask & (1 << rowIndex)) === 0 ? 0 : colMask,
  );
}

export function applyPulse(
  rows: BoardRows,
  size: number,
  rowMask: number,
  colMask: number,
): number[] {
  assertBoardRows(rows, size);
  assertAxisMask(rowMask, size, 'row');
  assertAxisMask(colMask, size, 'column');

  const nextRows = [...rows];
  if (rowMask === 0 || colMask === 0) return nextRows;

  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    if ((rowMask & (1 << rowIndex)) !== 0)
      nextRows[rowIndex] = (nextRows[rowIndex] as number) ^ colMask;
  }
  return nextRows;
}

export function applyPulses(
  rows: BoardRows,
  size: number,
  pulses: readonly EncodedPulse[],
): number[] {
  assertBoardRows(rows, size);
  return pulses.reduce(
    (currentRows, pulse) => applyPulse(currentRows, size, pulse.rowMask, pulse.colMask),
    [...rows],
  );
}
