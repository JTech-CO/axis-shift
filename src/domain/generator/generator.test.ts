import { describe, expect, it } from 'vitest';

import { applyPulses } from '../board/index.ts';
import {
  DAILY_GENERATOR_VERSION,
  PRNG_V1_GOLDEN_VECTORS,
  addUtcDays,
  analyzeDifficulty,
  buildDailySeedInput,
  compareUtcDates,
  createDailyGeneratorResources,
  createMulberry32,
  createSeededPrng,
  derivePuzzleTags,
  generateDailyPuzzle,
  generateDailyPuzzleWithDiagnostics,
  hashSeed32,
  isoWeekday,
  normalizeSeedInput,
  parseUtcDate,
  prngUint32Vector,
  puzzleOutputHash,
  serializePuzzleDefinition,
  sha256Hex,
  stableSerialize,
  targetBoardHash,
  utcDateOrdinal,
} from './index.ts';

interface FixtureOptions {
  readonly forceFallbackMonday?: boolean;
  readonly maxAttempts?: number;
}

function range(min: number, max = min): { readonly max: number; readonly min: number } {
  return { max, min };
}

function rows(size: number, rowIndex: number): number[] {
  return Array.from({ length: size }, (_, index) => (index === rowIndex ? 0b111 : 0));
}

function rawResources(options: FixtureOptions = {}): { fallbacks: unknown; policy: unknown } {
  const sizes = [4, 5, 5, 5, 6, 6, 5] as const;
  const mondayFallbackFeatures = analyzeDifficulty([0, 0, 0, 0], [7, 0, 0, 0], 4);
  const profiles = sizes.map((size, index) => {
    const isoDay = index + 1;
    const force = Boolean(options.forceFallbackMonday && isoDay === 1);
    return {
      complexityScore: force ? range(mondayFallbackFeatures.complexityScore) : range(0, 1000),
      compressionGap: force ? range(0) : range(0, size - 1),
      density: force ? range(3 / 16) : range(0, 1),
      difficulty: isoDay === 1 ? 'easy' : isoDay >= 5 && isoDay <= 6 ? 'hard' : 'normal',
      id: `weekday-${isoDay}`,
      initialDensity: range(0),
      initialMode: 'zero',
      isoWeekday: isoDay,
      nonzeroCols: force ? range(3) : range(1, size),
      nonzeroRows: force ? range(1) : range(1, size),
      overlapIndex: force ? range(mondayFallbackFeatures.overlapIndex) : range(0, 1),
      rank: force ? range(1) : range(1, Math.min(2, size)),
      size,
      symmetryScore: force ? range(mondayFallbackFeatures.symmetryScore) : range(0, 1),
      targetDensity: force ? range(3 / 16) : range(0, 1),
    };
  });
  const fallbacks = profiles.flatMap((profile) => [
    {
      id: `${profile.id}-fallback-a`,
      initialRows: Array.from({ length: profile.size }, () => 0),
      profileId: profile.id,
      size: profile.size,
      targetRows: rows(profile.size, 0),
    },
    {
      id: `${profile.id}-fallback-b`,
      initialRows: Array.from({ length: profile.size }, () => 0),
      profileId: profile.id,
      size: profile.size,
      targetRows: rows(profile.size, 1),
    },
  ]);
  return {
    fallbacks,
    policy: {
      maxAttempts: options.maxAttempts ?? 32,
      profiles,
      schemaVersion: 1,
      seedDomain: 'axis-shift|daily',
      tagThresholds: {
        denseMin: 0.58,
        overlapMin: 0.12,
        sparseMax: 0.36,
        symmetricMin: 0.8,
      },
      version: 'v1',
    },
  };
}

describe('SHA-256 and deterministic PRNG', () => {
  it('matches standard SHA-256 vectors and the big-endian seed word', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    expect(sha256Hex('The quick brown fox jumps over the lazy dog')).toBe(
      'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
    );
    expect(hashSeed32('abc')).toBe(0xba7816bf);
  });

  it('matches 20 fixed literals for the first 100 outputs', () => {
    expect(PRNG_V1_GOLDEN_VECTORS).toHaveLength(20);
    for (const vector of PRNG_V1_GOLDEN_VECTORS) {
      expect(vector.outputsHex).toHaveLength(800);
      expect(sha256Hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe(
        '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
      );
      expect(
        prngUint32Vector(vector.seedInput, 100)
          .map((value) => value.toString(16).padStart(8, '0'))
          .join(''),
      ).toBe(vector.outputsHex);
    }
  });

  it('normalizes seed strings with NFKC before hashing', () => {
    expect(normalizeSeedInput('e\u0301')).toBe('\u00e9');
    expect(prngUint32Vector('e\u0301', 100)).toEqual(prngUint32Vector('\u00e9', 100));
  });

  it('uses bounded rejection sampling and validates inputs', () => {
    const prng = createMulberry32(0);
    expect(
      Array.from({ length: 1000 }, () => prng.nextInt(7)).every((value) => value >= 0 && value < 7),
    ).toBe(true);
    expect(createSeededPrng('seed').nextFloat()).toBeGreaterThanOrEqual(0);
    expect(() => createMulberry32(-1)).toThrow(RangeError);
    expect(() => createMulberry32(0).nextInt(0)).toThrow(RangeError);
    expect(() => prngUint32Vector('seed', -1)).toThrow(RangeError);
  });
});

describe('strict UTC date arithmetic', () => {
  it('validates calendar dates without ambient Date', () => {
    expect(parseUtcDate('2028-02-29')).toEqual({ day: 29, month: 2, year: 2028 });
    expect(() => parseUtcDate('2027-02-29')).toThrow(RangeError);
    expect(() => parseUtcDate('2026-1-01')).toThrow(RangeError);
    expect(() => parseUtcDate('0000-01-01')).toThrow(RangeError);
  });

  it('adds days and computes ISO weekdays across leap boundaries', () => {
    expect(addUtcDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addUtcDays('2028-02-29', 1)).toBe('2028-03-01');
    expect(isoWeekday('2026-01-01')).toBe(4);
    expect(utcDateOrdinal('0001-01-01')).toBe(0);
    expect(compareUtcDates('2026-01-01', '2025-12-31')).toBe(1);
  });
});

describe('difficulty features and stable serialization', () => {
  it('captures the anti-sweep structure of the M00 main difference', () => {
    const features = analyzeDifficulty([0, 0, 0, 0], [11, 6, 13, 6], 4);
    expect(features).toMatchObject({
      activeCells: 10,
      compressionGap: 2,
      density: 10 / 16,
      hardCandidatePassed: true,
      nonzeroCols: 4,
      nonzeroRows: 4,
      rank: 2,
      sweepBound: 4,
    });
    expect(
      derivePuzzleTags(
        features,
        { denseMin: 0.58, overlapMin: 0.12, sparseMax: 0.36, symmetricMin: 0.8 },
        false,
      ),
    ).toContain('dense');
  });

  it('sorts object keys and hashes targets with their board size', () => {
    expect(stableSerialize({ z: 1, a: [true, null] })).toBe('{"a":[true,null],"z":1}');
    expect(targetBoardHash(3, [1, 2, 4])).not.toBe(targetBoardHash(4, [1, 2, 4, 0]));
    expect(() => stableSerialize(undefined)).toThrow(TypeError);
  });
});

describe('injected v1 Daily generator', () => {
  it('builds the exact ADR seed and validates policy resources', () => {
    expect(buildDailySeedInput('axis-shift|daily', 'v1', '2026-01-01')).toBe(
      'axis-shift|daily|v1|2026-01-01',
    );
    expect(() => buildDailySeedInput('wrong', 'v1', '2026-01-01')).toThrow(TypeError);
    const raw = rawResources();
    const resources = createDailyGeneratorResources(raw.policy, raw.fallbacks);
    expect(resources.policy.profiles.map((profile) => profile.isoWeekday)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(resources.fallbacks).toHaveLength(14);
  });

  it('returns a deterministic, canonical, solved PuzzleDefinition', () => {
    const raw = rawResources();
    const resources = createDailyGeneratorResources(raw.policy, raw.fallbacks);
    const input = { dateUtc: '2026-01-08', generatorVersion: DAILY_GENERATOR_VERSION };
    const first = generateDailyPuzzleWithDiagnostics(input, resources);
    const second = generateDailyPuzzleWithDiagnostics(input, resources);
    expect(first).toEqual(second);
    expect(first.puzzle.seed).toBe('axis-shift|daily|v1|2026-01-08');
    expect(first.puzzle.canonicalSolution).toHaveLength(first.puzzle.optimalPulseCount);
    expect(
      applyPulses(
        first.puzzle.initialRows,
        first.puzzle.size,
        first.puzzle.canonicalSolution ?? [],
      ),
    ).toEqual(first.puzzle.targetRows);
    expect(generateDailyPuzzle(input, resources)).toEqual(first.puzzle);
    expect(puzzleOutputHash(first.puzzle)).toHaveLength(64);
    expect(serializePuzzleDefinition(first.puzzle)).toBe(
      serializePuzzleDefinition(generateDailyPuzzle(input, resources)),
    );
  });
  it('supports strict-date lower and upper boundaries without lookback underflow', () => {
    const raw = rawResources();
    const resources = createDailyGeneratorResources(raw.policy, raw.fallbacks);
    for (const dateUtc of ['0001-01-01', '0001-01-02', '9999-12-31']) {
      const input = { dateUtc, generatorVersion: 'v1' };
      const first = generateDailyPuzzleWithDiagnostics(input, resources);
      const second = generateDailyPuzzleWithDiagnostics(input, resources);
      expect(first).toEqual(second);
      expect(first.puzzle.generatorVersion).toBe('v1');
      expect(first.puzzle.seed).toBe(`axis-shift|daily|v1|${dateUtc}`);
      expect(puzzleOutputHash(first.puzzle)).toHaveLength(64);
    }
  });

  it('prevents adjacent target duplicates inside same-size weekday runs', () => {
    const raw = rawResources();
    const resources = createDailyGeneratorResources(raw.policy, raw.fallbacks);
    const hashes = ['2026-01-06', '2026-01-07', '2026-01-08'].map(
      (dateUtc) =>
        generateDailyPuzzleWithDiagnostics({ dateUtc, generatorVersion: 'v1' }, resources)
          .targetHash,
    );
    expect(hashes[0]).not.toBe(hashes[1]);
    expect(hashes[1]).not.toBe(hashes[2]);
  });

  it('selects a forced fallback deterministically', () => {
    const raw = rawResources({ forceFallbackMonday: true, maxAttempts: 1 });
    const resources = createDailyGeneratorResources(raw.policy, raw.fallbacks);
    const input = { dateUtc: '2026-01-05', generatorVersion: 'v1' };
    const first = generateDailyPuzzleWithDiagnostics(input, resources);
    const second = generateDailyPuzzleWithDiagnostics(input, resources);
    expect(first.fallbackUsed).toBe(true);
    expect(first.fallbackId).toBe(second.fallbackId);
    expect(first.puzzle).toEqual(second.puzzle);
  });

  it('rejects invalid versions, dates, domains, and incomplete fallback pools', () => {
    const raw = rawResources();
    const resources = createDailyGeneratorResources(raw.policy, raw.fallbacks);
    expect(() =>
      generateDailyPuzzle({ dateUtc: '2026-01-01', generatorVersion: 'v2' }, resources),
    ).toThrow(RangeError);
    expect(() =>
      generateDailyPuzzle({ dateUtc: '2026-02-30', generatorVersion: 'v1' }, resources),
    ).toThrow(RangeError);
    expect(() =>
      createDailyGeneratorResources(
        { ...(raw.policy as object), seedDomain: 'axis-shift' },
        raw.fallbacks,
      ),
    ).toThrow(TypeError);
    expect(() =>
      createDailyGeneratorResources(raw.policy, (raw.fallbacks as unknown[]).slice(2)),
    ).toThrow(TypeError);
  });
});
