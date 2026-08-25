import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { format } from 'prettier';

import {
  analyzeDifficulty,
  applyPulses,
  createEmptyBoard,
  createSeededPrng,
  derivePuzzleTags,
  factorizeGF2,
  rankGF2,
  type Difficulty,
  type DifficultyFeatures,
  type EncodedPulse,
  type GameMode,
  type PuzzleDefinition,
  type PuzzleTag,
} from '../src/domain/index.ts';

import { PROJECT_ROOT, projectPath } from './lib/project-files.ts';
import {
  approvalFingerprintFrom,
  assertCanonicalCurationProfileOrder,
  assertCurationMachineScaffold,
  buildCurationEvidence,
} from './lib/curation-evidence.ts';

const CONTENT_ROOT = path.join(PROJECT_ROOT, 'src', 'content');
const LEVEL_ROOT = path.join(CONTENT_ROOT, 'levels');
const FALLBACK_ROOT = path.join(CONTENT_ROOT, 'fallbacks');
const EVIDENCE_FILE = path.join(
  PROJECT_ROOT,
  'AXIS_SHIFT_Harness_KR',
  'evidence',
  'M03',
  'content-curation-v1.md',
);
const CHAPTER_FILES = ['tutorial', 'pulse', 'echo', 'rank', 'noise'] as const;
const TAG_ORDER: readonly PuzzleTag[] = [
  'sparse',
  'dense',
  'symmetric',
  'asymmetric',
  'overlap',
  'noise',
  'tutorial',
];

type Chapter = (typeof CHAPTER_FILES)[number];
type InitialMode = 'zero' | 'noise-low' | 'noise-mid' | 'noise-high';
type OverlapRequirement = 'any' | 'forbid' | 'require' | 'cancel';
type TutorialShape =
  'single-row' | 'single-column' | 'single-cell' | 'first-pulse' | 'multi-axis' | 'echo';

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
  readonly tutorialShape?: TutorialShape;
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

interface RangeValue {
  readonly max: number;
  readonly min: number;
}

interface DailyProfile {
  readonly complexityScore: RangeValue;
  readonly compressionGap: RangeValue;
  readonly density: RangeValue;
  readonly difficulty: Difficulty;
  readonly id: string;
  readonly initialDensity: RangeValue;
  readonly initialMode: 'zero' | 'noise';
  readonly isoWeekday: number;
  readonly nonzeroCols: RangeValue;
  readonly nonzeroRows: RangeValue;
  readonly overlapIndex: RangeValue;
  readonly rank: RangeValue;
  readonly size: number;
  readonly symmetryScore: RangeValue;
  readonly targetDensity: RangeValue;
}

interface GeneratorPolicy {
  readonly maxAttempts: number;
  readonly profiles: readonly DailyProfile[];
  readonly schemaVersion: 1;
  readonly seedDomain: string;
  readonly tagThresholds: TagThresholds;
  readonly version: string;
}

interface GeneratorMap {
  readonly defaultVersion: string;
  readonly schedule: readonly {
    readonly effectiveFrom: string;
    readonly version: string;
  }[];
  readonly schemaVersion: 1;
  readonly versions: Readonly<Record<string, GeneratorPolicy>>;
}

interface GeneratedLevel {
  readonly attempt: number;
  readonly features: DifficultyFeatures;
  readonly profile: LevelProfile;
  readonly puzzle: PuzzleDefinition;
}

interface DailyFallback extends PuzzleDefinition {
  readonly profileId: string;
}

interface CandidateArguments {
  readonly baseSeed: string;
  readonly resetCuration: boolean;
}

function parseCandidateArguments(argumentsList: readonly string[]): CandidateArguments {
  let baseSeed = 'axis-shift-curation-v1';
  let resetCuration = false;
  let seedSeen = false;
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === '--reset-curation') {
      if (resetCuration) throw new Error('--reset-curation may be specified only once.');
      resetCuration = true;
      continue;
    }
    if (argument === '--seed') {
      if (seedSeen) throw new Error('--seed may be specified only once.');
      const value = argumentsList[index + 1];
      if (value === undefined || value.startsWith('--') || value.trim().length === 0) {
        throw new Error('--seed requires a non-empty value.');
      }
      baseSeed = value.normalize('NFKC');
      seedSeen = true;
      index += 1;
      continue;
    }
    throw new Error(`Unsupported candidate argument: ${argument}.`);
  }
  return Object.freeze({ baseSeed, resetCuration });
}

async function readJson<T>(filename: string): Promise<T> {
  return JSON.parse(await readFile(filename, 'utf8')) as T;
}

function randomMask(
  prng: ReturnType<typeof createSeededPrng>,
  size: number,
  probability: number,
): number {
  let mask = 0;
  for (let index = 0; index < size; index += 1) {
    if (prng.nextFloat() < probability) mask |= 1 << index;
  }
  return mask === 0 ? 1 << prng.nextInt(size) : mask;
}

function randomMaskWithCount(
  prng: ReturnType<typeof createSeededPrng>,
  size: number,
  count: number,
): number {
  const positions = Array.from({ length: size }, (_, index) => index);
  for (let index = positions.length - 1; index > 0; index -= 1) {
    const swapIndex = prng.nextInt(index + 1);
    const displaced = positions[index] as number;
    positions[index] = positions[swapIndex] as number;
    positions[swapIndex] = displaced;
  }
  return positions.slice(0, count).reduce((mask, index) => mask | (1 << index), 0);
}

function xorRows(left: readonly number[], right: readonly number[]): number[] {
  return left.map((row, index) => row ^ (right[index] as number));
}

function randomRotationalBoard(
  prng: ReturnType<typeof createSeededPrng>,
  size: number,
  probability: number,
): number[] {
  const rows = createEmptyBoard(size);
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const mirrorRow = size - row - 1;
      const mirrorColumn = size - column - 1;
      if (row > mirrorRow || (row === mirrorRow && column > mirrorColumn)) continue;
      if (prng.nextFloat() >= probability) continue;
      rows[row] = (rows[row] as number) | (1 << column);
      rows[mirrorRow] = (rows[mirrorRow] as number) | (1 << mirrorColumn);
    }
  }
  return rows;
}

function disjointPulseDifference(
  prng: ReturnType<typeof createSeededPrng>,
  size: number,
  rank: number,
  probability: number,
): number[] {
  const rowMasks = Array.from({ length: rank }, () => 0);
  const rowOrder = Array.from({ length: size }, (_, index) => index);
  for (let index = rowOrder.length - 1; index > 0; index -= 1) {
    const swapIndex = prng.nextInt(index + 1);
    const displaced = rowOrder[index] as number;
    rowOrder[index] = rowOrder[swapIndex] as number;
    rowOrder[swapIndex] = displaced;
  }
  for (let basisIndex = 0; basisIndex < rank; basisIndex += 1) {
    const row = rowOrder[basisIndex] as number;
    rowMasks[basisIndex] = 1 << row;
  }
  for (let rowIndex = rank; rowIndex < size; rowIndex += 1) {
    if (prng.nextFloat() < 0.85) {
      const basisIndex = prng.nextInt(rank);
      rowMasks[basisIndex] =
        (rowMasks[basisIndex] as number) | (1 << (rowOrder[rowIndex] as number));
    }
  }
  const pulses = rowMasks.map((rowMask) => ({
    colMask: randomMask(prng, size, probability),
    rowMask,
  }));
  return applyPulses(createEmptyBoard(size), size, pulses);
}

function coveringSparseDifference(
  prng: ReturnType<typeof createSeededPrng>,
  size: number,
  rank: number,
): number[] {
  const rows = Array.from({ length: size }, (_, index) => index);
  const columns = Array.from({ length: size }, (_, index) => index);
  for (const values of [rows, columns]) {
    for (let index = values.length - 1; index > 0; index -= 1) {
      const swapIndex = prng.nextInt(index + 1);
      const displaced = values[index] as number;
      values[index] = values[swapIndex] as number;
      values[swapIndex] = displaced;
    }
  }
  const pulses = Array.from({ length: rank }, (_, basisIndex) => ({
    rowMask: rows.reduce(
      (mask, row, index) => (index % rank === basisIndex ? mask | (1 << row) : mask),
      0,
    ),
    colMask: columns.reduce(
      (mask, column, index) => (index % rank === basisIndex ? mask | (1 << column) : mask),
      0,
    ),
  }));
  return applyPulses(createEmptyBoard(size), size, pulses);
}

function generalPulseDifference(
  prng: ReturnType<typeof createSeededPrng>,
  size: number,
  rank: number,
  probability: number,
  forceOverlap: boolean,
): number[] {
  const pulses: EncodedPulse[] = [];
  let sharedRow = 0;
  let sharedColumn = 0;
  if (forceOverlap) {
    sharedRow = 1 << prng.nextInt(size);
    sharedColumn = 1 << prng.nextInt(size);
  }
  for (let index = 0; index < rank; index += 1) {
    let rowMask = randomMask(prng, size, probability);
    let colMask = randomMask(prng, size, probability);
    if (forceOverlap && index < 2) {
      rowMask |= sharedRow;
      colMask |= sharedColumn;
    }
    pulses.push({ colMask, rowMask });
  }
  return applyPulses(createEmptyBoard(size), size, pulses);
}

function tutorialDifference(
  profile: LevelProfile,
  prng: ReturnType<typeof createSeededPrng>,
): number[] | undefined {
  if (profile.tutorialShape === undefined) return undefined;
  const { size } = profile;
  if (profile.tutorialShape === 'single-row') {
    return applyPulses(createEmptyBoard(size), size, [
      { rowMask: randomMaskWithCount(prng, size, 1), colMask: randomMaskWithCount(prng, size, 2) },
    ]);
  }
  if (profile.tutorialShape === 'single-column') {
    return applyPulses(createEmptyBoard(size), size, [
      { rowMask: randomMaskWithCount(prng, size, 2), colMask: randomMaskWithCount(prng, size, 1) },
    ]);
  }
  if (profile.tutorialShape === 'single-cell') {
    return applyPulses(createEmptyBoard(size), size, [
      { rowMask: randomMaskWithCount(prng, size, 1), colMask: randomMaskWithCount(prng, size, 1) },
    ]);
  }
  if (profile.tutorialShape === 'first-pulse') {
    return applyPulses(createEmptyBoard(size), size, [
      { rowMask: randomMaskWithCount(prng, size, 1), colMask: randomMaskWithCount(prng, size, 2) },
    ]);
  }
  if (profile.tutorialShape === 'multi-axis') {
    return applyPulses(createEmptyBoard(size), size, [
      { rowMask: randomMaskWithCount(prng, size, 2), colMask: randomMaskWithCount(prng, size, 2) },
    ]);
  }
  return generalPulseDifference(prng, size, 2, 0.6, true);
}

function densityProbability(requiredTags: readonly PuzzleTag[]): number {
  if (requiredTags.includes('sparse')) return 0.32;
  if (requiredTags.includes('dense')) return 0.76;
  return 0.55;
}

function buildDifference(
  profile: LevelProfile,
  prng: ReturnType<typeof createSeededPrng>,
): number[] {
  const tutorial = tutorialDifference(profile, prng);
  if (tutorial !== undefined) return tutorial;
  const probability = densityProbability(profile.requiredTags);
  if (profile.requiredTags.includes('symmetric')) {
    return randomRotationalBoard(prng, profile.size, probability);
  }
  if (profile.allAxesNonzero && profile.requiredTags.includes('sparse')) {
    return coveringSparseDifference(prng, profile.size, profile.rank);
  }
  if (profile.overlap === 'forbid') {
    return disjointPulseDifference(prng, profile.size, profile.rank, probability);
  }
  return generalPulseDifference(
    prng,
    profile.size,
    profile.rank,
    probability,
    profile.overlap === 'require' || profile.overlap === 'cancel',
  );
}

function initialDensityRange(mode: InitialMode): readonly [number, number] {
  if (mode === 'noise-low') return [0.125, 0.25];
  if (mode === 'noise-mid') return [0.2, 0.36];
  if (mode === 'noise-high') return [0.25, 0.45];
  return [0, 0];
}

function randomBoardByDensity(
  prng: ReturnType<typeof createSeededPrng>,
  size: number,
  minimum: number,
  maximum: number,
): number[] {
  if (maximum === 0) return createEmptyBoard(size);
  const cellCount = size * size;
  const minimumCells = Math.max(1, Math.ceil(minimum * cellCount));
  const maximumCells = Math.max(minimumCells, Math.floor(maximum * cellCount));
  const selectedCount = minimumCells + prng.nextInt(maximumCells - minimumCells + 1);
  const positions = Array.from({ length: cellCount }, (_, index) => index);
  for (let index = positions.length - 1; index > 0; index -= 1) {
    const swapIndex = prng.nextInt(index + 1);
    const displaced = positions[index] as number;
    positions[index] = positions[swapIndex] as number;
    positions[swapIndex] = displaced;
  }
  const rows = createEmptyBoard(size);
  for (const cellIndex of positions.slice(0, selectedCount)) {
    const row = Math.floor(cellIndex / size);
    const column = cellIndex % size;
    rows[row] = (rows[row] as number) | (1 << column);
  }
  return rows;
}

function cancellationCells(size: number, pulses: readonly EncodedPulse[]): number {
  let count = 0;
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      let touches = 0;
      for (const pulse of pulses) {
        if ((pulse.rowMask & (1 << row)) !== 0 && (pulse.colMask & (1 << column)) !== 0) {
          touches += 1;
        }
      }
      if (touches >= 2 && touches % 2 === 0) count += 1;
    }
  }
  return count;
}

function tagsInCanonicalOrder(tags: readonly PuzzleTag[]): PuzzleTag[] {
  const selected = new Set(tags);
  return TAG_ORDER.filter((tag) => selected.has(tag));
}

function matchesLevelProfile(
  profile: LevelProfile,
  features: DifficultyFeatures,
  tags: readonly PuzzleTag[],
  pulses: readonly EncodedPulse[],
): boolean {
  if (features.rank !== profile.rank || features.compressionGap < profile.compressionGapMin) {
    return false;
  }
  if (
    profile.allAxesNonzero &&
    (features.nonzeroRows !== profile.size || features.nonzeroCols !== profile.size)
  ) {
    return false;
  }
  if (profile.overlap === 'forbid' && features.overlapIndex !== 0) return false;
  if (
    (profile.overlap === 'require' || profile.overlap === 'cancel') &&
    features.overlapIndex <= 0
  ) {
    return false;
  }
  if (profile.overlap === 'cancel' && cancellationCells(profile.size, pulses) < 1) return false;
  if (profile.mode === 'lab') {
    if (features.density < 0.22 || features.density > 0.68) return false;
    if (features.targetDensity < 0.22 || features.targetDensity > 0.68) return false;
  }
  const [minimumInitialDensity, maximumInitialDensity] = initialDensityRange(profile.initialMode);
  if (
    features.initialDensity < minimumInitialDensity ||
    features.initialDensity > maximumInitialDensity
  ) {
    return false;
  }
  return profile.requiredTags.every((tag) => tags.includes(tag));
}

function buildLevelCandidate(
  manifest: LevelManifest,
  profile: LevelProfile,
  baseSeed: string,
  attempt: number,
): Omit<GeneratedLevel, 'attempt'> | undefined {
  const seed =
    `axis-shift|curation|${manifest.generatorVersion}|${baseSeed}|${profile.id}|${attempt}`.normalize(
      'NFKC',
    );
  const prng = createSeededPrng(seed);
  const difference = buildDifference(profile, prng);
  if (rankGF2(difference, profile.size) !== profile.rank) return undefined;
  const [minimumInitialDensity, maximumInitialDensity] = initialDensityRange(profile.initialMode);
  const initialRows = randomBoardByDensity(
    prng,
    profile.size,
    minimumInitialDensity,
    maximumInitialDensity,
  );
  const targetRows = xorRows(initialRows, difference);
  const features = analyzeDifficulty(initialRows, targetRows, profile.size);
  const canonicalSolution = factorizeGF2(difference, profile.size);
  const tags = tagsInCanonicalOrder(
    derivePuzzleTags(features, manifest.tagThresholds, profile.mode === 'tutorial'),
  );
  if (!matchesLevelProfile(profile, features, tags, canonicalSolution)) return undefined;
  const puzzle: PuzzleDefinition = {
    schemaVersion: 1,
    id: profile.id,
    mode: profile.mode,
    generatorVersion: manifest.generatorVersion,
    seed,
    size: profile.size,
    initialRows,
    targetRows,
    optimalPulseCount: profile.rank,
    canonicalSolution,
    difficulty: profile.difficulty,
    complexityScore: features.complexityScore,
    tags,
    titleKey: profile.titleKey,
    ...(profile.tutorialStepIds === undefined
      ? {}
      : { tutorialStepIds: [...profile.tutorialStepIds] }),
  };
  return { features, profile, puzzle };
}

function pairKey(puzzle: PuzzleDefinition): string {
  return `${puzzle.size}:${puzzle.initialRows.join(',')}:${puzzle.targetRows.join(',')}`;
}

function generateLevels(manifest: LevelManifest, baseSeed: string): GeneratedLevel[] {
  const selectedPairs = new Set<string>();
  const generated: GeneratedLevel[] = [];
  for (const profile of manifest.profiles) {
    let selection: GeneratedLevel | undefined;
    for (let attempt = 0; attempt < manifest.maxAttemptsPerLevel; attempt += 1) {
      const candidate = buildLevelCandidate(manifest, profile, baseSeed, attempt);
      if (candidate === undefined || selectedPairs.has(pairKey(candidate.puzzle))) continue;
      selection = { ...candidate, attempt };
      break;
    }
    if (selection === undefined) {
      throw new Error(
        `${profile.id} did not produce a valid candidate in ${manifest.maxAttemptsPerLevel} attempts.`,
      );
    }
    selectedPairs.add(pairKey(selection.puzzle));
    generated.push(selection);
  }
  return generated;
}

function within(value: number, range: RangeValue): boolean {
  return value >= range.min && value <= range.max;
}

function buildDailyDifference(
  profile: DailyProfile,
  prng: ReturnType<typeof createSeededPrng>,
  rank: number,
): number[] {
  if (profile.symmetryScore.min >= 0.9) {
    return randomRotationalBoard(prng, profile.size, 0.5);
  }
  return generalPulseDifference(
    prng,
    profile.size,
    rank,
    profile.density.max <= 0.44 ? 0.34 : 0.58,
    profile.overlapIndex.min > 0,
  );
}

function matchesDailyProfile(profile: DailyProfile, features: DifficultyFeatures): boolean {
  return (
    within(features.rank, profile.rank) &&
    within(features.initialDensity, profile.initialDensity) &&
    within(features.density, profile.density) &&
    within(features.targetDensity, profile.targetDensity) &&
    within(features.nonzeroRows, profile.nonzeroRows) &&
    within(features.nonzeroCols, profile.nonzeroCols) &&
    within(features.compressionGap, profile.compressionGap) &&
    within(features.overlapIndex, profile.overlapIndex) &&
    within(features.symmetryScore, profile.symmetryScore) &&
    within(features.complexityScore, profile.complexityScore)
  );
}

function generateFallbacks(
  generatorMap: GeneratorPolicy,
  baseSeed: string,
): readonly DailyFallback[] {
  const fallbacks: DailyFallback[] = [];
  const usedTargets = new Set<string>();
  for (const profile of generatorMap.profiles) {
    for (let fallbackIndex = 0; fallbackIndex < 2; fallbackIndex += 1) {
      let selected: DailyFallback | undefined;
      for (let attempt = 0; attempt < generatorMap.maxAttempts * 4; attempt += 1) {
        const seed = `axis-shift|fallback|${generatorMap.version}|${baseSeed}|${profile.id}|${fallbackIndex}|${attempt}`;
        const prng = createSeededPrng(seed);
        const rank = profile.rank.min + prng.nextInt(profile.rank.max - profile.rank.min + 1);
        const difference = buildDailyDifference(profile, prng, rank);
        if (rankGF2(difference, profile.size) !== rank) continue;
        const initialRows = randomBoardByDensity(
          prng,
          profile.size,
          profile.initialDensity.min,
          profile.initialDensity.max,
        );
        const targetRows = xorRows(initialRows, difference);
        const features = analyzeDifficulty(initialRows, targetRows, profile.size);
        if (!matchesDailyProfile(profile, features)) continue;
        const targetKey = `${profile.size}:${targetRows.join(',')}`;
        if (usedTargets.has(targetKey)) continue;
        const canonicalSolution = factorizeGF2(difference, profile.size);
        selected = {
          schemaVersion: 1,
          id: `${profile.id}-fallback-${String(fallbackIndex + 1).padStart(2, '0')}`,
          profileId: profile.id,
          mode: 'daily',
          generatorVersion: generatorMap.version,
          seed,
          size: profile.size,
          initialRows,
          targetRows,
          optimalPulseCount: rank,
          canonicalSolution,
          difficulty: profile.difficulty,
          complexityScore: features.complexityScore,
          tags: tagsInCanonicalOrder(derivePuzzleTags(features, generatorMap.tagThresholds, false)),
          titleKey: `level.daily.fallback.${profile.isoWeekday}.${String(fallbackIndex + 1).padStart(2, '0')}.title`,
        };
        usedTargets.add(targetKey);
        break;
      }
      if (selected === undefined) {
        throw new Error(`Could not generate fallback ${fallbackIndex + 1} for ${profile.id}.`);
      }
      fallbacks.push(selected);
    }
  }
  return fallbacks;
}

async function writeGeneratedContent(
  generated: readonly GeneratedLevel[],
  fallbacks: readonly DailyFallback[],
  manifest: LevelManifest,
  baseSeed: string,
  resetCuration: boolean,
): Promise<{
  readonly approvalFingerprint: string;
  readonly catalogHash: string;
  readonly curationDisposition: string;
}> {
  await mkdir(LEVEL_ROOT, { recursive: true });
  await mkdir(FALLBACK_ROOT, { recursive: true });
  await mkdir(path.dirname(EVIDENCE_FILE), { recursive: true });
  for (const chapter of CHAPTER_FILES) {
    const levels = generated
      .filter((item) => item.profile.chapter === chapter)
      .sort((left, right) => left.profile.order - right.profile.order)
      .map((item) => item.puzzle);
    await writeFormattedJson(path.join(LEVEL_ROOT, `${chapter}.json`), {
      schemaVersion: 1,
      chapter,
      levels,
    });
  }
  await writeFormattedJson(path.join(FALLBACK_ROOT, 'v1.json'), {
    schemaVersion: 1,
    generatorVersion: 'v1',
    fallbacks,
  });
  const evidence = buildCurationEvidence(generated, manifest, baseSeed);
  const nextEvidence = evidence.pendingMarkdown;
  let existingEvidence: string | undefined;
  try {
    existingEvidence = await readFile(EVIDENCE_FILE, 'utf8');
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !('code' in error) ||
      (error as NodeJS.ErrnoException).code !== 'ENOENT'
    ) {
      throw error;
    }
  }
  const existingFingerprint =
    existingEvidence === undefined ? undefined : approvalFingerprintFrom(existingEvidence);
  const sameApprovalFingerprint = existingFingerprint === evidence.approvalFingerprint;
  if (!resetCuration && sameApprovalFingerprint && existingEvidence !== undefined) {
    assertCurationMachineScaffold(existingEvidence, nextEvidence);
  }
  const preserveExisting = !resetCuration && sameApprovalFingerprint;
  if (!preserveExisting) {
    await writeFile(EVIDENCE_FILE, nextEvidence, 'utf8');
  }
  const curationDisposition = preserveExisting
    ? 'preserved'
    : resetCuration
      ? 'reset'
      : existingEvidence === undefined
        ? 'initialized'
        : 'approval-fingerprint-changed-reset';
  return Object.freeze({
    approvalFingerprint: evidence.approvalFingerprint,
    catalogHash: evidence.catalogHash,
    curationDisposition,
  });
}

async function writeFormattedJson(filePath: string, value: unknown): Promise<void> {
  const formatted = await format(JSON.stringify(value), {
    filepath: filePath,
    parser: 'json',
  });
  await writeFile(filePath, formatted, 'utf8');
}

async function main(): Promise<void> {
  const { baseSeed, resetCuration } = parseCandidateArguments(process.argv.slice(2));
  const manifest = await readJson<LevelManifest>(path.join(CONTENT_ROOT, 'level-manifest.v1.json'));
  const generatorRegistry = await readJson<GeneratorMap>(
    path.join(CONTENT_ROOT, 'generator-map.json'),
  );
  const generatorMap = generatorRegistry.versions.v1;
  if (
    generatorRegistry.schemaVersion !== 1 ||
    generatorRegistry.defaultVersion !== 'v1' ||
    JSON.stringify(generatorRegistry.schedule) !==
      JSON.stringify([{ effectiveFrom: '2026-01-01', version: 'v1' }]) ||
    generatorMap === undefined
  ) {
    throw new Error('generator-map must expose the frozen v1 effectiveFrom registry.');
  }
  if (manifest.schemaVersion !== 1 || manifest.generatorVersion !== 'v1') {
    throw new Error('level-manifest.v1.json must declare schemaVersion=1 and generatorVersion=v1.');
  }
  assertCanonicalCurationProfileOrder(manifest.profiles);
  if (baseSeed !== manifest.candidateSeed) {
    throw new Error(
      `Candidate seed must stay frozen at ${manifest.candidateSeed}; received ${baseSeed}.`,
    );
  }
  const generated = generateLevels(manifest, baseSeed);
  const fallbacks = generateFallbacks(generatorMap, baseSeed);
  const { approvalFingerprint, catalogHash, curationDisposition } = await writeGeneratedContent(
    generated,
    fallbacks,
    manifest,
    baseSeed,
    resetCuration,
  );
  const chapterCounts = Object.fromEntries(
    CHAPTER_FILES.map((chapter) => [
      chapter,
      generated.filter((item) => item.profile.chapter === chapter).length,
    ]),
  );
  console.log(
    `levelCandidates seed=${baseSeed} levels=${generated.length} tutorial=${chapterCounts.tutorial} ` +
      `lab=${generated.length - (chapterCounts.tutorial as number)} pulse=${chapterCounts.pulse} ` +
      `echo=${chapterCounts.echo} rank=${chapterCounts.rank} noise=${chapterCounts.noise} ` +
      `fallbacks=${fallbacks.length} catalogHash=${catalogHash} curation=${curationDisposition} ` +
      `approvalFingerprint=${approvalFingerprint} evidence=${projectPath(EVIDENCE_FILE)} ` +
      'failures=0',
  );
}

await main();
