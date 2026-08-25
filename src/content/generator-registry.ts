import {
  compareUtcDates,
  SUPPORTED_DAILY_GENERATOR_VERSIONS,
  createDailyGeneratorResources,
  type DailyFallback,
  type DailyGeneratorPolicy,
  type DailyGeneratorResources,
} from '../domain/index.ts';

import { DAILY_V1_GOLDEN_VECTORS, type DailyV1GoldenVector } from './daily-v1.golden.ts';
import fallbackV1Value from './fallbacks/v1.json';
import generatorMapValue from './generator-map.json';

type JsonObject = Record<string, unknown>;

export interface DistributionRange {
  readonly max: number;
  readonly min: number;
}

export interface GeneratorDistributionTargets {
  readonly difficulty: Readonly<Record<string, DistributionRange>>;
  readonly rank: Readonly<Record<string, DistributionRange>>;
  readonly size: Readonly<Record<string, DistributionRange>>;
}

export interface DailyGeneratorScheduleEntry {
  readonly effectiveFrom: string;
  readonly version: string;
}

export interface DailyGeneratorVersionResources {
  readonly distributionTargets: GeneratorDistributionTargets;
  readonly fallbacks: readonly DailyFallback[];
  readonly generatorResources: DailyGeneratorResources;
  readonly goldenVectors: readonly DailyV1GoldenVector[];
  readonly policy: DailyGeneratorPolicy;
}

interface ParsedGeneratorMap {
  readonly defaultVersion: string;
  readonly schedule: readonly DailyGeneratorScheduleEntry[];
  readonly versions: Readonly<Record<string, JsonObject>>;
}

interface VersionSource {
  readonly expectedGoldenCount: number;
  readonly fallbackValue: unknown;
  readonly goldenVectors: readonly DailyV1GoldenVector[];
}

const VERSION_PATTERN = /^v[1-9][0-9]*$/u;
const HASH_PATTERN = /^[0-9a-f]{64}$/u;

function requireObject(value: unknown, label: string): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  return value as JsonObject;
}

function requireVersion(value: unknown, label: string): string {
  if (typeof value !== 'string' || !VERSION_PATTERN.test(value)) {
    throw new TypeError(`${label} must use v followed by a positive integer.`);
  }
  return value;
}

function assertExactFields(record: JsonObject, expected: readonly string[], label: string): void {
  const actual = Object.keys(record).sort();
  const sortedExpected = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(sortedExpected)) {
    throw new TypeError(`${label} fields must be exactly ${sortedExpected.join(', ')}.`);
  }
}

function parseGeneratorMap(value: unknown): ParsedGeneratorMap {
  const root = requireObject(value, 'generatorMap');
  assertExactFields(
    root,
    ['defaultVersion', 'schedule', 'schemaVersion', 'versions'],
    'generatorMap',
  );
  if (root.schemaVersion !== 1) throw new TypeError('generatorMap.schemaVersion must be 1.');

  const rawVersions = requireObject(root.versions, 'generatorMap.versions');
  const versionEntries = Object.entries(rawVersions);
  if (versionEntries.length === 0) {
    throw new TypeError('generatorMap.versions must contain at least one version.');
  }
  const versions = Object.freeze(
    Object.fromEntries(
      versionEntries.map(([version, policyValue]) => {
        requireVersion(version, `generatorMap.versions.${version}`);
        const policy = requireObject(policyValue, `generatorMap.versions.${version}`);
        if (policy.version !== version) {
          throw new TypeError(`generatorMap.versions.${version}.version must match its key.`);
        }
        return [version, policy];
      }),
    ),
  );

  const scheduleValues = root.schedule;
  if (!Array.isArray(scheduleValues) || scheduleValues.length === 0) {
    throw new TypeError('generatorMap.schedule must contain at least one effectiveFrom entry.');
  }
  const schedule = Object.freeze(
    scheduleValues.map((entryValue, index) => {
      const entry = requireObject(entryValue, `generatorMap.schedule[${index}]`);
      assertExactFields(entry, ['effectiveFrom', 'version'], `generatorMap.schedule[${index}]`);
      if (typeof entry.effectiveFrom !== 'string') {
        throw new TypeError(`generatorMap.schedule[${index}].effectiveFrom must be a string.`);
      }
      compareUtcDates(entry.effectiveFrom, entry.effectiveFrom);
      const version = requireVersion(entry.version, `generatorMap.schedule[${index}].version`);
      if (!(version in versions)) {
        throw new RangeError(`generatorMap.schedule[${index}] references unknown ${version}.`);
      }
      if (index > 0) {
        const previous = requireObject(
          scheduleValues[index - 1],
          `generatorMap.schedule[${index - 1}]`,
        );
        if (
          typeof previous.effectiveFrom !== 'string' ||
          compareUtcDates(previous.effectiveFrom, entry.effectiveFrom) >= 0
        ) {
          throw new RangeError(
            'generatorMap.schedule effectiveFrom values must be strictly ordered.',
          );
        }
      }
      return Object.freeze({ effectiveFrom: entry.effectiveFrom, version });
    }),
  );

  const defaultVersion = requireVersion(root.defaultVersion, 'generatorMap.defaultVersion');
  if (!(defaultVersion in versions)) {
    throw new RangeError(`generatorMap.defaultVersion references unknown ${defaultVersion}.`);
  }
  if (schedule[schedule.length - 1]?.version !== defaultVersion) {
    throw new RangeError('generatorMap.defaultVersion must equal the latest scheduled version.');
  }
  return Object.freeze({ defaultVersion, schedule, versions });
}

function freezeDistributionTargets(value: unknown): GeneratorDistributionTargets {
  const root = requireObject(value, 'distributionTargets');
  assertExactFields(root, ['difficulty', 'rank', 'size'], 'distributionTargets');
  const freezeGroup = (groupValue: unknown, label: string) => {
    const group = requireObject(groupValue, label);
    return Object.freeze(
      Object.fromEntries(
        Object.entries(group).map(([key, rangeValue]) => {
          const range = requireObject(rangeValue, `${label}.${key}`);
          assertExactFields(range, ['max', 'min'], `${label}.${key}`);
          if (
            typeof range.min !== 'number' ||
            typeof range.max !== 'number' ||
            !Number.isFinite(range.min) ||
            !Number.isFinite(range.max) ||
            range.min < 0 ||
            range.max > 1 ||
            range.min > range.max
          ) {
            throw new RangeError(`${label}.${key} must be a finite 0..1 range.`);
          }
          return [key, Object.freeze({ max: range.max, min: range.min })];
        }),
      ),
    );
  };
  return Object.freeze({
    difficulty: freezeGroup(root.difficulty, 'distributionTargets.difficulty'),
    rank: freezeGroup(root.rank, 'distributionTargets.rank'),
    size: freezeGroup(root.size, 'distributionTargets.size'),
  });
}

function freezeGoldenVectors(
  vectors: readonly DailyV1GoldenVector[],
  expectedCount: number,
  version: string,
): readonly DailyV1GoldenVector[] {
  if (vectors.length !== expectedCount) {
    throw new RangeError(`${version} must contain exactly ${expectedCount} golden vectors.`);
  }
  const dates = new Set<string>();
  return Object.freeze(
    vectors.map((vector, index) => {
      compareUtcDates(vector.dateUtc, vector.dateUtc);
      if (!HASH_PATTERN.test(vector.puzzleHash)) {
        throw new TypeError(`${version} golden[${index}].puzzleHash must be lowercase SHA-256.`);
      }
      if (dates.has(vector.dateUtc)) {
        throw new TypeError(`${version} golden dates must be unique.`);
      }
      dates.add(vector.dateUtc);
      return Object.freeze({ dateUtc: vector.dateUtc, puzzleHash: vector.puzzleHash });
    }),
  );
}

const VERSION_SOURCES: Readonly<Record<string, VersionSource>> = Object.freeze({
  v1: Object.freeze({
    expectedGoldenCount: 20,
    fallbackValue: fallbackV1Value,
    goldenVectors: DAILY_V1_GOLDEN_VECTORS,
  }),
});

const GENERATOR_MAP = parseGeneratorMap(generatorMapValue);
const mapVersions = Object.keys(GENERATOR_MAP.versions).sort();
const sourceVersions = Object.keys(VERSION_SOURCES).sort();
const algorithmVersions = [...SUPPORTED_DAILY_GENERATOR_VERSIONS].sort();
if (
  JSON.stringify(mapVersions) !== JSON.stringify(sourceVersions) ||
  JSON.stringify(mapVersions) !== JSON.stringify(algorithmVersions)
) {
  throw new Error(
    'Generator map, content sources, and domain algorithms must have exact versions.',
  );
}

export const DEFAULT_DAILY_GENERATOR_VERSION = GENERATOR_MAP.defaultVersion;
export const DAILY_GENERATOR_SCHEDULE = GENERATOR_MAP.schedule;

export const DAILY_GENERATOR_RESOURCE_REGISTRY: Readonly<
  Record<string, DailyGeneratorVersionResources>
> = Object.freeze(
  Object.fromEntries(
    mapVersions.map((version) => {
      const policyValue = GENERATOR_MAP.versions[version] as JsonObject;
      const source = VERSION_SOURCES[version] as VersionSource;
      const generatorResources = createDailyGeneratorResources(policyValue, source.fallbackValue);
      const entry: DailyGeneratorVersionResources = Object.freeze({
        distributionTargets: freezeDistributionTargets(policyValue.distributionTargets),
        fallbacks: generatorResources.fallbacks,
        generatorResources,
        goldenVectors: freezeGoldenVectors(
          source.goldenVectors,
          source.expectedGoldenCount,
          version,
        ),
        policy: generatorResources.policy,
      });
      return [version, entry];
    }),
  ),
);

export function dailyGeneratorResourcesForVersion(version: string): DailyGeneratorVersionResources {
  const resources = DAILY_GENERATOR_RESOURCE_REGISTRY[version];
  if (!resources) throw new RangeError(`Unsupported Daily generator version: ${version}.`);
  return resources;
}

export function generatorVersionForDate(dateUtc: string): string {
  compareUtcDates(dateUtc, dateUtc);
  for (let index = DAILY_GENERATOR_SCHEDULE.length - 1; index >= 0; index -= 1) {
    const entry = DAILY_GENERATOR_SCHEDULE[index] as DailyGeneratorScheduleEntry;
    if (compareUtcDates(dateUtc, entry.effectiveFrom) >= 0) return entry.version;
  }
  throw new RangeError(`No Daily generator version is effective for ${dateUtc}.`);
}
