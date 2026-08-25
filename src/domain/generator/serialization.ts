import { assertBoardRows } from '../board/guards.ts';
import type { PuzzleDefinition } from '../types.ts';
import { sha256Hex } from './sha256.ts';

export function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new TypeError('Value cannot be represented as JSON.');
    return serialized;
  }
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(object[key])}`)
    .join(',')}}`;
}

export function serializePuzzleDefinition(puzzle: PuzzleDefinition): string {
  return stableSerialize(puzzle);
}

export function puzzleOutputHash(puzzle: PuzzleDefinition): string {
  return sha256Hex(serializePuzzleDefinition(puzzle));
}

export function targetBoardHash(size: number, targetRows: readonly number[]): string {
  assertBoardRows(targetRows, size, 'targetRows');
  return sha256Hex(`${size}:${targetRows.join(',')}`);
}
