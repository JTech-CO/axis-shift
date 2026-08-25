import { describe, expect, it } from 'vitest';

import {
  GradeInvariantError,
  calculateSignalGrade,
  compareSignalGrades,
  isSignalGrade,
} from './grade.ts';

describe('calculateSignalGrade', () => {
  it.each([
    { delta: 0, expected: 'S' },
    { delta: 1, expected: 'A' },
    { delta: 2, expected: 'B' },
    { delta: 3, expected: 'B' },
    { delta: 4, expected: 'C' },
    { delta: 20, expected: 'C' },
  ] as const)('maps pulse delta $delta to base grade $expected', ({ delta, expected }) => {
    expect(
      calculateSignalGrade({
        hintLevelUsed: 0,
        optimalPulseCount: 3,
        usedPulseCount: 3 + delta,
      }),
    ).toBe(expected);
  });

  it('leaves Hint 1 unpenalized and applies Hint 2/3 as caps without upgrades', () => {
    expect(
      calculateSignalGrade({ hintLevelUsed: 1, optimalPulseCount: 3, usedPulseCount: 3 }),
    ).toBe('S');
    expect(
      calculateSignalGrade({ hintLevelUsed: 2, optimalPulseCount: 3, usedPulseCount: 3 }),
    ).toBe('A');
    expect(
      calculateSignalGrade({ hintLevelUsed: 3, optimalPulseCount: 3, usedPulseCount: 3 }),
    ).toBe('B');
    expect(
      calculateSignalGrade({ hintLevelUsed: 2, optimalPulseCount: 3, usedPulseCount: 5 }),
    ).toBe('B');
    expect(
      calculateSignalGrade({ hintLevelUsed: 3, optimalPulseCount: 3, usedPulseCount: 7 }),
    ).toBe('C');
  });

  it('throws an invariant error when a solved result claims fewer moves than Par', () => {
    expect(() =>
      calculateSignalGrade({ hintLevelUsed: 0, optimalPulseCount: 4, usedPulseCount: 3 }),
    ).toThrowError(
      expect.objectContaining<Partial<GradeInvariantError>>({ code: 'pulse-count-below-par' }),
    );
  });

  it.each([
    { hintLevelUsed: 0, optimalPulseCount: 0, usedPulseCount: 1 },
    { hintLevelUsed: 0, optimalPulseCount: 1.5, usedPulseCount: 2 },
    { hintLevelUsed: 0, optimalPulseCount: 1, usedPulseCount: Number.NaN },
    { hintLevelUsed: 4, optimalPulseCount: 1, usedPulseCount: 1 },
  ])('rejects malformed scoring input %#', (input) => {
    expect(() => calculateSignalGrade(input as Parameters<typeof calculateSignalGrade>[0])).toThrow(
      GradeInvariantError,
    );
  });
});

describe('SignalGrade helpers', () => {
  it('uses S > A > B > C ordering and rejects non-grade strings', () => {
    expect(compareSignalGrades('S', 'A')).toBeLessThan(0);
    expect(compareSignalGrades('B', 'A')).toBeGreaterThan(0);
    expect(compareSignalGrades('C', 'C')).toBe(0);
    expect(isSignalGrade('S')).toBe(true);
    expect(isSignalGrade('D')).toBe(false);
    expect(isSignalGrade(null)).toBe(false);
  });
});
