import {
  generateDailyPuzzle as generateDomainDailyPuzzle,
  generateDailyPuzzleWithDiagnostics as generateDomainDailyPuzzleWithDiagnostics,
  type DailyGenerationDiagnostics,
  type GenerateDailyPuzzleInput,
  type PuzzleDefinition,
} from '../domain/index.ts';

import {
  dailyGeneratorResourcesForVersion,
  generatorVersionForDate,
} from './generator-registry.ts';
import echoValue from './levels/echo.json';
import noiseValue from './levels/noise.json';
import pulseValue from './levels/pulse.json';
import rankValue from './levels/rank.json';
import tutorialValue from './levels/tutorial.json';

export * from './generator-registry.ts';

interface LevelFileValue {
  readonly chapter: string;
  readonly levels: readonly PuzzleDefinition[];
  readonly schemaVersion: 1;
}

function asLevelFile(value: unknown, expectedChapter: string): LevelFileValue {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`${expectedChapter} content must be an object.`);
  }
  const record = value as Record<string, unknown>;
  if (
    record.schemaVersion !== 1 ||
    record.chapter !== expectedChapter ||
    !Array.isArray(record.levels)
  ) {
    throw new TypeError(`${expectedChapter} content has an invalid envelope.`);
  }
  return value as LevelFileValue;
}

function freezePuzzle(puzzle: PuzzleDefinition): PuzzleDefinition {
  return Object.freeze({
    ...puzzle,
    initialRows: Object.freeze([...puzzle.initialRows]),
    targetRows: Object.freeze([...puzzle.targetRows]),
    tags: Object.freeze([...puzzle.tags]),
    ...(puzzle.canonicalSolution === undefined
      ? {}
      : {
          canonicalSolution: Object.freeze(
            puzzle.canonicalSolution.map((pulse) => Object.freeze({ ...pulse })),
          ),
        }),
    ...(puzzle.tutorialStepIds === undefined
      ? {}
      : { tutorialStepIds: Object.freeze([...puzzle.tutorialStepIds]) }),
  });
}

const LEVEL_FILES = Object.freeze([
  asLevelFile(tutorialValue, 'tutorial'),
  asLevelFile(pulseValue, 'pulse'),
  asLevelFile(echoValue, 'echo'),
  asLevelFile(rankValue, 'rank'),
  asLevelFile(noiseValue, 'noise'),
]);

export const STATIC_LEVELS: readonly PuzzleDefinition[] = Object.freeze(
  LEVEL_FILES.flatMap((file) => file.levels).map(freezePuzzle),
);

const LEVELS_BY_ID = new Map(STATIC_LEVELS.map((puzzle) => [puzzle.id, puzzle]));
if (LEVELS_BY_ID.size !== STATIC_LEVELS.length) {
  throw new Error('Static level catalog contains duplicate IDs.');
}

export const TUTORIAL_LEVELS: readonly PuzzleDefinition[] = Object.freeze(
  STATIC_LEVELS.filter((puzzle) => puzzle.mode === 'tutorial'),
);

export const LAB_LEVELS: readonly PuzzleDefinition[] = Object.freeze(
  STATIC_LEVELS.filter((puzzle) => puzzle.mode === 'lab'),
);

export function getStaticLevel(levelId: string): PuzzleDefinition | undefined {
  return LEVELS_BY_ID.get(levelId);
}

const DAILY_V1_CONTENT = dailyGeneratorResourcesForVersion('v1');

export const DAILY_GENERATOR_RESOURCES = DAILY_V1_CONTENT.generatorResources;
export const GENERATOR_DISTRIBUTION_TARGETS = DAILY_V1_CONTENT.distributionTargets;

export interface GenerateDailyPuzzleRequest {
  readonly dateUtc: string;
  readonly generatorVersion?: string;
}

function resolveDailyRequest(input: GenerateDailyPuzzleRequest): {
  readonly input: GenerateDailyPuzzleInput;
  readonly resources: typeof DAILY_GENERATOR_RESOURCES;
} {
  const generatorVersion = input.generatorVersion ?? generatorVersionForDate(input.dateUtc);
  const versionResources = dailyGeneratorResourcesForVersion(generatorVersion);
  return Object.freeze({
    input: Object.freeze({ dateUtc: input.dateUtc, generatorVersion }),
    resources: versionResources.generatorResources,
  });
}

export function generateDailyPuzzle(input: GenerateDailyPuzzleRequest): PuzzleDefinition {
  const resolved = resolveDailyRequest(input);
  return generateDomainDailyPuzzle(resolved.input, resolved.resources);
}

export function generateDailyPuzzleWithDiagnostics(
  input: GenerateDailyPuzzleRequest,
): DailyGenerationDiagnostics {
  const resolved = resolveDailyRequest(input);
  return generateDomainDailyPuzzleWithDiagnostics(resolved.input, resolved.resources);
}
