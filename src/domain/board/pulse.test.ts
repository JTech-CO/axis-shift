import { describe, expect, it } from 'vitest';

import { applyPulse, applyPulses, outerProductRows } from './pulse.ts';

describe('PULSE', () => {
  it('builds the exact outer product and flips only selected intersections', () => {
    expect(outerProductRows(4, 0b0101, 0b1010)).toEqual([0b1010, 0, 0b1010, 0]);

    const source = [0b0000, 0b1111, 0b0101, 0b1010];
    const result = applyPulse(source, 4, 0b0101, 0b1010);
    expect(result).toEqual([0b1010, 0b1111, 0b1111, 0b1010]);
    expect(source).toEqual([0b0000, 0b1111, 0b0101, 0b1010]);
  });

  it('returns a fresh unchanged board when either axis is empty', () => {
    const source = [1, 2, 4];
    const noRows = applyPulse(source, 3, 0, 0b111);
    const noColumns = applyPulse(source, 3, 0b111, 0);

    expect(noRows).toEqual(source);
    expect(noRows).not.toBe(source);
    expect(noColumns).toEqual(source);
    expect(noColumns).not.toBe(source);
  });

  it('composes zero or many encoded pulses in order', () => {
    const source = [0, 0, 0];
    expect(applyPulses(source, 3, [])).toEqual(source);
    expect(
      applyPulses(source, 3, [
        { rowMask: 0b011, colMask: 0b101 },
        { rowMask: 0b101, colMask: 0b110 },
      ]),
    ).toEqual([0b011, 0b101, 0b110]);
  });

  it('is an involution and commutes for every supported board size', () => {
    for (let size = 3; size <= 8; size += 1) {
      const mask = (1 << size) - 1;
      const source = Array.from({ length: size }, (_, row) => (row * 37 + size) & mask);
      const first = { rowMask: 0b01010101 & mask, colMask: 0b10101010 & mask };
      const second = { rowMask: 0b00110011 & mask, colMask: 0b11001100 & mask };
      const expected = source.map((row, rowIndex) =>
        (first.rowMask & (1 << rowIndex)) === 0 ? row : row ^ first.colMask,
      );

      expect(applyPulse(source, size, first.rowMask, first.colMask)).toEqual(expected);
      expect(
        applyPulse(
          applyPulse(source, size, first.rowMask, first.colMask),
          size,
          first.rowMask,
          first.colMask,
        ),
      ).toEqual(source);
      expect(applyPulses(source, size, [first, second])).toEqual(
        applyPulses(source, size, [second, first]),
      );
    }
  });

  it('rejects invalid boards and out-of-range masks instead of truncating', () => {
    expect(() => applyPulse([0, 0], 3, 1, 1)).toThrow(/exactly 3 rows/u);
    expect(() => applyPulse([0, 0, 0], 3, 0b1000, 1)).toThrow(/outside/u);
    expect(() => outerProductRows(3, 1, 0b1000)).toThrow(/outside/u);
  });
});
