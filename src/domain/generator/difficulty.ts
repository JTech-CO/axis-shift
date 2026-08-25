import { factorizeGF2, rankGF2 } from '../algebra/index.ts';
import { differenceRows } from '../board/board.ts';
import { assertBoardRows } from '../board/guards.ts';
import type { PuzzleTag } from '../types.ts';

export interface DifficultyFeatures {
  readonly activeCells: number;
  readonly complexityScore: number;
  readonly compressionGap: number;
  readonly density: number;
  readonly dispersionIndex: number;
  readonly gestureCost: number;
  readonly hardCandidatePassed: boolean;
  readonly initialDensity: number;
  readonly noiseRatio: number;
  readonly nonzeroCols: number;
  readonly nonzeroRows: number;
  readonly normalizedGestureCost: number;
  readonly overlapIndex: number;
  readonly rank: number;
  readonly sweepBound: number;
  readonly symmetryScore: number;
  readonly targetDensity: number;
}

export interface DifficultyTagThresholds {
  readonly denseMin: number;
  readonly overlapMin: number;
  readonly sparseMax: number;
  readonly symmetricMin: number;
}

function countBits(value: number): number {
  let count = 0;
  for (let remaining = value >>> 0; remaining !== 0; remaining >>>= 1) {
    count += remaining & 1;
  }
  return count;
}

function density(rows: readonly number[], size: number): number {
  return rows.reduce((total, row) => total + countBits(row), 0) / (size * size);
}

function countNonzeroColumns(rows: readonly number[], size: number): number {
  let count = 0;
  for (let columnIndex = 0; columnIndex < size; columnIndex += 1) {
    if (rows.some((row) => (row & (1 << columnIndex)) !== 0)) count += 1;
  }
  return count;
}

function pulseOverlapIndex(pulses: ReturnType<typeof factorizeGF2>, size: number): number {
  const touches = Array.from({ length: size * size }, () => 0);
  for (const pulse of pulses) {
    for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
      if ((pulse.rowMask & (1 << rowIndex)) === 0) continue;
      for (let columnIndex = 0; columnIndex < size; columnIndex += 1) {
        if ((pulse.colMask & (1 << columnIndex)) !== 0) {
          const cellIndex = rowIndex * size + columnIndex;
          touches[cellIndex] = (touches[cellIndex] as number) + 1;
        }
      }
    }
  }
  const touched = touches.filter((count) => count > 0).length;
  return touched === 0 ? 0 : touches.filter((count) => count > 1).length / touched;
}

function dispersionIndex(rows: readonly number[], size: number): number {
  const active: (readonly [number, number])[] = [];
  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < size; columnIndex += 1) {
      if (((rows[rowIndex] as number) & (1 << columnIndex)) !== 0) {
        active.push([rowIndex, columnIndex]);
      }
    }
  }
  if (active.length < 2) return 0;
  let totalDistance = 0;
  let pairCount = 0;
  for (let leftIndex = 0; leftIndex < active.length; leftIndex += 1) {
    const left = active[leftIndex] as readonly [number, number];
    for (let rightIndex = leftIndex + 1; rightIndex < active.length; rightIndex += 1) {
      const right = active[rightIndex] as readonly [number, number];
      totalDistance += Math.abs(left[0] - right[0]) + Math.abs(left[1] - right[1]);
      pairCount += 1;
    }
  }
  return totalDistance / pairCount / (2 * (size - 1));
}

function reverseBits(value: number, size: number): number {
  let reversed = 0;
  for (let index = 0; index < size; index += 1) {
    if ((value & (1 << index)) !== 0) reversed |= 1 << (size - index - 1);
  }
  return reversed;
}

function matchingRatio(
  rows: readonly number[],
  size: number,
  transform: (row: number, column: number) => readonly [number, number],
): number {
  let matches = 0;
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const [otherRow, otherColumn] = transform(row, column);
      const first = ((rows[row] as number) >>> column) & 1;
      const second = ((rows[otherRow] as number) >>> otherColumn) & 1;
      if (first === second) matches += 1;
    }
  }
  return matches / (size * size);
}

function symmetryScore(rows: readonly number[], size: number): number {
  const horizontal = matchingRatio(rows, size, (row, column) => [size - row - 1, column]);
  const vertical = matchingRatio(rows, size, (row, column) => [row, size - column - 1]);
  const rotation = matchingRatio(rows, size, (row, column) => [size - row - 1, size - column - 1]);
  return Math.max(horizontal, vertical, rotation);
}

export function analyzeDifficulty(
  initialRows: readonly number[],
  targetRows: readonly number[],
  size: number,
): DifficultyFeatures {
  assertBoardRows(initialRows, size, 'initialRows');
  assertBoardRows(targetRows, size, 'targetRows');
  const difference = differenceRows(initialRows, targetRows, size);
  const rank = rankGF2(difference, size);
  const pulses = factorizeGF2(difference, size);
  const nonzeroRows = difference.filter((row) => row !== 0).length;
  const nonzeroCols = countNonzeroColumns(difference, size);
  const sweepBound = Math.min(nonzeroRows, nonzeroCols);
  const compressionGap = sweepBound - rank;
  const activeCells = difference.reduce((total, row) => total + countBits(row), 0);
  const differenceDensity = activeCells / (size * size);
  const initialDensity = density(initialRows, size);
  const gestureCost = pulses.reduce(
    (total, pulse) => total + countBits(pulse.rowMask) + countBits(pulse.colMask),
    0,
  );
  const normalizedGestureCost = rank === 0 ? 0 : (10 * gestureCost) / (2 * size * rank);
  const overlap = pulseOverlapIndex(pulses, size);
  const dispersion = dispersionIndex(difference, size);
  const symmetry = symmetryScore(difference, size);
  const complexityScore = Math.max(
    0,
    Math.round(
      20 * (rank - 1) +
        5 * (size - 3) +
        12 * overlap +
        8 * dispersion +
        8 * initialDensity +
        6 * (1 - symmetry) +
        normalizedGestureCost,
    ),
  );

  return Object.freeze({
    activeCells,
    complexityScore,
    compressionGap,
    density: differenceDensity,
    dispersionIndex: dispersion,
    gestureCost,
    hardCandidatePassed:
      rank > 0 && nonzeroRows === size && nonzeroCols === size && compressionGap >= 2,
    initialDensity,
    noiseRatio: initialDensity,
    nonzeroCols,
    nonzeroRows,
    normalizedGestureCost,
    overlapIndex: overlap,
    rank,
    sweepBound,
    symmetryScore: symmetry,
    targetDensity: density(targetRows, size),
  });
}

export function derivePuzzleTags(
  features: DifficultyFeatures,
  thresholds: DifficultyTagThresholds,
  tutorial: boolean,
): PuzzleTag[] {
  const tags: PuzzleTag[] = [];
  if (features.density <= thresholds.sparseMax) tags.push('sparse');
  if (features.density >= thresholds.denseMin) tags.push('dense');
  tags.push(features.symmetryScore >= thresholds.symmetricMin ? 'symmetric' : 'asymmetric');
  if (features.overlapIndex >= thresholds.overlapMin) tags.push('overlap');
  if (features.initialDensity > 0) tags.push('noise');
  if (tutorial) tags.push('tutorial');
  return tags;
}

export function reverseBoardBits(rows: readonly number[], size: number): number[] {
  assertBoardRows(rows, size);
  return rows.map((row) => reverseBits(row, size));
}
