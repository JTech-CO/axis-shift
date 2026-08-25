import { factorizeGF2, rankGF2 } from '../algebra/index.ts';
import { assertPlayablePuzzlePair, boardMaskForSize } from '../board/guards.ts';
import { applyPulses, outerProductRows } from '../board/pulse.ts';
import type { PuzzleDefinition } from '../types.ts';
import { addUtcDays, isoWeekday, parseUtcDate, utcDateOrdinal } from './date.ts';
import { analyzeDifficulty, derivePuzzleTags, type DifficultyFeatures } from './difficulty.ts';
import type {
  DailyDifficultyProfile,
  DailyFallback,
  DailyGeneratorPolicy,
  DailyGeneratorResources,
  NumericRange,
} from './generator-config.ts';
import { createSeededPrng, type DeterministicPrng } from './prng.ts';
import { targetBoardHash } from './serialization.ts';

export interface GenerateDailyPuzzleInput {
  readonly dateUtc: string;
  readonly generatorVersion: string;
}

export interface DailyGenerationDiagnostics {
  readonly attemptCount: number;
  readonly fallbackId?: string;
  readonly fallbackUsed: boolean;
  readonly features: DifficultyFeatures;
  readonly profileId: string;
  readonly puzzle: PuzzleDefinition;
  readonly targetHash: string;
}

interface AcceptedBoards {
  readonly canonicalSolution: NonNullable<PuzzleDefinition['canonicalSolution']>;
  readonly features: DifficultyFeatures;
  readonly initialRows: readonly number[];
  readonly targetHash: string;
  readonly targetRows: readonly number[];
}

const VERSION_PATTERN = /^v[1-9][0-9]*$/u;

function inRange(value: number, range: NumericRange): boolean {
  return value >= range.min && value <= range.max;
}

function profileForWeekday(policy: DailyGeneratorPolicy, weekday: number): DailyDifficultyProfile {
  const profile = policy.profiles.find((candidate) => candidate.isoWeekday === weekday);
  if (!profile) throw new Error(`Generator policy does not define ISO weekday ${weekday}.`);
  return profile;
}

export function dailyProfileForDate(
  policy: DailyGeneratorPolicy,
  dateUtc: string,
): DailyDifficultyProfile {
  return profileForWeekday(policy, isoWeekday(dateUtc));
}

export function buildDailySeedInput(
  seedDomain: string,
  generatorVersion: string,
  dateUtc: string,
): string {
  parseUtcDate(dateUtc);
  if (seedDomain !== 'axis-shift|daily') {
    throw new TypeError('seedDomain must be axis-shift|daily for generator v1.');
  }
  if (!VERSION_PATTERN.test(generatorVersion)) {
    throw new TypeError('generatorVersion must use v followed by a positive integer.');
  }
  return `${seedDomain}|${generatorVersion}|${dateUtc}`;
}

function vectorRank(vectors: readonly number[], size: number): number {
  return rankGF2([...vectors, ...Array.from({ length: size - vectors.length }, () => 0)], size);
}

function independentVectors(
  size: number,
  count: number,
  prng: DeterministicPrng,
): number[] | undefined {
  const vectors: number[] = [];
  const mask = boardMaskForSize(size);
  const drawLimit = size * 16;
  for (let draw = 0; draw < drawLimit && vectors.length < count; draw += 1) {
    const candidate = prng.nextInt(mask) + 1;
    if (vectorRank([...vectors, candidate], size) === vectors.length + 1) vectors.push(candidate);
  }
  return vectors.length === count ? vectors : undefined;
}

function differenceFromIndependentVectors(
  size: number,
  rank: number,
  prng: DeterministicPrng,
): number[] | undefined {
  const rowVectors = independentVectors(size, rank, prng);
  const columnVectors = independentVectors(size, rank, prng);
  if (!rowVectors || !columnVectors) return undefined;
  const difference = Array.from({ length: size }, () => 0);
  for (let index = 0; index < rank; index += 1) {
    const outerProduct = outerProductRows(
      size,
      rowVectors[index] as number,
      columnVectors[index] as number,
    );
    for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
      difference[rowIndex] = (difference[rowIndex] as number) ^ (outerProduct[rowIndex] as number);
    }
  }
  return difference;
}

function randomInitialRows(
  profile: DailyDifficultyProfile,
  prng: DeterministicPrng,
): number[] | undefined {
  if (profile.initialMode === 'zero') return Array.from({ length: profile.size }, () => 0);
  const cellCount = profile.size * profile.size;
  const minimum = Math.ceil(cellCount * profile.initialDensity.min);
  const maximum = Math.floor(cellCount * profile.initialDensity.max);
  if (minimum > maximum || maximum === 0) return undefined;
  const activeCount = minimum + prng.nextInt(maximum - minimum + 1);
  const cells = Array.from({ length: cellCount }, (_, index) => index);
  for (let index = cells.length - 1; index > 0; index -= 1) {
    const swapIndex = prng.nextInt(index + 1);
    const displaced = cells[index] as number;
    cells[index] = cells[swapIndex] as number;
    cells[swapIndex] = displaced;
  }
  const rows = Array.from({ length: profile.size }, () => 0);
  for (const cell of cells.slice(0, activeCount)) {
    const rowIndex = Math.floor(cell / profile.size);
    const columnIndex = cell % profile.size;
    rows[rowIndex] = (rows[rowIndex] as number) | (1 << columnIndex);
  }
  return rows;
}

function boardsMeetProfile(
  initialRows: readonly number[],
  targetRows: readonly number[],
  profile: DailyDifficultyProfile,
  forbiddenTargetHash: string | undefined,
): AcceptedBoards | undefined {
  assertPlayablePuzzlePair(initialRows, targetRows, profile.size);
  const allOnMask = boardMaskForSize(profile.size);
  if (targetRows.every((row) => row === 0) || targetRows.every((row) => row === allOnMask)) {
    return undefined;
  }
  const features = analyzeDifficulty(initialRows, targetRows, profile.size);
  if (
    !inRange(features.rank, profile.rank) ||
    !inRange(features.initialDensity, profile.initialDensity) ||
    !inRange(features.density, profile.density) ||
    !inRange(features.targetDensity, profile.targetDensity) ||
    !inRange(features.nonzeroRows, profile.nonzeroRows) ||
    !inRange(features.nonzeroCols, profile.nonzeroCols) ||
    !inRange(features.compressionGap, profile.compressionGap) ||
    !inRange(features.overlapIndex, profile.overlapIndex) ||
    !inRange(features.symmetryScore, profile.symmetryScore) ||
    !inRange(features.complexityScore, profile.complexityScore)
  ) {
    return undefined;
  }
  if (profile.initialMode === 'zero' && features.initialDensity !== 0) return undefined;
  if (profile.initialMode === 'noise' && features.initialDensity === 0) return undefined;
  const targetHash = targetBoardHash(profile.size, targetRows);
  if (targetHash === forbiddenTargetHash) return undefined;
  const difference = initialRows.map((row, index) => row ^ (targetRows[index] as number));
  const canonical = factorizeGF2(difference, profile.size);
  if (
    canonical.length !== features.rank ||
    applyPulses(initialRows, profile.size, canonical).some(
      (row, index) => row !== targetRows[index],
    )
  ) {
    throw new Error(`Canonical solution failed for profile ${profile.id}.`);
  }
  return Object.freeze({
    canonicalSolution: Object.freeze(canonical.map((pulse) => Object.freeze({ ...pulse }))),
    features,
    initialRows: Object.freeze([...initialRows]),
    targetHash,
    targetRows: Object.freeze([...targetRows]),
  });
}

function createPuzzle(
  dateUtc: string,
  seedInput: string,
  policy: DailyGeneratorPolicy,
  profile: DailyDifficultyProfile,
  accepted: AcceptedBoards,
): PuzzleDefinition {
  return Object.freeze({
    complexityScore: accepted.features.complexityScore,
    canonicalSolution: accepted.canonicalSolution,
    difficulty: profile.difficulty,
    generatorVersion: policy.version,
    id: `daily-${policy.version}-${dateUtc}`,
    initialRows: accepted.initialRows,
    mode: 'daily',
    optimalPulseCount: accepted.features.rank,
    schemaVersion: 1,
    seed: seedInput,
    size: profile.size,
    tags: Object.freeze(derivePuzzleTags(accepted.features, policy.tagThresholds, false)),
    targetRows: accepted.targetRows,
    titleKey: 'daily.puzzle.title',
  });
}

function diagnosticResult(
  dateUtc: string,
  seedInput: string,
  policy: DailyGeneratorPolicy,
  profile: DailyDifficultyProfile,
  accepted: AcceptedBoards,
  attemptCount: number,
  fallback: DailyFallback | undefined,
): DailyGenerationDiagnostics {
  const base = {
    attemptCount,
    fallbackUsed: fallback !== undefined,
    features: accepted.features,
    profileId: profile.id,
    puzzle: createPuzzle(dateUtc, seedInput, policy, profile, accepted),
    targetHash: accepted.targetHash,
  };
  return Object.freeze(fallback ? { ...base, fallbackId: fallback.id } : base);
}

function selectFallback(
  dateUtc: string,
  seedInput: string,
  resources: DailyGeneratorResources,
  profile: DailyDifficultyProfile,
  forbiddenTargetHash: string | undefined,
): DailyGenerationDiagnostics {
  const pool = resources.fallbacks.filter((fallback) => fallback.profileId === profile.id);
  if (pool.length < 2) throw new Error(`Profile ${profile.id} has no safe fallback pool.`);
  const selector = createSeededPrng(`${seedInput}|fallback`);
  const startIndex = selector.nextInt(pool.length);
  for (let offset = 0; offset < pool.length; offset += 1) {
    const fallback = pool[(startIndex + offset) % pool.length] as DailyFallback;
    const accepted = boardsMeetProfile(
      fallback.initialRows,
      fallback.targetRows,
      profile,
      forbiddenTargetHash,
    );
    if (!accepted) {
      const unconstrained = boardsMeetProfile(
        fallback.initialRows,
        fallback.targetRows,
        profile,
        undefined,
      );
      if (!unconstrained)
        throw new Error(`Fallback ${fallback.id} violates profile ${profile.id}.`);
      continue;
    }
    return diagnosticResult(
      dateUtc,
      seedInput,
      resources.policy,
      profile,
      accepted,
      resources.policy.maxAttempts,
      fallback,
    );
  }
  throw new Error(`Profile ${profile.id} has no fallback distinct from the previous target.`);
}

function generateSingleDate(
  dateUtc: string,
  resources: DailyGeneratorResources,
  forbiddenTargetHash: string | undefined,
): DailyGenerationDiagnostics {
  const { policy } = resources;
  const profile = dailyProfileForDate(policy, dateUtc);
  const seedInput = buildDailySeedInput(policy.seedDomain, policy.version, dateUtc);
  const prng = createSeededPrng(seedInput);
  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    const rank = profile.rank.min + prng.nextInt(profile.rank.max - profile.rank.min + 1);
    const initialRows = randomInitialRows(profile, prng);
    const difference = differenceFromIndependentVectors(profile.size, rank, prng);
    if (!initialRows || !difference) continue;
    const targetRows = initialRows.map((row, index) => row ^ (difference[index] as number));
    const accepted = boardsMeetProfile(initialRows, targetRows, profile, forbiddenTargetHash);
    if (accepted) {
      return diagnosticResult(dateUtc, seedInput, policy, profile, accepted, attempt, undefined);
    }
  }
  return selectFallback(dateUtc, seedInput, resources, profile, forbiddenTargetHash);
}

function sameSizeRunDates(dateUtc: string, policy: DailyGeneratorPolicy): string[] {
  const size = dailyProfileForDate(policy, dateUtc).size;
  const ordinal = utcDateOrdinal(dateUtc);
  const dates = [dateUtc];
  for (let offset = 1; offset <= 7; offset += 1) {
    if (offset > ordinal) return dates;
    const previous = addUtcDays(dateUtc, -offset);
    if (dailyProfileForDate(policy, previous).size !== size) return dates;
    dates.unshift(previous);
  }
  throw new Error('Generator policy has no bounded weekly size run.');
}

export function generateDailyV1WithDiagnostics(
  input: GenerateDailyPuzzleInput,
  resources: DailyGeneratorResources,
): DailyGenerationDiagnostics {
  parseUtcDate(input.dateUtc);
  if (input.generatorVersion !== resources.policy.version) {
    throw new Error(
      `Requested ${input.generatorVersion}, but resources contain ${resources.policy.version}.`,
    );
  }
  let previousTargetHash: string | undefined;
  let result: DailyGenerationDiagnostics | undefined;
  for (const dateUtc of sameSizeRunDates(input.dateUtc, resources.policy)) {
    result = generateSingleDate(dateUtc, resources, previousTargetHash);
    previousTargetHash = result.targetHash;
  }
  if (!result) throw new Error('Daily generator produced no result.');
  return result;
}

export function generateDailyV1(
  input: GenerateDailyPuzzleInput,
  resources: DailyGeneratorResources,
): PuzzleDefinition {
  return generateDailyV1WithDiagnostics(input, resources).puzzle;
}
