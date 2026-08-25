import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  PUZZLE_TAGS,
  analyzeDifficulty,
  applyPulses,
  assertBoardRows,
  assertPlayablePuzzlePair,
  createDailyGeneratorResources,
  derivePuzzleTags,
  differenceRows,
  factorizeGF2,
  parseUtcDate,
  rankGF2,
  type Difficulty,
  type DifficultyFeatures,
  type EncodedPulse,
  type GameMode,
  type PuzzleDefinition,
  type PuzzleTag,
} from '../src/domain/index.ts';

import { PROJECT_ROOT, projectPath, walkFiles } from './lib/project-files.ts';
import {
  approvalFingerprintFrom,
  assertCanonicalCurationProfileOrder,
  assertCurationMachineScaffold,
  buildCurationEvidence,
  type CurationEvidenceBuild,
  type CurationEvidenceItem,
} from './lib/curation-evidence.ts';

const CONTENT_ROOT = path.join(PROJECT_ROOT, 'src', 'content');
const LEVEL_ROOT = path.join(CONTENT_ROOT, 'levels');
const MANIFEST_FILE = path.join(CONTENT_ROOT, 'level-manifest.v1.json');
const GENERATOR_MAP_FILE = path.join(CONTENT_ROOT, 'generator-map.json');
const FALLBACK_FILE = path.join(CONTENT_ROOT, 'fallbacks', 'v1.json');
const CURATION_FILE = path.join(
  PROJECT_ROOT,
  'AXIS_SHIFT_Harness_KR',
  'evidence',
  'M03',
  'content-curation-v1.md',
);
const EXPECTED_CHAPTERS = ['tutorial', 'pulse', 'echo', 'rank', 'noise'] as const;
const EXPECTED_LEVEL_FILES = new Set(EXPECTED_CHAPTERS.map((chapter) => `${chapter}.json`));
const TAGS: ReadonlySet<string> = new Set(PUZZLE_TAGS);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const TITLE_KEY_PATTERN =
  /^level\.(?:tutorial\.\d{2}|lab\.(?:pulse|echo|rank|noise)\.\d{2})\.title$/u;
const LEVEL_FIELDS = new Set([
  'canonicalSolution',
  'complexityScore',
  'difficulty',
  'generatorVersion',
  'id',
  'initialRows',
  'mode',
  'optimalPulseCount',
  'schemaVersion',
  'seed',
  'size',
  'tags',
  'targetRows',
  'titleKey',
  'tutorialStepIds',
]);
const FALLBACK_FIELDS = new Set([...LEVEL_FIELDS, 'profileId']);
const TAG_ORDER = [...PUZZLE_TAGS];

type Chapter = (typeof EXPECTED_CHAPTERS)[number];
type JsonObject = Record<string, unknown>;
type InitialMode = 'zero' | 'noise-low' | 'noise-mid' | 'noise-high';
type OverlapRequirement = 'any' | 'forbid' | 'require' | 'cancel';

interface TagThresholds {
  readonly denseMin: number;
  readonly overlapMin: number;
  readonly sparseMax: number;
  readonly symmetricMin: number;
}

interface LevelProfile {
  readonly allAxesNonzero: boolean;
  readonly chapter: Chapter;
  readonly compressionGapMin: number;
  readonly difficulty: Difficulty;
  readonly id: string;
  readonly initialMode: InitialMode;
  readonly mode: GameMode;
  readonly order: number;
  readonly overlap: OverlapRequirement;
  readonly rank: number;
  readonly requiredTags: readonly PuzzleTag[];
  readonly size: number;
  readonly titleKey: string;
  readonly tutorialShape?: string;
  readonly tutorialStepIds?: readonly string[];
}

interface LevelManifest {
  readonly candidateSeed: string;
  readonly catalogVersion: string;
  readonly generatorVersion: string;
  readonly maxAttemptsPerLevel: number;
  readonly profiles: readonly LevelProfile[];
  readonly schemaVersion: 1;
  readonly tagThresholds: TagThresholds;
}

interface NumericRange {
  readonly max: number;
  readonly min: number;
}

interface RawGeneratorMap {
  readonly distributionTargets: {
    readonly difficulty: Readonly<Record<string, NumericRange>>;
    readonly rank: Readonly<Record<string, NumericRange>>;
    readonly size: Readonly<Record<string, NumericRange>>;
  };
  readonly profiles: readonly JsonObject[];
  readonly version: string;
}

interface RawGeneratorRegistry {
  readonly defaultVersion: string;
  readonly schedule: readonly {
    readonly effectiveFrom: string;
    readonly version: string;
  }[];
  readonly schemaVersion: 1;
  readonly versions: Readonly<Record<string, RawGeneratorMap>>;
}

interface ValidationCounters {
  fallbackChecks: number;
  rankChecks: number;
  solutionChecks: number;
  tagChecks: number;
}

interface ValidatedLevel {
  readonly attempt: number;
  readonly features: DifficultyFeatures;
  readonly record: JsonObject;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireObject(value: unknown, label: string): JsonObject {
  if (!isObject(value)) throw new TypeError(`${label} must be an object.`);
  return value;
}

function requireArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  return value;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim() !== value || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty trimmed string.`);
  }
  return value;
}

function requireInteger(value: unknown, label: string, minimum: number, maximum: number): number {
  if (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    throw new RangeError(`${label} must be an integer in ${minimum}..${maximum}.`);
  }
  return value as number;
}

function assertOnlyFields(record: JsonObject, allowed: ReadonlySet<string>, label: string): void {
  const unexpected = Object.keys(record).filter((key) => !allowed.has(key));
  if (unexpected.length > 0) {
    throw new TypeError(`${label} contains unsupported fields: ${unexpected.join(', ')}.`);
  }
}

async function readJson<T>(filename: string): Promise<T> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(filename, 'utf8')) as unknown;
  } catch (error) {
    throw new Error(`${projectPath(filename)} is not valid JSON.`, { cause: error });
  }
  return parsed as T;
}

function rowsFrom(value: unknown, size: number, label: string): number[] {
  assertBoardRows(value, size, label);
  return [...value];
}

function pulsesFrom(value: unknown, size: number, label: string): EncodedPulse[] {
  const mask = (1 << size) - 1;
  return requireArray(value, label).map((pulseValue, index) => {
    const pulse = requireObject(pulseValue, `${label}[${index}]`);
    assertOnlyFields(pulse, new Set(['colMask', 'rowMask']), `${label}[${index}]`);
    return {
      colMask: requireInteger(pulse.colMask, `${label}[${index}].colMask`, 1, mask),
      rowMask: requireInteger(pulse.rowMask, `${label}[${index}].rowMask`, 1, mask),
    };
  });
}

function tagsFrom(value: unknown, label: string): PuzzleTag[] {
  const tags = requireArray(value, label).map((tag, index) => {
    if (typeof tag !== 'string' || !TAGS.has(tag)) {
      throw new TypeError(`${label}[${index}] is unsupported.`);
    }
    return tag as PuzzleTag;
  });
  if (new Set(tags).size !== tags.length) throw new Error(`${label} contains duplicates.`);
  const sorted = TAG_ORDER.filter((tag) => tags.includes(tag));
  if (JSON.stringify(tags) !== JSON.stringify(sorted)) {
    throw new Error(`${label} is not in canonical tag order.`);
  }
  return tags;
}

function cancellationCells(size: number, pulses: readonly EncodedPulse[]): number {
  let result = 0;
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      let touches = 0;
      for (const pulse of pulses) {
        if ((pulse.rowMask & (1 << row)) !== 0 && (pulse.colMask & (1 << column)) !== 0) {
          touches += 1;
        }
      }
      if (touches >= 2 && touches % 2 === 0) result += 1;
    }
  }
  return result;
}

function initialRange(mode: InitialMode): readonly [number, number] {
  if (mode === 'noise-low') return [0.125, 0.25];
  if (mode === 'noise-mid') return [0.2, 0.36];
  if (mode === 'noise-high') return [0.25, 0.45];
  return [0, 0];
}

function samePulses(left: readonly EncodedPulse[], right: readonly EncodedPulse[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validateTutorialShape(
  profile: LevelProfile,
  pulses: readonly EncodedPulse[],
  features: DifficultyFeatures,
): void {
  if (profile.mode !== 'tutorial') return;
  if (!profile.tutorialShape || !profile.tutorialStepIds || profile.tutorialStepIds.length === 0) {
    throw new Error(`${profile.id} lacks its tutorial shape or step contract.`);
  }
  if (profile.tutorialShape === 'echo') {
    if (pulses.length !== 2 || cancellationCells(profile.size, pulses) < 1) {
      throw new Error(`${profile.id} does not demonstrate echo cancellation.`);
    }
    return;
  }
  if (pulses.length !== 1 || features.rank !== 1) {
    throw new Error(`${profile.id} tutorial shape must be one canonical PULSE.`);
  }
  const pulse = pulses[0] as EncodedPulse;
  const rowCount = pulse.rowMask.toString(2).replaceAll('0', '').length;
  const columnCount = pulse.colMask.toString(2).replaceAll('0', '').length;
  const expected =
    profile.tutorialShape === 'single-row'
      ? [1, 2]
      : profile.tutorialShape === 'single-column'
        ? [2, 1]
        : profile.tutorialShape === 'single-cell'
          ? [1, 1]
          : profile.tutorialShape === 'first-pulse'
            ? [1, 2]
            : [2, 2];
  if (rowCount !== expected[0] || columnCount !== expected[1]) {
    throw new Error(`${profile.id} tutorial shape changed from ${expected.join('x')}.`);
  }
}

function validateLevelRecord(
  record: JsonObject,
  profile: LevelProfile,
  manifest: LevelManifest,
  counters: ValidationCounters,
): ValidatedLevel {
  assertOnlyFields(record, LEVEL_FIELDS, profile.id);
  if (record.schemaVersion !== 1) throw new Error(`${profile.id}.schemaVersion must be 1.`);
  if (record.id !== profile.id || !ID_PATTERN.test(profile.id)) {
    throw new Error(`${profile.id} does not match its frozen manifest ID.`);
  }
  if (record.mode !== profile.mode) throw new Error(`${profile.id}.mode changed.`);
  if (record.generatorVersion !== manifest.generatorVersion) {
    throw new Error(`${profile.id}.generatorVersion changed.`);
  }
  const seed = requireString(record.seed, `${profile.id}.seed`);
  const seedPrefix = `axis-shift|curation|${manifest.generatorVersion}|${manifest.candidateSeed}|${profile.id}|`;
  if (!seed.startsWith(seedPrefix) || !/^\d+$/u.test(seed.slice(seedPrefix.length))) {
    throw new Error(`${profile.id}.seed is not a reproducible curation seed.`);
  }
  const attempt = Number(seed.slice(seedPrefix.length));
  if (attempt < 0 || attempt >= manifest.maxAttemptsPerLevel) {
    throw new Error(`${profile.id}.seed attempt is outside the frozen manifest range.`);
  }
  if (record.size !== profile.size) throw new Error(`${profile.id}.size changed.`);
  const initialRows = rowsFrom(record.initialRows, profile.size, `${profile.id}.initialRows`);
  const targetRows = rowsFrom(record.targetRows, profile.size, `${profile.id}.targetRows`);
  assertPlayablePuzzlePair(initialRows, targetRows, profile.size);
  const difference = differenceRows(initialRows, targetRows, profile.size);
  const actualRank = rankGF2(difference, profile.size);
  counters.rankChecks += 1;
  if (record.optimalPulseCount !== profile.rank || actualRank !== profile.rank) {
    throw new Error(`${profile.id} rank/Par does not match manifest rank ${profile.rank}.`);
  }
  const storedPulses = pulsesFrom(
    record.canonicalSolution,
    profile.size,
    `${profile.id}.canonicalSolution`,
  );
  const canonicalPulses = factorizeGF2(difference, profile.size);
  if (!samePulses(storedPulses, canonicalPulses)) {
    throw new Error(`${profile.id}.canonicalSolution is not the canonical factorization.`);
  }
  if (
    applyPulses(initialRows, profile.size, storedPulses).some(
      (row, index) => row !== targetRows[index],
    )
  ) {
    throw new Error(`${profile.id}.canonicalSolution does not reach targetRows.`);
  }
  counters.solutionChecks += 1;
  const features = analyzeDifficulty(initialRows, targetRows, profile.size);
  if (record.complexityScore !== features.complexityScore) {
    throw new Error(`${profile.id}.complexityScore is stale.`);
  }
  const tags = tagsFrom(record.tags, `${profile.id}.tags`);
  const expectedTags = derivePuzzleTags(
    features,
    manifest.tagThresholds,
    profile.mode === 'tutorial',
  );
  if (JSON.stringify(tags) !== JSON.stringify(expectedTags)) {
    throw new Error(`${profile.id}.tags do not match computed features.`);
  }
  if (!profile.requiredTags.every((tag) => tags.includes(tag))) {
    throw new Error(`${profile.id} lacks a required profile tag.`);
  }
  counters.tagChecks += 1;
  if (record.difficulty !== profile.difficulty) {
    throw new Error(`${profile.id}.difficulty changed from its manifest profile.`);
  }
  if (record.titleKey !== profile.titleKey || !TITLE_KEY_PATTERN.test(profile.titleKey)) {
    throw new Error(`${profile.id}.titleKey changed or is malformed.`);
  }
  const actualSteps = record.tutorialStepIds;
  if (profile.mode === 'tutorial') {
    if (JSON.stringify(actualSteps) !== JSON.stringify(profile.tutorialStepIds)) {
      throw new Error(`${profile.id}.tutorialStepIds changed.`);
    }
  } else if (actualSteps !== undefined) {
    throw new Error(`${profile.id} Lab record must not contain tutorialStepIds.`);
  }
  if (features.compressionGap < profile.compressionGapMin) {
    throw new Error(`${profile.id} compression gap is below its profile.`);
  }
  if (
    profile.allAxesNonzero &&
    (features.nonzeroRows !== profile.size || features.nonzeroCols !== profile.size)
  ) {
    throw new Error(`${profile.id} does not cover every row and column.`);
  }
  if (profile.overlap === 'forbid' && features.overlapIndex !== 0) {
    throw new Error(`${profile.id} unexpectedly requires overlap.`);
  }
  if (
    (profile.overlap === 'require' || profile.overlap === 'cancel') &&
    features.overlapIndex <= 0
  ) {
    throw new Error(`${profile.id} lacks required overlap.`);
  }
  if (profile.overlap === 'cancel' && cancellationCells(profile.size, storedPulses) < 1) {
    throw new Error(`${profile.id} lacks an even-touch cancellation cell.`);
  }
  const [minimumInitial, maximumInitial] = initialRange(profile.initialMode);
  if (features.initialDensity < minimumInitial || features.initialDensity > maximumInitial) {
    throw new Error(`${profile.id} initial density is outside its learning profile.`);
  }
  if (
    profile.mode === 'lab' &&
    (features.density < 0.22 ||
      features.density > 0.68 ||
      features.targetDensity < 0.22 ||
      features.targetDensity > 0.68)
  ) {
    throw new Error(`${profile.id} Lab density is outside 0.22..0.68.`);
  }
  validateTutorialShape(profile, storedPulses, features);
  return Object.freeze({ attempt, features, record });
}

function requireDistinct(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) throw new Error(`${label} contains duplicates.`);
}

function assertCanonicalChapterLevelOrder(
  actualIds: readonly string[],
  manifest: LevelManifest,
  chapter: Chapter,
): void {
  const expectedIds = manifest.profiles
    .filter((profile) => profile.chapter === chapter)
    .map((profile) => profile.id);
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    throw new Error(`${chapter}.json levels must match the canonical manifest ID order exactly.`);
  }
}

function validateManifest(manifest: LevelManifest): void {
  const manifestRecord = requireObject(manifest, 'levelManifest');
  assertOnlyFields(
    manifestRecord,
    new Set([
      'candidateSeed',
      'catalogVersion',
      'generatorVersion',
      'maxAttemptsPerLevel',
      'profiles',
      'schemaVersion',
      'tagThresholds',
    ]),
    'levelManifest',
  );
  if (
    manifest.schemaVersion !== 1 ||
    manifest.catalogVersion !== 'content-v1' ||
    manifest.generatorVersion !== 'v1' ||
    manifest.candidateSeed !== 'axis-shift-curation-v1' ||
    manifest.maxAttemptsPerLevel !== 512
  ) {
    throw new Error('The v1 level manifest header changed.');
  }
  const thresholds = requireObject(manifest.tagThresholds, 'levelManifest.tagThresholds');
  assertOnlyFields(
    thresholds,
    new Set(['denseMin', 'overlapMin', 'sparseMax', 'symmetricMin']),
    'levelManifest.tagThresholds',
  );
  if (
    thresholds.sparseMax !== 0.35 ||
    thresholds.denseMin !== 0.55 ||
    thresholds.symmetricMin !== 0.9 ||
    thresholds.overlapMin !== 0.05
  ) {
    throw new Error('The frozen v1 tag thresholds changed.');
  }
  if (!Array.isArray(manifest.profiles) || manifest.profiles.length !== 54) {
    throw new Error('The level manifest must contain exactly 54 profiles.');
  }
  assertCanonicalCurationProfileOrder(manifest.profiles);
  requireDistinct(
    manifest.profiles.map((profile) => profile.id),
    'manifest IDs',
  );
  requireDistinct(
    manifest.profiles.map((profile) => profile.titleKey),
    'manifest title keys',
  );
  const counts = new Map<Chapter, number>();
  const orders = new Map<Chapter, number[]>();
  const profileFields = new Set([
    'allAxesNonzero',
    'chapter',
    'compressionGapMin',
    'difficulty',
    'id',
    'initialMode',
    'mode',
    'order',
    'overlap',
    'rank',
    'requiredTags',
    'size',
    'titleKey',
    'tutorialShape',
    'tutorialStepIds',
  ]);
  const tutorialContracts = [
    ['single-row', 'tutorial.select-row'],
    ['single-column', 'tutorial.select-column'],
    ['single-cell', 'tutorial.preview-intersection'],
    ['first-pulse', 'tutorial.execute-pulse'],
    ['multi-axis', 'tutorial.select-multiple-axes'],
    ['echo', 'tutorial.observe-echo'],
  ] as const;

  for (const profile of manifest.profiles) {
    const profileRecord = requireObject(profile, 'levelManifest.profile');
    assertOnlyFields(profileRecord, profileFields, `levelManifest.profile.${String(profile.id)}`);
    if (!EXPECTED_CHAPTERS.includes(profile.chapter)) {
      throw new Error(`${profile.id} has an unsupported chapter.`);
    }
    const id = requireString(profile.id, 'levelManifest.profile.id');
    const titleKey = requireString(profile.titleKey, `${id}.titleKey`);
    const size = requireInteger(profile.size, `${id}.size`, 3, 8);
    const order = requireInteger(profile.order, `${id}.order`, 1, 12);
    requireInteger(profile.rank, `${id}.rank`, 1, size);
    requireInteger(profile.compressionGapMin, `${id}.compressionGapMin`, 0, size - 1);
    if (!ID_PATTERN.test(id) || !TITLE_KEY_PATTERN.test(titleKey)) {
      throw new Error(`${id} has a malformed ID or title key.`);
    }
    if (typeof profile.allAxesNonzero !== 'boolean') {
      throw new TypeError(`${id}.allAxesNonzero must be boolean.`);
    }
    const allowedDifficulties =
      profile.chapter === 'tutorial' ? ['intro'] : ['easy', 'normal', 'hard', 'master'];
    if (!allowedDifficulties.includes(profile.difficulty)) {
      throw new TypeError(`${id}.difficulty is unsupported.`);
    }
    if (!['zero', 'noise-low', 'noise-mid', 'noise-high'].includes(profile.initialMode)) {
      throw new TypeError(`${id}.initialMode is unsupported.`);
    }
    if (!['any', 'forbid', 'require', 'cancel'].includes(profile.overlap)) {
      throw new TypeError(`${id}.overlap is unsupported.`);
    }
    const expectedMode = profile.chapter === 'tutorial' ? 'tutorial' : 'lab';
    if (profile.mode !== expectedMode) {
      throw new Error(`${id}.mode must be ${expectedMode} for chapter ${profile.chapter}.`);
    }
    const requiredTags = requireArray(profile.requiredTags, `${id}.requiredTags`);
    if (requiredTags.some((tag) => typeof tag !== 'string' || !TAGS.has(tag))) {
      throw new Error(`${id} has unsupported requiredTags.`);
    }
    const tagStrings = requiredTags as PuzzleTag[];
    requireDistinct(tagStrings, `${id}.requiredTags`);
    if (profile.chapter === 'tutorial') {
      const contract = tutorialContracts[order - 1];
      if (
        contract === undefined ||
        profile.tutorialShape !== contract[0] ||
        JSON.stringify(profile.tutorialStepIds) !== JSON.stringify([contract[1]])
      ) {
        throw new Error(`${id} changed the frozen Tutorial shape or step contract.`);
      }
      if (!tagStrings.includes('tutorial')) {
        throw new Error(`${id} Tutorial profile must require the tutorial tag.`);
      }
    } else if (profile.tutorialShape !== undefined || profile.tutorialStepIds !== undefined) {
      throw new Error(`${id} Lab profile must not define Tutorial-only fields.`);
    }
    counts.set(profile.chapter, (counts.get(profile.chapter) ?? 0) + 1);
    orders.set(profile.chapter, [...(orders.get(profile.chapter) ?? []), order]);
  }

  if (
    counts.get('tutorial') !== 6 ||
    counts.get('pulse') !== 12 ||
    counts.get('echo') !== 12 ||
    counts.get('rank') !== 12 ||
    counts.get('noise') !== 12
  ) {
    throw new Error('The manifest must contain Tutorial 6 and four Lab chapters of 12.');
  }
  for (const chapter of EXPECTED_CHAPTERS) {
    const actual = [...(orders.get(chapter) ?? [])].sort((left, right) => left - right);
    const expected = Array.from(
      { length: chapter === 'tutorial' ? 6 : 12 },
      (_, index) => index + 1,
    );
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${chapter} orders must be exactly 1..${expected.length}.`);
    }
  }
}

function manifestValidatorSelfChecks(manifest: LevelManifest): number {
  const expectRejected = (mutate: (clone: JsonObject) => void): number => {
    const clone = JSON.parse(JSON.stringify(manifest)) as JsonObject;
    mutate(clone);
    try {
      validateManifest(clone as unknown as LevelManifest);
    } catch {
      return 1;
    }
    throw new Error('Manifest validator self-check accepted an invalid mutation.');
  };
  let checks = 0;
  checks += expectRejected((clone) => {
    requireObject(requireArray(clone.profiles, 'profiles')[6], 'profile').mode = 'tutorial';
  });
  checks += expectRejected((clone) => {
    requireObject(requireArray(clone.profiles, 'profiles')[1], 'profile').order = 1;
  });
  checks += expectRejected((clone) => {
    requireObject(clone.tagThresholds, 'tagThresholds').sparseMax = 0.4;
  });
  checks += expectRejected((clone) => {
    requireObject(requireArray(clone.profiles, 'profiles')[0], 'profile').tutorialShape = 'unknown';
  });
  checks += expectRejected((clone) => {
    const profiles = requireArray(clone.profiles, 'profiles');
    const first = profiles[0];
    profiles[0] = profiles[1];
    profiles[1] = first;
  });
  const pulseIds = manifest.profiles
    .filter((profile) => profile.chapter === 'pulse')
    .map((profile) => profile.id);
  assertCanonicalChapterLevelOrder(pulseIds, manifest, 'pulse');
  checks += 1;
  const reorderedPulseIds = [...pulseIds];
  const firstPulseId = reorderedPulseIds[0];
  const secondPulseId = reorderedPulseIds[1];
  if (firstPulseId === undefined || secondPulseId === undefined) {
    throw new Error('Chapter order validator self-check requires at least two Pulse levels.');
  }
  reorderedPulseIds[0] = secondPulseId;
  reorderedPulseIds[1] = firstPulseId;
  try {
    assertCanonicalChapterLevelOrder(reorderedPulseIds, manifest, 'pulse');
  } catch {
    checks += 1;
    return checks;
  }
  throw new Error('Chapter order validator self-check accepted reordered level records.');
}
function validateGeneratorRegistry(value: RawGeneratorRegistry): RawGeneratorMap {
  const root = requireObject(value, 'generatorMap');
  assertOnlyFields(
    root,
    new Set(['defaultVersion', 'schedule', 'schemaVersion', 'versions']),
    'generatorMap',
  );
  if (root.schemaVersion !== 1 || root.defaultVersion !== 'v1') {
    throw new Error('generatorMap must declare schemaVersion=1 and defaultVersion=v1.');
  }
  const versions = requireObject(root.versions, 'generatorMap.versions');
  if (JSON.stringify(Object.keys(versions).sort()) !== JSON.stringify(['v1'])) {
    throw new Error('generatorMap.versions must contain exactly v1 for M03.');
  }
  const policy = requireObject(
    versions.v1,
    'generatorMap.versions.v1',
  ) as unknown as RawGeneratorMap;
  if (policy.version !== 'v1') {
    throw new Error('generatorMap.versions.v1.version must be v1.');
  }
  const schedule = requireArray(root.schedule, 'generatorMap.schedule');
  if (schedule.length !== 1) {
    throw new Error('generatorMap.schedule must contain the single M03 v1 boundary.');
  }
  const boundary = requireObject(schedule[0], 'generatorMap.schedule[0]');
  assertOnlyFields(boundary, new Set(['effectiveFrom', 'version']), 'generatorMap.schedule[0]');
  if (boundary.effectiveFrom !== '2026-01-01' || boundary.version !== 'v1') {
    throw new Error('generatorMap.schedule must begin with 2026-01-01 -> v1.');
  }
  return policy;
}

function validateDistributionTargets(generatorMap: RawGeneratorMap): number {
  const expected = {
    difficulty: ['easy', 'hard', 'normal'],
    rank: ['2', '3', '4'],
    size: ['4', '5', '6'],
  } as const;
  let checks = 0;
  for (const [groupName, expectedKeys] of Object.entries(expected)) {
    const group = generatorMap.distributionTargets[groupName as keyof typeof expected];
    if (!isObject(group)) throw new Error(`distributionTargets.${groupName} is missing.`);
    const keys = Object.keys(group).sort();
    if (JSON.stringify(keys) !== JSON.stringify([...expectedKeys].sort())) {
      throw new Error(`distributionTargets.${groupName} keys changed.`);
    }
    for (const key of keys) {
      const range = requireObject(group[key], `distributionTargets.${groupName}.${key}`);
      const minimum = range.min;
      const maximum = range.max;
      if (
        typeof minimum !== 'number' ||
        typeof maximum !== 'number' ||
        !Number.isFinite(minimum) ||
        !Number.isFinite(maximum) ||
        minimum < 0 ||
        maximum > 1 ||
        minimum > maximum
      ) {
        throw new Error(`distributionTargets.${groupName}.${key} is invalid.`);
      }
      checks += 1;
    }
  }
  return checks;
}
function within(value: number, range: { readonly min: number; readonly max: number }): boolean {
  return value >= range.min && value <= range.max;
}

function validateFallbackRecord(
  record: JsonObject,
  rawMap: RawGeneratorMap,
  counters: ValidationCounters,
): void {
  const id = requireString(record.id, 'fallback.id');
  assertOnlyFields(record, FALLBACK_FIELDS, id);
  const profileId = requireString(record.profileId, `${id}.profileId`);
  const profile = rawMap.profiles.find((candidate) => candidate.id === profileId);
  if (!profile) throw new Error(`${id} references an unknown profile.`);
  const size = requireInteger(record.size, `${id}.size`, 3, 8);
  if (size !== profile.size) throw new Error(`${id}.size does not match its profile.`);
  const initialRows = rowsFrom(record.initialRows, size, `${id}.initialRows`);
  const targetRows = rowsFrom(record.targetRows, size, `${id}.targetRows`);
  assertPlayablePuzzlePair(initialRows, targetRows, size);
  const difference = differenceRows(initialRows, targetRows, size);
  const features = analyzeDifficulty(initialRows, targetRows, size);
  const canonical = factorizeGF2(difference, size);
  const stored = pulsesFrom(record.canonicalSolution, size, `${id}.canonicalSolution`);
  if (!samePulses(stored, canonical) || record.optimalPulseCount !== rankGF2(difference, size)) {
    throw new Error(`${id} has stale fallback Par or canonical solution.`);
  }
  if (applyPulses(initialRows, size, stored).some((row, index) => row !== targetRows[index])) {
    throw new Error(`${id} fallback solution does not reach target.`);
  }
  if (record.schemaVersion !== 1 || record.mode !== 'daily' || record.generatorVersion !== 'v1') {
    throw new Error(`${id} fallback header is invalid.`);
  }
  if (
    record.difficulty !== profile.difficulty ||
    record.complexityScore !== features.complexityScore
  ) {
    throw new Error(`${id} fallback difficulty metadata is stale.`);
  }
  const rawThresholds = requireObject(
    (rawMap as unknown as JsonObject).tagThresholds,
    'generatorMap.tagThresholds',
  ) as unknown as TagThresholds;
  const expectedTags = derivePuzzleTags(features, rawThresholds, false);
  if (JSON.stringify(tagsFrom(record.tags, `${id}.tags`)) !== JSON.stringify(expectedTags)) {
    throw new Error(`${id} fallback tags are stale.`);
  }
  for (const field of [
    'rank',
    'initialDensity',
    'density',
    'targetDensity',
    'nonzeroRows',
    'nonzeroCols',
    'compressionGap',
    'overlapIndex',
    'symmetryScore',
    'complexityScore',
  ] as const) {
    const range = requireObject(profile[field], `${profileId}.${field}`) as unknown as NumericRange;
    const actual =
      field === 'rank'
        ? features.rank
        : field === 'initialDensity'
          ? features.initialDensity
          : field === 'density'
            ? features.density
            : field === 'targetDensity'
              ? features.targetDensity
              : field === 'nonzeroRows'
                ? features.nonzeroRows
                : field === 'nonzeroCols'
                  ? features.nonzeroCols
                  : field === 'compressionGap'
                    ? features.compressionGap
                    : field === 'overlapIndex'
                      ? features.overlapIndex
                      : field === 'symmetryScore'
                        ? features.symmetryScore
                        : features.complexityScore;
    if (!within(actual, range)) throw new Error(`${id} violates fallback profile ${field}.`);
  }
  counters.rankChecks += 1;
  counters.solutionChecks += 1;
  counters.tagChecks += 1;
  counters.fallbackChecks += 1;
}

function validatorSelfChecks(): number {
  let checks = 0;
  try {
    requireDistinct(['same', 'same'], 'self-check duplicate');
    throw new Error('Duplicate guard self-check did not fail.');
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('duplicates')) throw error;
    checks += 1;
  }
  try {
    tagsFrom(['tutorial', 'sparse'], 'self-check tag order');
    throw new Error('Tag order self-check did not fail.');
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('canonical')) throw error;
    checks += 1;
  }
  const difference = [3, 0, 3];
  const canonical = factorizeGF2(difference, 3);
  if (canonical.length !== 1 || rankGF2(difference, 3) !== 1) {
    throw new Error('Rank/canonical self-check failed.');
  }
  checks += 2;
  return checks;
}

type CurationStatus = 'APPROVED' | 'PENDING';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function singleCurationStatus(
  section: string,
  label: string,
  allowed: readonly string[],
  levelId: string,
): string {
  const pattern = new RegExp(
    `^- ${escapeRegex(label)}: \\*\\*(${allowed.map(escapeRegex).join('|')})\\*\\*$`,
    'gmu',
  );
  const matches = [...section.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error(`${levelId} must bind exactly one ${label} verdict.`);
  }
  return matches[0]?.[1] as string;
}

function singleMetadata(markdown: string, label: string): string {
  const pattern = new RegExp(`^- ${escapeRegex(label)}: \\*\\*([^*\\r\\n]+)\\*\\*$`, 'gmu');
  const matches = [...markdown.matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`Curation metadata ${label} must occur exactly once.`);
  const value = matches[0]?.[1] as string;
  if (value.length === 0 || value !== value.trim()) {
    throw new Error(`Curation metadata ${label} must be trimmed and non-empty.`);
  }
  return value;
}

function validateReviewedAt(value: string): void {
  if (value === 'PENDING') return;
  const match =
    /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?(Z|([+-])(\d{2}):(\d{2}))$/u.exec(
      value,
    );
  if (!match) {
    throw new Error('Curation Reviewed at must be an RFC3339 timestamp with timezone.');
  }
  parseUtcDate(match[1] as string);
  const hour = Number(match[2]);
  const minute = Number(match[3]);
  const second = Number(match[4]);
  const offsetHour = match[6] === 'Z' ? 0 : Number(match[8]);
  const offsetMinute = match[6] === 'Z' ? 0 : Number(match[9]);
  if (
    hour > 23 ||
    minute > 59 ||
    second > 59 ||
    offsetHour > 14 ||
    offsetMinute > 59 ||
    (offsetHour === 14 && offsetMinute !== 0) ||
    !Number.isFinite(Date.parse(value))
  ) {
    throw new Error('Curation Reviewed at contains an invalid timestamp.');
  }
}

function curationStatus(
  markdown: string,
  expectedEvidence: CurationEvidenceBuild,
  expectedIds: readonly string[],
): CurationStatus {
  const hashMatches = [...markdown.matchAll(/^- Catalog SHA-256: `([0-9a-f]{64})`$/gmu)];
  if (hashMatches.length !== 1 || hashMatches[0]?.[1] !== expectedEvidence.catalogHash) {
    throw new Error('Curation atlas catalog hash is missing, duplicated, or stale.');
  }
  const approvalFingerprint = approvalFingerprintFrom(markdown);
  if (approvalFingerprint !== expectedEvidence.approvalFingerprint) {
    throw new Error('Curation approval fingerprint is missing or stale.');
  }

  const progressionMarker = '## 학습 순서 승인';
  const atlasMarker = '## 개별 후보 atlas';
  const completionMarker = '## 완료 조건';
  const progressionStart = markdown.indexOf(progressionMarker);
  const atlasStart = markdown.indexOf(atlasMarker);
  const completionStart = markdown.indexOf(completionMarker);
  if (
    progressionStart < 0 ||
    atlasStart <= progressionStart ||
    completionStart <= atlasStart ||
    markdown.indexOf(progressionMarker, progressionStart + 1) !== -1 ||
    markdown.indexOf(atlasMarker, atlasStart + 1) !== -1 ||
    markdown.indexOf(completionMarker, completionStart + 1) !== -1
  ) {
    throw new Error('Curation atlas top-level sections are missing, duplicated, or out of order.');
  }

  const expectedProgressionLabels = [
    'Tutorial 1→6',
    'Pulse 01→12',
    'Echo 01→12',
    'Rank 01→12',
    'Noise 01→12',
  ];
  const progressionBlock = markdown.slice(progressionStart, atlasStart);
  const progressionRows = [
    ...progressionBlock.matchAll(
      /^\| ([^|\r\n]+) \| [^|\r\n]* \| [^|\r\n]* \| (PENDING|PASS) \| [^|\r\n]* \|$/gmu,
    ),
  ];
  if (
    JSON.stringify(progressionRows.map((match) => match[1])) !==
    JSON.stringify(expectedProgressionLabels)
  ) {
    throw new Error('Curation progression rows must be the five unique frozen rows in order.');
  }

  const atlasBody = markdown.slice(atlasStart + atlasMarker.length, completionStart);
  const headingMatches = [...atlasBody.matchAll(/^### ([a-z0-9]+(?:-[a-z0-9]+)*)[ \t]*\r?$/gmu)];
  const actualIds = headingMatches.map((match) => match[1] as string);
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    throw new Error('Curation atlas headings must match the manifest ID set and order exactly.');
  }
  if (headingMatches.length === 0 || atlasBody.slice(0, headingMatches[0]?.index ?? 0).trim()) {
    throw new Error('Curation atlas contains unbound content before its first level heading.');
  }

  const decisions: string[] = [];
  const readability: string[] = [];
  const progression: string[] = [];
  const unpleasant: string[] = [];
  for (let index = 0; index < headingMatches.length; index += 1) {
    const heading = headingMatches[index] as RegExpMatchArray;
    const id = actualIds[index] as string;
    const start = (heading.index as number) + heading[0].length;
    const end = headingMatches[index + 1]?.index ?? atlasBody.length;
    const section = atlasBody.slice(start, end);
    for (const marker of ['INITIAL', 'TARGET', 'DIFFERENCE']) {
      const markers = [...section.matchAll(new RegExp(`^${marker}$`, 'gmu'))];
      if (markers.length !== 1) throw new Error(`${id} must contain exactly one ${marker} board.`);
    }
    readability.push(
      singleCurationStatus(section, 'Pattern readability', ['PENDING', 'PASS', 'REPLACE'], id),
    );
    progression.push(
      singleCurationStatus(section, 'Difficulty/progression', ['PENDING', 'PASS', 'REPLACE'], id),
    );
    unpleasant.push(
      singleCurationStatus(
        section,
        'Unpleasant or misleading pattern',
        ['PENDING', 'PASS', 'NONE', 'REPLACE'],
        id,
      ),
    );
    decisions.push(
      singleCurationStatus(section, 'Human decision', ['PENDING', 'PASS', 'REPLACE'], id),
    );
  }

  const expectedCompletionLabels = [
    '54/54 Pattern readability PASS',
    '54/54 Difficulty/progression PASS 또는 사람 근거를 남긴 재분류',
    'Tutorial + Lab 4 chapter 학습 순서 5/5 PASS',
    'replacement pending=0',
    'reviewer/time/overall decision 기입',
  ];
  const completionItems = [
    ...markdown.slice(completionStart).matchAll(/^- \[([ x])\] ([^\r\n]+)$/gmu),
  ];
  if (
    JSON.stringify(completionItems.map((match) => match[2])) !==
    JSON.stringify(expectedCompletionLabels)
  ) {
    throw new Error('Curation completion items must be the five unique frozen checks in order.');
  }

  const reviewer = singleMetadata(markdown, 'Human reviewer');
  const reviewedAt = singleMetadata(markdown, 'Reviewed at');
  const overallDecision = singleMetadata(markdown, 'Overall decision');
  validateReviewedAt(reviewedAt);
  assertCurationMachineScaffold(markdown, expectedEvidence.pendingMarkdown);
  const progressionStates = progressionRows.map((match) => match[2] as string);
  const completionStates = completionItems.map((match) => match[1] as string);

  const allLevelFieldsPending = [decisions, readability, progression, unpleasant].every((values) =>
    values.every((value) => value === 'PENDING'),
  );
  const allMetadataPending =
    reviewer === 'PENDING' && reviewedAt === 'PENDING' && overallDecision === 'PENDING';
  if (
    allLevelFieldsPending &&
    progressionStates.every((value) => value === 'PENDING') &&
    completionStates.every((value) => value === ' ') &&
    allMetadataPending
  ) {
    return 'PENDING';
  }

  const allLevelsApproved =
    decisions.every((value) => value === 'PASS') &&
    readability.every((value) => value === 'PASS') &&
    progression.every((value) => value === 'PASS') &&
    unpleasant.every((value) => value === 'PASS' || value === 'NONE');
  const metadataApproved =
    reviewer !== 'PENDING' && reviewedAt !== 'PENDING' && overallDecision === 'APPROVED';
  if (
    allLevelsApproved &&
    progressionStates.every((value) => value === 'PASS') &&
    completionStates.every((value) => value === 'x') &&
    metadataApproved
  ) {
    return 'APPROVED';
  }
  throw new Error('Curation evidence is partial or internally inconsistent.');
}

function curationParserSelfChecks(
  markdown: string,
  expectedEvidence: CurationEvidenceBuild,
  expectedIds: readonly string[],
): number {
  const expectRejected = (mutated: string): number => {
    if (mutated === markdown)
      throw new Error('Curation parser self-check mutation made no change.');
    try {
      curationStatus(mutated, expectedEvidence, expectedIds);
    } catch {
      return 1;
    }
    throw new Error('Curation parser self-check accepted an invalid mutation.');
  };
  const firstId = expectedIds[0] as string;
  const secondId = expectedIds[1] as string;
  const fingerprintLine = `- Approval fingerprint SHA-256: \`${expectedEvidence.approvalFingerprint}\``;
  const staleFingerprint = `${expectedEvidence.approvalFingerprint[0] === '0' ? '1' : '0'}${expectedEvidence.approvalFingerprint.slice(1)}`;
  let checks = 0;
  checks += expectRejected(markdown.replace(`### ${secondId}`, `### ${firstId}`));
  checks += expectRejected(
    markdown.replace(
      /^- Human decision: \*\*(?:PENDING|PASS|REPLACE)\*\*$/mu,
      '- Human decision: **UNKNOWN**',
    ),
  );
  checks += expectRejected(markdown.replace('| Pulse 01→12 |', '| Tutorial 1→6 |'));
  checks += expectRejected(
    markdown
      .replace(`### ${firstId}`, '### curation-swap-sentinel')
      .replace(`### ${secondId}`, `### ${firstId}`)
      .replace('### curation-swap-sentinel', `### ${secondId}`),
  );
  checks += expectRejected(
    markdown.replace(expectedEvidence.approvalFingerprint, staleFingerprint),
  );
  checks += expectRejected(markdown.replace('- titleKey:', '- stale-titleKey:'));
  checks += expectRejected(
    markdown.replace(/^- Human reviewer: \*\*[^*\r\n]+\*\*$/mu, '- Human reviewer: **   **'),
  );
  checks += expectRejected(
    markdown.replace(
      /^- Reviewed at: \*\*[^*\r\n]+\*\*$/mu,
      '- Reviewed at: **2026-02-30T00:00:00+09:00**',
    ),
  );
  checks += expectRejected(
    markdown.replace(fingerprintLine, `${fingerprintLine}\n${fingerprintLine}`),
  );
  checks += expectRejected(`${markdown}unexpected machine scaffold line\n`);
  validateReviewedAt('2026-08-26T12:34:56+09:00');
  checks += 1;
  return checks;
}
function parseValidationArguments(argumentsList: readonly string[]): {
  readonly allowPendingCuration: boolean;
} {
  const allowedFlag = '--allow-pending-curation';
  const unexpected = argumentsList.filter((argument) => argument !== allowedFlag);
  const occurrences = argumentsList.filter((argument) => argument === allowedFlag).length;
  if (unexpected.length > 0 || occurrences > 1) {
    throw new TypeError(
      `validate-levels accepts only one optional ${allowedFlag}; received ${argumentsList.join(' ')}.`,
    );
  }
  return Object.freeze({ allowPendingCuration: occurrences === 1 });
}

async function main(): Promise<void> {
  const { allowPendingCuration } = parseValidationArguments(process.argv.slice(2));
  const manifest = await readJson<LevelManifest>(MANIFEST_FILE);
  validateManifest(manifest);
  let selfChecks = validatorSelfChecks() + manifestValidatorSelfChecks(manifest);
  const rawRegistry = await readJson<RawGeneratorRegistry>(GENERATOR_MAP_FILE);
  const rawMap = validateGeneratorRegistry(rawRegistry);
  const rawFallbackEnvelope = await readJson<JsonObject>(FALLBACK_FILE);
  const resources = createDailyGeneratorResources(rawMap, rawFallbackEnvelope);
  const distributionChecks = validateDistributionTargets(rawMap);

  const filenames = (await walkFiles(LEVEL_ROOT))
    .filter((filename) => filename.endsWith('.json'))
    .sort();
  const basenames = filenames.map((filename) => path.basename(filename));
  if (
    filenames.length !== EXPECTED_LEVEL_FILES.size ||
    basenames.some((filename) => !EXPECTED_LEVEL_FILES.has(filename))
  ) {
    throw new Error(`Level files must be exactly: ${[...EXPECTED_LEVEL_FILES].sort().join(', ')}.`);
  }

  const profilesById = new Map(manifest.profiles.map((profile) => [profile.id, profile]));
  const validatedById = new Map<string, ValidatedLevel>();
  const pairKeys = new Set<string>();
  const titleKeys = new Set<string>();
  const counters: ValidationCounters = {
    fallbackChecks: 0,
    rankChecks: 0,
    solutionChecks: 0,
    tagChecks: 0,
  };
  const chapterCounts = new Map<Chapter, number>();

  for (const filename of filenames) {
    const envelope = requireObject(await readJson<unknown>(filename), projectPath(filename));
    if (envelope.schemaVersion !== 1)
      throw new Error(`${projectPath(filename)} schemaVersion must be 1.`);
    const chapter = path.basename(filename, '.json') as Chapter;
    if (envelope.chapter !== chapter) throw new Error(`${chapter}.json chapter envelope changed.`);
    const records = requireArray(envelope.levels, `${chapter}.levels`);
    const recordIds = records.map((value, index) =>
      requireString(
        requireObject(value, `${chapter}.levels[${index}]`).id,
        `${chapter}.levels[${index}].id`,
      ),
    );
    assertCanonicalChapterLevelOrder(recordIds, manifest, chapter);
    chapterCounts.set(chapter, records.length);
    for (const value of records) {
      const record = requireObject(value, `${chapter}.level`);
      const id = requireString(record.id, `${chapter}.level.id`);
      const profile = profilesById.get(id);
      if (!profile || profile.chapter !== chapter) {
        throw new Error(`${id} is not present in the frozen ${chapter} manifest.`);
      }
      if (validatedById.has(id)) throw new Error(`Duplicate static level ID ${id}.`);
      const validated = validateLevelRecord(record, profile, manifest, counters);
      const validatedRecord = validated.record;
      const titleKey = requireString(validatedRecord.titleKey, `${id}.titleKey`);
      if (titleKeys.has(titleKey)) throw new Error(`Duplicate title key ${titleKey}.`);
      titleKeys.add(titleKey);
      const pair = `${profile.size}:${(validatedRecord.initialRows as number[]).join(',')}:${(
        validatedRecord.targetRows as number[]
      ).join(',')}`;
      if (pairKeys.has(pair)) throw new Error(`${id} duplicates another board pair.`);
      pairKeys.add(pair);
      validatedById.set(id, validated);
    }
  }

  if (validatedById.size !== 54 || validatedById.size !== profilesById.size) {
    throw new Error('Static catalog must match all 54 frozen manifest IDs exactly.');
  }
  if (
    chapterCounts.get('tutorial') !== 6 ||
    EXPECTED_CHAPTERS.slice(1).some((chapter) => chapterCounts.get(chapter) !== 12)
  ) {
    throw new Error('Static catalog count must be Tutorial 6 + each Lab chapter 12.');
  }

  const rawFallbacks = requireArray(rawFallbackEnvelope.fallbacks, 'fallbacks');
  for (const value of rawFallbacks) {
    validateFallbackRecord(requireObject(value, 'fallback'), rawMap, counters);
  }
  if (rawFallbacks.length !== 14 || resources.fallbacks.length !== 14) {
    throw new Error('v1 must contain exactly two fallbacks for each of seven profiles.');
  }

  const curationItems: CurationEvidenceItem[] = manifest.profiles.map((profile) => {
    const validated = validatedById.get(profile.id);
    if (validated === undefined) {
      throw new Error(`${profile.id} is missing from the validated curation catalog.`);
    }
    return Object.freeze({
      attempt: validated.attempt,
      features: validated.features,
      profile,
      puzzle: validated.record as unknown as PuzzleDefinition,
    });
  });
  const expectedEvidence = buildCurationEvidence(curationItems, manifest, manifest.candidateSeed);
  const curationMarkdown = await readFile(CURATION_FILE, 'utf8');
  const manifestIds = manifest.profiles.map((profile) => profile.id);
  const humanReview = curationStatus(curationMarkdown, expectedEvidence, manifestIds);
  selfChecks += curationParserSelfChecks(curationMarkdown, expectedEvidence, manifestIds);
  if (humanReview === 'PENDING' && !allowPendingCuration) {
    throw new Error(
      'Human curation review is PENDING. Complete DOD-04 approval or use ' +
        '--allow-pending-curation for objective candidate checks only.',
    );
  }

  console.log(
    `levelValidation files=${filenames.length} levels=${validatedById.size} tutorial=${chapterCounts.get('tutorial')} ` +
      `lab=${validatedById.size - (chapterCounts.get('tutorial') ?? 0)} pulse=${chapterCounts.get('pulse')} ` +
      `echo=${chapterCounts.get('echo')} rank=${chapterCounts.get('rank')} noise=${chapterCounts.get('noise')} ` +
      `rankChecks=${counters.rankChecks} solutionChecks=${counters.solutionChecks} tagChecks=${counters.tagChecks} ` +
      `fallbackProfiles=${resources.policy.profiles.length} fallbacks=${counters.fallbackChecks} ` +
      `titleKeys=${titleKeys.size} idChanges=0 distributionChecks=${distributionChecks} ` +
      `validatorSelfChecks=${selfChecks} catalogHash=${expectedEvidence.catalogHash} ` +
      `approvalFingerprint=${expectedEvidence.approvalFingerprint} humanReview=${humanReview} failures=0`,
  );
}

await main();
