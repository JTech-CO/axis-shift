import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DAILY_GENERATOR_RESOURCES,
  DAILY_V1_GOLDEN_VECTORS,
  GENERATOR_DISTRIBUTION_TARGETS,
  generateDailyPuzzleWithDiagnostics,
} from '../src/content/index.ts';
import {
  addUtcDays,
  analyzeDifficulty,
  applyPulses,
  assertBoardRows,
  assertPlayablePuzzlePair,
  derivePuzzleTags,
  differenceRows,
  factorizeGF2,
  isoWeekday,
  puzzleOutputHash,
  rankGF2,
  serializePuzzleDefinition,
  stableSerialize,
  targetBoardHash,
  type DifficultyFeatures,
  type EncodedPulse,
  type PuzzleDefinition,
} from '../src/domain/index.ts';

import { PROJECT_ROOT, projectPath } from './lib/project-files.ts';

const DEFAULT_START_DATE = '2026-01-01';
const DEFAULT_DAY_COUNT = 3_650;
const DEFAULT_OUTPUT_DIRECTORY = path.join(PROJECT_ROOT, 'outputs', 'm03');
const PROCESS_PARITY_REPEATS = 10;
const PROCESS_TIMEZONES = ['UTC', 'Asia/Seoul', 'America/Los_Angeles'] as const;
const WORKER_PATH = fileURLToPath(new URL('./generator-parity-worker.ts', import.meta.url));

interface AuditOptions {
  readonly dayCount: number;
  readonly outputDirectory: string;
  readonly startDate: string;
  readonly version: string;
}

interface ProcessParityResult {
  readonly dateUtc: string;
  readonly diagnosticsHashMismatches: number;
  readonly hashMismatches: number;
  readonly processes: number;
  readonly repeatsPerProcess: number;
  readonly timezones: readonly string[];
}

interface DistributionObservation {
  readonly count: number;
  readonly fraction: number;
  readonly max: number;
  readonly min: number;
  readonly passed: boolean;
}

interface AuditReport {
  readonly adjacentDuplicates: number;
  readonly dayCount: number;
  readonly difficultyDistribution: Readonly<Record<string, number>>;
  readonly distributionObservations: Readonly<
    Record<string, Readonly<Record<string, DistributionObservation>>>
  >;
  readonly distributionFailures: number;
  readonly exceptionDates: readonly string[];
  readonly exceptions: number;
  readonly fallbackCount: number;
  readonly fallbackDates: readonly string[];
  readonly goldenVectorCount: number;
  readonly goldenMismatches: number;
  readonly invalid: number;
  readonly invalidDates: readonly string[];
  readonly maxAttemptCount: number;
  readonly outputHash: string;
  readonly processParity: ProcessParityResult;
  readonly profileDistribution: Readonly<Record<string, number>>;
  readonly reportSchemaVersion: 1;
  readonly rankDistribution: Readonly<Record<string, number>>;
  readonly sizeDistribution: Readonly<Record<string, number>>;
  readonly startDate: string;
  readonly version: string;
  readonly wrongPar: number;
  readonly wrongParDates: readonly string[];
}

type DailyDiagnostics = ReturnType<typeof generateDailyPuzzleWithDiagnostics>;
type DailyProfile = (typeof DAILY_GENERATOR_RESOURCES.policy.profiles)[number];
type NumericRange = DailyProfile['rank'];

function optionValue(arguments_: readonly string[], name: string, fallback: string): string {
  const index = arguments_.indexOf(name);
  if (index < 0) return fallback;
  const value = arguments_[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`Missing value for ${name}.`);
  if (arguments_.indexOf(name, index + 1) >= 0) throw new Error(`Duplicate option ${name}.`);
  return value;
}

function parseOptions(arguments_: readonly string[]): AuditOptions {
  const allowed = new Set(['--days', '--output-dir', '--start', '--version']);
  for (let index = 0; index < arguments_.length; index += 2) {
    const name = arguments_[index];
    if (!name || !allowed.has(name)) throw new Error(`Unsupported audit option ${String(name)}.`);
    if (arguments_[index + 1] === undefined) throw new Error(`Missing value for ${name}.`);
  }

  const dayCount = Number(optionValue(arguments_, '--days', String(DEFAULT_DAY_COUNT)));
  if (!Number.isInteger(dayCount) || dayCount < 1 || dayCount > 100_000) {
    throw new RangeError('--days must be an integer in 1..100000.');
  }

  return {
    dayCount,
    outputDirectory: path.resolve(
      optionValue(arguments_, '--output-dir', DEFAULT_OUTPUT_DIRECTORY),
    ),
    startDate: optionValue(arguments_, '--start', DEFAULT_START_DATE),
    version: optionValue(arguments_, '--version', DAILY_GENERATOR_RESOURCES.policy.version),
  };
}

function incrementCounter(counters: Map<string, number>, key: string): void {
  counters.set(key, (counters.get(key) ?? 0) + 1);
}

function sortedCounters(counters: ReadonlyMap<string, number>): Readonly<Record<string, number>> {
  return Object.fromEntries(
    [...counters.entries()].sort(([left], [right]) => {
      if (left < right) return -1;
      if (left > right) return 1;
      return 0;
    }),
  );
}

function auditDistribution(
  counts: Readonly<Record<string, number>>,
  dayCount: number,
  targets: Readonly<Record<string, { readonly max: number; readonly min: number }>>,
): {
  readonly failures: number;
  readonly observations: Readonly<Record<string, DistributionObservation>>;
} {
  const keys = [...new Set([...Object.keys(counts), ...Object.keys(targets)])].sort();
  let failures = 0;
  const observations: Record<string, DistributionObservation> = {};
  for (const key of keys) {
    const count = counts[key] ?? 0;
    const fraction = count / dayCount;
    const target = targets[key];
    const passed = Boolean(target && fraction >= target.min && fraction <= target.max);
    if (!passed) failures += 1;
    observations[key] = Object.freeze({
      count,
      fraction: Number(fraction.toFixed(6)),
      max: target?.max ?? 0,
      min: target?.min ?? 0,
      passed,
    });
  }
  return { failures, observations: Object.freeze(observations) };
}

function distributionTable(report: AuditReport): string[] {
  const rows = [
    '| Group | Value | Count | Fraction | Allowed | Result |',
    '|---|---:|---:|---:|---:|---|',
  ];
  for (const [group, observations] of Object.entries(report.distributionObservations)) {
    for (const [value, observation] of Object.entries(observations)) {
      rows.push(
        `| ${group} | ${value} | ${observation.count} | ${observation.fraction.toFixed(6)} | ${observation.min}..${observation.max} | ${observation.passed ? 'PASS' : 'FAIL'} |`,
      );
    }
  }
  return rows;
}

function rowsEqual(left: readonly number[], right: readonly number[]): boolean {
  return left.length === right.length && left.every((row, index) => row === right[index]);
}

function pulsesEqual(left: readonly EncodedPulse[], right: readonly EncodedPulse[]): boolean {
  return stableSerialize(left) === stableSerialize(right);
}

function within(value: number, range: NumericRange): boolean {
  const epsilon = 1e-12;
  return value + epsilon >= range.min && value - epsilon <= range.max;
}

function profileErrors(
  profile: DailyProfile,
  features: DifficultyFeatures,
  puzzle: PuzzleDefinition,
): string[] {
  const errors: string[] = [];
  const rangedFeatures: readonly [keyof DifficultyFeatures, NumericRange][] = [
    ['complexityScore', profile.complexityScore],
    ['compressionGap', profile.compressionGap],
    ['density', profile.density],
    ['initialDensity', profile.initialDensity],
    ['nonzeroCols', profile.nonzeroCols],
    ['nonzeroRows', profile.nonzeroRows],
    ['overlapIndex', profile.overlapIndex],
    ['rank', profile.rank],
    ['symmetryScore', profile.symmetryScore],
    ['targetDensity', profile.targetDensity],
  ];
  for (const [featureName, range] of rangedFeatures) {
    const value = features[featureName];
    if (typeof value !== 'number' || !within(value, range)) {
      errors.push(`${String(featureName)}=${String(value)} outside ${range.min}..${range.max}`);
    }
  }
  if (puzzle.size !== profile.size) errors.push(`size ${puzzle.size} != profile ${profile.size}`);
  if (puzzle.difficulty !== profile.difficulty) {
    errors.push(`difficulty ${puzzle.difficulty} != profile ${profile.difficulty}`);
  }
  if (profile.initialMode === 'zero' && features.initialDensity !== 0) {
    errors.push('zero profile has nonzero initial density');
  }
  if (profile.initialMode === 'noise' && features.initialDensity <= 0) {
    errors.push('noise profile has zero initial density');
  }
  return errors;
}

function auditDailyGoldenVectors(version: string): number {
  if (version !== DAILY_GENERATOR_RESOURCES.policy.version) {
    throw new Error(`No Daily golden vectors are registered for ${version}.`);
  }
  if (DAILY_V1_GOLDEN_VECTORS.length < 20) {
    throw new Error('Daily v1 requires at least 20 golden date snapshots.');
  }
  if (
    new Set(DAILY_V1_GOLDEN_VECTORS.map((vector) => vector.dateUtc)).size !==
    DAILY_V1_GOLDEN_VECTORS.length
  ) {
    throw new Error('Daily v1 golden snapshot dates must be unique.');
  }

  let mismatches = 0;
  for (const vector of DAILY_V1_GOLDEN_VECTORS) {
    if (!/^[0-9a-f]{64}$/u.test(vector.puzzleHash)) {
      throw new Error(`Daily golden ${vector.dateUtc} has an invalid puzzle hash.`);
    }
    const diagnostics = generateDailyPuzzleWithDiagnostics({
      dateUtc: vector.dateUtc,
      generatorVersion: version,
    });
    const actualHash = puzzleOutputHash(diagnostics.puzzle);
    if (actualHash !== vector.puzzleHash) {
      mismatches += 1;
      console.error(
        `dailyAudit goldenMismatch date=${vector.dateUtc} expected=${vector.puzzleHash} actual=${actualHash}`,
      );
    }
  }
  return mismatches;
}

function validateDailyDiagnostics(
  diagnostics: DailyDiagnostics,
  dateUtc: string,
  expectedVersion: string,
): { readonly errors: readonly string[]; readonly wrongPar: boolean } {
  const { puzzle } = diagnostics;
  const errors: string[] = [];
  if (puzzle.schemaVersion !== 1) errors.push('schemaVersion is not 1');
  if (puzzle.mode !== 'daily') errors.push(`mode is ${puzzle.mode}`);
  if (puzzle.generatorVersion !== expectedVersion) errors.push('generatorVersion mismatch');
  if (typeof puzzle.id !== 'string' || puzzle.id.trim().length === 0) errors.push('id is empty');

  try {
    assertBoardRows(puzzle.initialRows, puzzle.size, 'daily.initialRows');
    assertBoardRows(puzzle.targetRows, puzzle.size, 'daily.targetRows');
    assertPlayablePuzzlePair(puzzle.initialRows, puzzle.targetRows, puzzle.size);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return { errors, wrongPar: false };
  }

  const difference = differenceRows(puzzle.initialRows, puzzle.targetRows, puzzle.size);
  const actualPar = rankGF2(difference, puzzle.size);
  const wrongPar = puzzle.optimalPulseCount !== actualPar;
  const canonical = factorizeGF2(difference, puzzle.size);
  const solved = applyPulses(puzzle.initialRows, puzzle.size, canonical);
  if (!rowsEqual(solved, puzzle.targetRows))
    errors.push('canonical factorization did not solve puzzle');
  if (puzzle.canonicalSolution && !pulsesEqual(puzzle.canonicalSolution, canonical)) {
    errors.push('stored canonical solution differs from domain factorization');
  }

  const features = analyzeDifficulty(puzzle.initialRows, puzzle.targetRows, puzzle.size);
  if (stableSerialize(features) !== stableSerialize(diagnostics.features)) {
    errors.push('diagnostic features differ from recomputation');
  }
  if (puzzle.complexityScore !== features.complexityScore) {
    errors.push('stored complexity score differs from recomputation');
  }
  const expectedTags = derivePuzzleTags(
    features,
    DAILY_GENERATOR_RESOURCES.policy.tagThresholds,
    false,
  );
  if (stableSerialize(puzzle.tags) !== stableSerialize(expectedTags)) {
    errors.push('stored tags differ from recomputation');
  }
  const expectedTargetHash = targetBoardHash(puzzle.size, puzzle.targetRows);
  if (diagnostics.targetHash !== expectedTargetHash) errors.push('target hash mismatch');

  const profile = DAILY_GENERATOR_RESOURCES.policy.profiles.find(
    (candidate) => candidate.id === diagnostics.profileId,
  );
  if (!profile) {
    errors.push(`unknown profile ${diagnostics.profileId}`);
  } else {
    const scheduled = DAILY_GENERATOR_RESOURCES.policy.profiles.find(
      (candidate) => candidate.isoWeekday === isoWeekday(dateUtc),
    );
    if (scheduled?.id !== profile.id) errors.push('profile does not match UTC weekday schedule');
    errors.push(...profileErrors(profile, features, puzzle));
  }

  return { errors, wrongPar };
}

function runProcessParity(
  dateUtc: string,
  version: string,
  expectedPuzzleHash: string,
): ProcessParityResult {
  const puzzleHashes = new Set<string>();
  const diagnosticsHashes = new Set<string>();
  let internalPuzzleMismatches = 0;
  let internalDiagnosticsMismatches = 0;

  for (const timezone of PROCESS_TIMEZONES) {
    const result = spawnSync(
      process.execPath,
      [
        '--import',
        'tsx',
        WORKER_PATH,
        '--date',
        dateUtc,
        '--version',
        version,
        '--repeats',
        String(PROCESS_PARITY_REPEATS),
      ],
      {
        cwd: PROJECT_ROOT,
        encoding: 'utf8',
        env: { ...process.env, TZ: timezone },
        timeout: 60_000,
      },
    );
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(
        `Generator parity worker failed for ${timezone}: ${result.stderr.trim() || `exit ${String(result.status)}`}`,
      );
    }
    const parsed = JSON.parse(result.stdout.trim()) as {
      diagnosticsHash: string;
      diagnosticsMismatches: number;
      puzzleHash: string;
      puzzleMismatches: number;
    };
    puzzleHashes.add(parsed.puzzleHash);
    diagnosticsHashes.add(parsed.diagnosticsHash);
    internalPuzzleMismatches += parsed.puzzleMismatches;
    internalDiagnosticsMismatches += parsed.diagnosticsMismatches;
  }

  const hashMismatches =
    internalPuzzleMismatches +
    (puzzleHashes.size === 1 && puzzleHashes.has(expectedPuzzleHash) ? 0 : 1);
  const diagnosticsHashMismatches =
    internalDiagnosticsMismatches + (diagnosticsHashes.size === 1 ? 0 : 1);
  return {
    dateUtc,
    diagnosticsHashMismatches,
    hashMismatches,
    processes: PROCESS_TIMEZONES.length,
    repeatsPerProcess: PROCESS_PARITY_REPEATS,
    timezones: PROCESS_TIMEZONES,
  };
}

function canonicalReportJson(report: AuditReport): string {
  return `${JSON.stringify(JSON.parse(stableSerialize(report)), null, 2)}\n`;
}

function reportMarkdown(report: AuditReport, reportSha256: string): string {
  return [
    '# AXIS//SHIFT M03 Daily generator audit',
    '',
    `- Version: \`${report.version}\``,
    `- UTC range: \`${report.startDate}\` + ${report.dayCount} days`,
    `- Puzzle output SHA-256: \`${report.outputHash}\``,
    `- Normalized report SHA-256: \`${reportSha256}\``,
    `- Exceptions / invalid / wrong Par: ${report.exceptions} / ${report.invalid} / ${report.wrongPar}`,
    `- Adjacent target duplicates: ${report.adjacentDuplicates}`,
    `- Fallbacks: ${report.fallbackCount}`,
    `- Maximum candidate attempts: ${report.maxAttemptCount}`,
    `- Golden snapshots: ${report.goldenVectorCount}, mismatches=${report.goldenMismatches}`,
    `- Distribution failures: ${report.distributionFailures}`,
    `- Process/TZ parity: processes=${report.processParity.processes}, repeats=${report.processParity.repeatsPerProcess}, hashMismatches=${report.processParity.hashMismatches}, diagnosticsHashMismatches=${report.processParity.diagnosticsHashMismatches}`,
    '',
    '## Distribution target audit',
    '',
    ...distributionTable(report),
    '',
    '## Size distribution',
    '',
    '```json',
    JSON.stringify(report.sizeDistribution, null, 2),
    '```',
    '',
    '## Difficulty distribution',
    '',
    '```json',
    JSON.stringify(report.difficultyDistribution, null, 2),
    '```',
    '',
    '## Rank distribution',
    '',
    '```json',
    JSON.stringify(report.rankDistribution, null, 2),
    '```',
    '',
    '## Profile distribution',
    '',
    '```json',
    JSON.stringify(report.profileDistribution, null, 2),
    '```',
    '',
    `Fallback dates: ${report.fallbackDates.length === 0 ? 'none' : report.fallbackDates.join(', ')}`,
    '',
  ].join('\n');
}

async function writeReport(
  report: AuditReport,
  outputDirectory: string,
): Promise<{ readonly jsonPath: string; readonly reportSha256: string }> {
  await mkdir(outputDirectory, { recursive: true });
  const stem = `daily-audit-${report.version}-${report.startDate}-${report.dayCount}`;
  const jsonPath = path.join(outputDirectory, `${stem}.json`);
  const markdownPath = path.join(outputDirectory, `${stem}.md`);
  const checksumPath = path.join(outputDirectory, `${stem}.sha256`);
  const json = canonicalReportJson(report);
  const reportSha256 = createHash('sha256').update(json, 'utf8').digest('hex');
  await writeFile(jsonPath, json, 'utf8');
  await writeFile(markdownPath, reportMarkdown(report, reportSha256), 'utf8');
  await writeFile(checksumPath, `${reportSha256}  ${path.basename(jsonPath)}\n`, 'utf8');
  return { jsonPath, reportSha256 };
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  if (options.version !== DAILY_GENERATOR_RESOURCES.policy.version) {
    throw new Error(
      `Content resources provide ${DAILY_GENERATOR_RESOURCES.policy.version}, not ${options.version}.`,
    );
  }

  const outputHasher = createHash('sha256');
  const sizeDistribution = new Map<string, number>();
  const difficultyDistribution = new Map<string, number>();
  const rankDistribution = new Map<string, number>();
  const profileDistribution = new Map<string, number>();
  const expectedProfileDistribution = new Map<string, number>();
  const exceptionDates: string[] = [];
  const invalidDates: string[] = [];
  const wrongParDates: string[] = [];
  const fallbackDates: string[] = [];
  let adjacentDuplicates = 0;
  let maxAttemptCount = 0;
  let previousTargetHash: string | undefined;
  let firstPuzzleHash: string | undefined;

  for (let dayIndex = 0; dayIndex < options.dayCount; dayIndex += 1) {
    const dateUtc = addUtcDays(options.startDate, dayIndex);
    const scheduledProfile = DAILY_GENERATOR_RESOURCES.policy.profiles.find(
      (profile) => profile.isoWeekday === isoWeekday(dateUtc),
    );
    if (!scheduledProfile) throw new Error(`No profile scheduled for ${dateUtc}.`);
    incrementCounter(expectedProfileDistribution, scheduledProfile.id);

    let diagnostics: DailyDiagnostics;
    try {
      diagnostics = generateDailyPuzzleWithDiagnostics({
        dateUtc,
        generatorVersion: options.version,
      });
    } catch (error) {
      exceptionDates.push(dateUtc);
      console.error(
        `dailyAudit exception date=${dateUtc} message=${error instanceof Error ? error.message : String(error)}`,
      );
      continue;
    }

    const { puzzle } = diagnostics;
    const validation = validateDailyDiagnostics(diagnostics, dateUtc, options.version);
    if (validation.wrongPar) wrongParDates.push(dateUtc);
    if (validation.errors.length > 0) {
      invalidDates.push(dateUtc);
      console.error(`dailyAudit invalid date=${dateUtc} errors=${validation.errors.join(' | ')}`);
    }

    const puzzleHash = puzzleOutputHash(puzzle);
    firstPuzzleHash ??= puzzleHash;
    outputHasher.update(`${serializePuzzleDefinition(puzzle)}\n`, 'utf8');
    incrementCounter(sizeDistribution, String(puzzle.size));
    incrementCounter(difficultyDistribution, puzzle.difficulty);
    incrementCounter(rankDistribution, String(diagnostics.features.rank));
    incrementCounter(profileDistribution, diagnostics.profileId);
    maxAttemptCount = Math.max(maxAttemptCount, diagnostics.attemptCount);
    if (diagnostics.fallbackUsed) fallbackDates.push(dateUtc);
    if (previousTargetHash === diagnostics.targetHash) adjacentDuplicates += 1;
    previousTargetHash = diagnostics.targetHash;
  }

  if (!firstPuzzleHash) throw new Error('Daily audit generated no puzzles.');
  const observedProfiles = sortedCounters(profileDistribution);
  const expectedProfiles = sortedCounters(expectedProfileDistribution);
  const observedSizes = sortedCounters(sizeDistribution);
  const observedDifficulties = sortedCounters(difficultyDistribution);
  const observedRanks = sortedCounters(rankDistribution);
  const sizeAudit = auditDistribution(
    observedSizes,
    options.dayCount,
    GENERATOR_DISTRIBUTION_TARGETS.size,
  );
  const difficultyAudit = auditDistribution(
    observedDifficulties,
    options.dayCount,
    GENERATOR_DISTRIBUTION_TARGETS.difficulty,
  );
  const rankAudit = auditDistribution(
    observedRanks,
    options.dayCount,
    GENERATOR_DISTRIBUTION_TARGETS.rank,
  );
  const profileMismatch =
    stableSerialize(observedProfiles) === stableSerialize(expectedProfiles) ? 0 : 1;
  const distributionFailures =
    profileMismatch + sizeAudit.failures + difficultyAudit.failures + rankAudit.failures;
  const goldenMismatches = auditDailyGoldenVectors(options.version);
  const processParity = runProcessParity(options.startDate, options.version, firstPuzzleHash);
  const report: AuditReport = {
    adjacentDuplicates,
    dayCount: options.dayCount,
    difficultyDistribution: observedDifficulties,
    distributionObservations: {
      difficulty: difficultyAudit.observations,
      rank: rankAudit.observations,
      size: sizeAudit.observations,
    },
    distributionFailures,
    exceptionDates,
    exceptions: exceptionDates.length,
    fallbackCount: fallbackDates.length,
    fallbackDates,
    goldenVectorCount: DAILY_V1_GOLDEN_VECTORS.length,
    goldenMismatches,
    invalid: invalidDates.length,
    invalidDates,
    maxAttemptCount,
    outputHash: outputHasher.digest('hex'),
    processParity,
    profileDistribution: observedProfiles,
    reportSchemaVersion: 1,
    rankDistribution: observedRanks,
    sizeDistribution: observedSizes,
    startDate: options.startDate,
    version: options.version,
    wrongPar: wrongParDates.length,
    wrongParDates,
  };
  const { jsonPath, reportSha256 } = await writeReport(report, options.outputDirectory);
  const failures =
    report.exceptions +
    report.invalid +
    report.wrongPar +
    report.adjacentDuplicates +
    report.distributionFailures +
    report.goldenMismatches +
    report.processParity.hashMismatches +
    report.processParity.diagnosticsHashMismatches;

  console.log(
    `dailyAudit version=${report.version} startDate=${report.startDate} dayCount=${report.dayCount} outputHash=${report.outputHash} reportSha256=${reportSha256} exceptions=${report.exceptions} invalid=${report.invalid} wrongPar=${report.wrongPar} fallbackCount=${report.fallbackCount} maxAttemptCount=${report.maxAttemptCount} adjacentDuplicates=${report.adjacentDuplicates} distributionFailures=${report.distributionFailures} processCount=${report.processParity.processes} timezoneCount=${report.processParity.timezones.length} repeats=${report.processParity.repeatsPerProcess} processHashMismatches=${report.processParity.hashMismatches} diagnosticsHashMismatches=${report.processParity.diagnosticsHashMismatches} goldenVectors=${report.goldenVectorCount} goldenMismatches=${report.goldenMismatches} report=${projectPath(jsonPath)} failures=${failures}`,
  );
  if (failures > 0) process.exitCode = 1;
}

await main();
