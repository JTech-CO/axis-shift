import { hashSeed32 } from './sha256.ts';

const UINT32_RANGE = 0x1_0000_0000;

export interface DeterministicPrng {
  nextFloat(): number;
  nextInt(maxExclusive: number): number;
  nextUint32(): number;
}

function assertUint32(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0 || value >= UINT32_RANGE) {
    throw new RangeError(`${label} must be an unsigned 32-bit integer.`);
  }
}

export function createMulberry32(seed: number): DeterministicPrng {
  assertUint32(seed, 'seed');
  let state = seed >>> 0;

  const nextUint32 = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return (value ^ (value >>> 14)) >>> 0;
  };

  return Object.freeze({
    nextFloat(): number {
      return nextUint32() / UINT32_RANGE;
    },
    nextInt(maxExclusive: number): number {
      if (!Number.isInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > UINT32_RANGE) {
        throw new RangeError('maxExclusive must be an integer in 1..4294967296.');
      }
      const acceptanceLimit = Math.floor(UINT32_RANGE / maxExclusive) * maxExclusive;
      let value: number;
      do value = nextUint32();
      while (value >= acceptanceLimit);
      return value % maxExclusive;
    },
    nextUint32,
  });
}

export function normalizeSeedInput(seedInput: string): string {
  if (typeof seedInput !== 'string') throw new TypeError('seedInput must be a string.');
  return seedInput.normalize('NFKC');
}

export function createSeededPrng(seedInput: string): DeterministicPrng {
  return createMulberry32(hashSeed32(normalizeSeedInput(seedInput)));
}

export function prngUint32Vector(seedInput: string, count: number): number[] {
  if (!Number.isInteger(count) || count < 0 || count > 100_000) {
    throw new RangeError('count must be an integer in 0..100000.');
  }
  const prng = createSeededPrng(seedInput);
  return Array.from({ length: count }, () => prng.nextUint32());
}
