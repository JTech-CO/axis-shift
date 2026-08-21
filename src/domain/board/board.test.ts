import { describe, expect, it } from 'vitest';

import {
  boardKey,
  cloneBoard,
  columnMask,
  createEmptyBoard,
  differenceRows,
  isSolved,
  readCell,
} from './board.ts';

describe('BoardRows utilities', () => {
  it('creates and clones JSON-safe row arrays without sharing the source', () => {
    const empty = createEmptyBoard(4);
    expect(empty).toEqual([0, 0, 0, 0]);

    const source = [1, 2, 4];
    const copy = cloneBoard(source, 3);
    expect(copy).toEqual(source);
    expect(copy).not.toBe(source);
    copy[0] = 7;
    expect(source[0]).toBe(1);
  });

  it('maps visible column zero to bit zero and reads both cell states', () => {
    const rows = [0b101, 0b010, 0b001];
    expect(readCell(rows, 3, 0, 0)).toBe(1);
    expect(readCell(rows, 3, 0, 1)).toBe(0);
    expect(readCell(rows, 3, 1, 1)).toBe(1);
    expect(columnMask(rows, 3, 0)).toBe(0b101);
    expect(columnMask(rows, 3, 1)).toBe(0b010);
  });

  it('computes board differences and solved state without mutation', () => {
    const initial = [0b001, 0b010, 0b100];
    const target = [0b101, 0b011, 0b100];
    const difference = differenceRows(initial, target, 3);

    expect(difference).toEqual([0b100, 0b001, 0]);
    expect(initial).toEqual([0b001, 0b010, 0b100]);
    expect(isSolved(initial, target, 3)).toBe(false);
    expect(isSolved(target, [...target], 3)).toBe(true);
  });

  it('serializes a board into a deterministic size-qualified key', () => {
    expect(boardKey([3, 5, 6], 3)).toBe('3:3,5,6');
  });
});
