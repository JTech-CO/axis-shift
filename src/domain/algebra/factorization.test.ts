import { describe, expect, it } from 'vitest';

import { applyPulses, createEmptyBoard } from '../board/index.ts';
import { factorizeGF2 } from './factorization.ts';
import { rankGF2 } from './gf2-rank.ts';

describe('factorizeGF2', () => {
  it('returns the empty canonical factorization for the zero matrix', () => {
    expect(factorizeGF2([0, 0, 0], 3)).toEqual([]);
  });

  it('matches the documented 3x3 low-column canonical golden', () => {
    const difference = [0b011, 0b101, 0b110];
    const pulses = factorizeGF2(difference, 3);

    expect(pulses).toEqual([
      { rowMask: 0b011, colMask: 0b101 },
      { rowMask: 0b101, colMask: 0b110 },
    ]);
    for (const pulse of pulses) {
      expect(pulse.rowMask).toBeGreaterThan(0);
      expect(pulse.colMask).toBeGreaterThan(0);
    }
    expect(pulses).toHaveLength(rankGF2(difference, 3));
    expect(applyPulses(createEmptyBoard(3), 3, pulses)).toEqual(difference);
  });

  it('solves the frozen M00-MAIN-v1 fixture at Par 2', () => {
    const initialRows = [0, 0, 0, 0];
    const targetRows = [0b1011, 0b0110, 0b1101, 0b0110];
    const pulses = factorizeGF2(targetRows, 4);

    expect(rankGF2(targetRows, 4)).toBe(2);
    expect(pulses).toEqual([
      { rowMask: 0b0101, colMask: 0b1101 },
      { rowMask: 0b1011, colMask: 0b0110 },
    ]);
    expect(applyPulses(initialRows, 4, pulses)).toEqual(targetRows);
  });

  it('adopts independent columns left to right and represents dependent columns', () => {
    const difference = [0b1111, 0b1010, 0b1100, 0];
    const pulses = factorizeGF2(difference, 4);

    expect(pulses).toHaveLength(rankGF2(difference, 4));
    expect(applyPulses(createEmptyBoard(4), 4, pulses)).toEqual(difference);
  });

  it('is deterministic across repeated calls and input clones', () => {
    const rows = [0b10101, 0b00110, 0b11100, 0b01010, 0b10001];
    const expected = factorizeGF2(rows, 5);

    expect(factorizeGF2(rows, 5)).toEqual(expected);
    expect(factorizeGF2([...rows], 5)).toEqual(expected);
  });

  it('rejects malformed matrices through the common board guard', () => {
    expect(() => factorizeGF2([0, 0], 3)).toThrow(/exactly 3 rows/u);
  });
});
