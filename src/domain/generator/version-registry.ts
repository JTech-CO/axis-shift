import type { PuzzleDefinition } from '../types.ts';
import {
  generateDailyV1,
  generateDailyV1WithDiagnostics,
  type DailyGenerationDiagnostics,
  type GenerateDailyPuzzleInput,
} from './daily-generator.ts';
import type { DailyGeneratorResources } from './generator-config.ts';

export const DAILY_GENERATOR_VERSION = 'v1';
export const SUPPORTED_DAILY_GENERATOR_VERSIONS = [DAILY_GENERATOR_VERSION] as const;
export type DailyGeneratorVersion = (typeof SUPPORTED_DAILY_GENERATOR_VERSIONS)[number];

type PuzzleGenerator = (
  input: GenerateDailyPuzzleInput,
  resources: DailyGeneratorResources,
) => PuzzleDefinition;
type DiagnosticGenerator = (
  input: GenerateDailyPuzzleInput,
  resources: DailyGeneratorResources,
) => DailyGenerationDiagnostics;

const PUZZLE_REGISTRY: Readonly<Record<DailyGeneratorVersion, PuzzleGenerator>> = Object.freeze({
  v1: generateDailyV1,
});
const DIAGNOSTIC_REGISTRY: Readonly<Record<DailyGeneratorVersion, DiagnosticGenerator>> =
  Object.freeze({ v1: generateDailyV1WithDiagnostics });

function assertSupportedVersion(version: string): asserts version is DailyGeneratorVersion {
  if (!SUPPORTED_DAILY_GENERATOR_VERSIONS.some((candidate) => candidate === version)) {
    throw new RangeError(`Unsupported Daily generator version: ${version}.`);
  }
}

export function generateDailyPuzzle(
  input: GenerateDailyPuzzleInput,
  resources: DailyGeneratorResources,
): PuzzleDefinition {
  assertSupportedVersion(input.generatorVersion);
  return PUZZLE_REGISTRY[input.generatorVersion](input, resources);
}

export function generateDailyPuzzleWithDiagnostics(
  input: GenerateDailyPuzzleInput,
  resources: DailyGeneratorResources,
): DailyGenerationDiagnostics {
  assertSupportedVersion(input.generatorVersion);
  return DIAGNOSTIC_REGISTRY[input.generatorVersion](input, resources);
}
