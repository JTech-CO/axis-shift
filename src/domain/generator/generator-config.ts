import { assertBoardRows, assertBoardSize, assertPlayablePuzzlePair } from '../board/guards.ts';
import { DIFFICULTIES, type BoardRows, type Difficulty } from '../types.ts';
import type { DifficultyTagThresholds } from './difficulty.ts';

export interface NumericRange {
  readonly max: number;
  readonly min: number;
}

export type DailyInitialMode = 'noise' | 'zero';

export interface DailyDifficultyProfile {
  readonly complexityScore: NumericRange;
  readonly compressionGap: NumericRange;
  readonly density: NumericRange;
  readonly difficulty: Difficulty;
  readonly id: string;
  readonly initialDensity: NumericRange;
  readonly initialMode: DailyInitialMode;
  readonly isoWeekday: number;
  readonly nonzeroCols: NumericRange;
  readonly nonzeroRows: NumericRange;
  readonly overlapIndex: NumericRange;
  readonly rank: NumericRange;
  readonly size: number;
  readonly symmetryScore: NumericRange;
  readonly targetDensity: NumericRange;
}

export interface DailyGeneratorPolicy {
  readonly maxAttempts: number;
  readonly profiles: readonly DailyDifficultyProfile[];
  readonly schemaVersion: 1;
  readonly seedDomain: string;
  readonly tagThresholds: DifficultyTagThresholds;
  readonly version: string;
}

export interface DailyFallback {
  readonly id: string;
  readonly initialRows: BoardRows;
  readonly profileId: string;
  readonly size: number;
  readonly targetRows: BoardRows;
}

export interface DailyGeneratorResources {
  readonly fallbacks: readonly DailyFallback[];
  readonly policy: DailyGeneratorPolicy;
}

type JsonObject = Record<string, unknown>;

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const VERSION_PATTERN = /^v[1-9][0-9]*$/u;
const DIFFICULTY_SET: ReadonlySet<string> = new Set(DIFFICULTIES);

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireObject(value: unknown, label: string): JsonObject {
  if (!isObject(value)) throw new TypeError(`${label} must be an object.`);
  return value;
}

function requireInteger(value: unknown, label: string, min: number, max: number): number {
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    throw new RangeError(`${label} must be an integer in ${min}..${max}.`);
  }
  return value as number;
}

function requireFinite(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new RangeError(`${label} must be a finite number.`);
  }
  return value;
}

function requireString(value: unknown, label: string, pattern?: RegExp): string {
  if (typeof value !== 'string' || value.trim() !== value || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty, trimmed string.`);
  }
  if (pattern && !pattern.test(value)) throw new TypeError(`${label} has an invalid format.`);
  return value;
}

function requireRange(
  value: unknown,
  label: string,
  bounds: { readonly min: number; readonly max: number },
  integer = false,
): NumericRange {
  const object = requireObject(value, label);
  const min = requireFinite(object.min, `${label}.min`);
  const max = requireFinite(object.max, `${label}.max`);
  if (integer && (!Number.isInteger(min) || !Number.isInteger(max))) {
    throw new RangeError(`${label} bounds must be integers.`);
  }
  if (min < bounds.min || max > bounds.max || min > max) {
    throw new RangeError(`${label} must stay within ${bounds.min}..${bounds.max}.`);
  }
  return Object.freeze({ max, min });
}

function parseTagThresholds(value: unknown): DifficultyTagThresholds {
  const object = requireObject(value, 'policy.tagThresholds');
  const thresholds = {
    denseMin: requireFinite(object.denseMin, 'policy.tagThresholds.denseMin'),
    overlapMin: requireFinite(object.overlapMin, 'policy.tagThresholds.overlapMin'),
    sparseMax: requireFinite(object.sparseMax, 'policy.tagThresholds.sparseMax'),
    symmetricMin: requireFinite(object.symmetricMin, 'policy.tagThresholds.symmetricMin'),
  };
  for (const [key, threshold] of Object.entries(thresholds)) {
    if (threshold < 0 || threshold > 1) {
      throw new RangeError(`policy.tagThresholds.${key} must be in 0..1.`);
    }
  }
  if (thresholds.sparseMax >= thresholds.denseMin) {
    throw new RangeError('Sparse and dense tag thresholds must not overlap.');
  }
  return Object.freeze(thresholds);
}

function parseProfile(value: unknown, index: number): DailyDifficultyProfile {
  const label = `policy.profiles[${index}]`;
  const object = requireObject(value, label);
  const size = requireInteger(object.size, `${label}.size`, 3, 8);
  const difficulty = requireString(object.difficulty, `${label}.difficulty`);
  if (!DIFFICULTY_SET.has(difficulty)) {
    throw new TypeError(`${label}.difficulty is unsupported.`);
  }
  if (object.initialMode !== 'noise' && object.initialMode !== 'zero') {
    throw new TypeError(`${label}.initialMode must be noise or zero.`);
  }
  const initialDensity = requireRange(object.initialDensity, `${label}.initialDensity`, {
    max: 1,
    min: 0,
  });
  if (object.initialMode === 'zero' && (initialDensity.min !== 0 || initialDensity.max !== 0)) {
    throw new RangeError(`${label} zero mode requires initialDensity 0..0.`);
  }
  if (object.initialMode === 'noise' && initialDensity.min <= 0) {
    throw new RangeError(`${label} noise mode requires a positive initialDensity minimum.`);
  }

  return Object.freeze({
    complexityScore: requireRange(
      object.complexityScore,
      `${label}.complexityScore`,
      { max: 1_000, min: 0 },
      true,
    ),
    compressionGap: requireRange(
      object.compressionGap,
      `${label}.compressionGap`,
      { max: size - 1, min: 0 },
      true,
    ),
    density: requireRange(object.density, `${label}.density`, { max: 1, min: 0 }),
    difficulty: difficulty as Difficulty,
    id: requireString(object.id, `${label}.id`, ID_PATTERN),
    initialDensity,
    initialMode: object.initialMode,
    isoWeekday: requireInteger(object.isoWeekday, `${label}.isoWeekday`, 1, 7),
    nonzeroCols: requireRange(
      object.nonzeroCols,
      `${label}.nonzeroCols`,
      { max: size, min: 1 },
      true,
    ),
    nonzeroRows: requireRange(
      object.nonzeroRows,
      `${label}.nonzeroRows`,
      { max: size, min: 1 },
      true,
    ),
    overlapIndex: requireRange(object.overlapIndex, `${label}.overlapIndex`, { max: 1, min: 0 }),
    rank: requireRange(object.rank, `${label}.rank`, { max: size, min: 1 }, true),
    size,
    symmetryScore: requireRange(object.symmetryScore, `${label}.symmetryScore`, { max: 1, min: 0 }),
    targetDensity: requireRange(object.targetDensity, `${label}.targetDensity`, { max: 1, min: 0 }),
  });
}

export function parseDailyGeneratorPolicy(value: unknown): DailyGeneratorPolicy {
  const object = requireObject(value, 'policy');
  if (object.schemaVersion !== 1) throw new TypeError('policy.schemaVersion must be 1.');
  if (!Array.isArray(object.profiles) || object.profiles.length !== 7) {
    throw new TypeError('policy.profiles must contain exactly seven weekday profiles.');
  }
  const profiles = object.profiles
    .map(parseProfile)
    .sort((left, right) => left.isoWeekday - right.isoWeekday);
  const weekdays = new Set(profiles.map((profile) => profile.isoWeekday));
  const ids = new Set(profiles.map((profile) => profile.id));
  if (weekdays.size !== 7) throw new TypeError('policy.profiles must cover ISO weekdays 1..7.');
  if (ids.size !== profiles.length) throw new TypeError('policy profile ids must be unique.');
  const hasSizeBreak = profiles.some((profile, index) => {
    const previous = profiles[
      (index + profiles.length - 1) % profiles.length
    ] as DailyDifficultyProfile;
    return profile.size !== previous.size;
  });
  if (!hasSizeBreak) {
    throw new TypeError('policy must contain a weekly size boundary for adjacent-daily replay.');
  }
  const seedDomain = requireString(object.seedDomain, 'policy.seedDomain');
  if (seedDomain !== 'axis-shift|daily') {
    throw new TypeError('v1 policy.seedDomain must be axis-shift|daily.');
  }
  return Object.freeze({
    maxAttempts: requireInteger(object.maxAttempts, 'policy.maxAttempts', 1, 100_000),
    profiles: Object.freeze([...profiles]),
    schemaVersion: 1,
    seedDomain,
    tagThresholds: parseTagThresholds(object.tagThresholds),
    version: requireString(object.version, 'policy.version', VERSION_PATTERN),
  });
}

function parseFallback(value: unknown, index: number, policy: DailyGeneratorPolicy): DailyFallback {
  const label = `fallbacks[${index}]`;
  const object = requireObject(value, label);
  const profileId = requireString(object.profileId, `${label}.profileId`, ID_PATTERN);
  const profile = policy.profiles.find((candidate) => candidate.id === profileId);
  if (!profile) throw new TypeError(`${label}.profileId does not exist in policy.`);
  const size = requireInteger(object.size, `${label}.size`, 3, 8);
  assertBoardSize(size);
  if (size !== profile.size) throw new TypeError(`${label}.size does not match its profile.`);
  assertBoardRows(object.initialRows, size, `${label}.initialRows`);
  assertBoardRows(object.targetRows, size, `${label}.targetRows`);
  assertPlayablePuzzlePair(object.initialRows, object.targetRows, size);
  return Object.freeze({
    id: requireString(object.id, `${label}.id`, ID_PATTERN),
    initialRows: Object.freeze([...object.initialRows]),
    profileId,
    size,
    targetRows: Object.freeze([...object.targetRows]),
  });
}

export function parseDailyFallbacks(
  value: unknown,
  policy: DailyGeneratorPolicy,
): readonly DailyFallback[] {
  const records = isObject(value) && Array.isArray(value.fallbacks) ? value.fallbacks : value;
  if (!Array.isArray(records)) throw new TypeError('fallbacks must be an array.');
  const fallbacks = records.map((record, index) => parseFallback(record, index, policy));
  if (new Set(fallbacks.map((fallback) => fallback.id)).size !== fallbacks.length) {
    throw new TypeError('fallback ids must be unique.');
  }
  for (const profile of policy.profiles) {
    const matching = fallbacks.filter((fallback) => fallback.profileId === profile.id);
    if (matching.length < 2) {
      throw new TypeError(`profile ${profile.id} requires at least two fallback puzzles.`);
    }
    const targets = new Set(matching.map((fallback) => fallback.targetRows.join(',')));
    if (targets.size !== matching.length) {
      throw new TypeError(`profile ${profile.id} fallback targets must be distinct.`);
    }
  }
  return Object.freeze(fallbacks);
}

export function createDailyGeneratorResources(
  policyValue: unknown,
  fallbackValue: unknown,
): DailyGeneratorResources {
  const policy = parseDailyGeneratorPolicy(policyValue);
  return Object.freeze({ fallbacks: parseDailyFallbacks(fallbackValue, policy), policy });
}
