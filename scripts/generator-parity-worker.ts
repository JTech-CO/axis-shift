import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { generateDailyPuzzleWithDiagnostics } from '../src/content/index.ts';
import { puzzleOutputHash, stableSerialize } from '../src/domain/index.ts';

interface WorkerOptions {
  readonly dateUtc: string;
  readonly repeats: number;
  readonly version: string;
}

interface WorkerResult {
  readonly dateUtc: string;
  readonly diagnosticsHash: string;
  readonly diagnosticsMismatches: number;
  readonly puzzleHash: string;
  readonly puzzleMismatches: number;
  readonly repeats: number;
  readonly version: string;
}

function requiredOption(arguments_: readonly string[], name: string): string {
  const index = arguments_.indexOf(name);
  const value = index < 0 ? undefined : arguments_[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`Missing required option ${name}.`);
  return value;
}

function parseOptions(arguments_: readonly string[]): WorkerOptions {
  const allowed = new Set(['--date', '--repeats', '--version']);
  for (let index = 0; index < arguments_.length; index += 2) {
    const name = arguments_[index];
    if (!name || !allowed.has(name)) throw new Error(`Unsupported worker option ${String(name)}.`);
    if (arguments_[index + 1] === undefined) throw new Error(`Missing value for ${name}.`);
  }

  const repeatsText = requiredOption(arguments_, '--repeats');
  const repeats = Number(repeatsText);
  if (!Number.isInteger(repeats) || repeats < 1 || repeats > 100) {
    throw new RangeError('--repeats must be an integer in 1..100.');
  }

  return {
    dateUtc: requiredOption(arguments_, '--date'),
    repeats,
    version: requiredOption(arguments_, '--version'),
  };
}

export function runGeneratorParityWorker(options: WorkerOptions): WorkerResult {
  let expectedPuzzleHash: string | undefined;
  let expectedDiagnostics: string | undefined;
  let puzzleMismatches = 0;
  let diagnosticsMismatches = 0;

  for (let repeat = 0; repeat < options.repeats; repeat += 1) {
    const diagnostics = generateDailyPuzzleWithDiagnostics({
      dateUtc: options.dateUtc,
      generatorVersion: options.version,
    });
    const puzzleHash = puzzleOutputHash(diagnostics.puzzle);
    const serializedDiagnostics = stableSerialize(diagnostics);
    const diagnosticsHash = createHash('sha256').update(serializedDiagnostics).digest('hex');

    expectedPuzzleHash ??= puzzleHash;
    expectedDiagnostics ??= diagnosticsHash;
    if (puzzleHash !== expectedPuzzleHash) puzzleMismatches += 1;
    if (diagnosticsHash !== expectedDiagnostics) diagnosticsMismatches += 1;
  }

  if (!expectedPuzzleHash || expectedDiagnostics === undefined) {
    throw new Error('Generator parity worker produced no output.');
  }

  return {
    dateUtc: options.dateUtc,
    diagnosticsHash: expectedDiagnostics,
    diagnosticsMismatches,
    puzzleHash: expectedPuzzleHash,
    puzzleMismatches,
    repeats: options.repeats,
    version: options.version,
  };
}

async function main(): Promise<void> {
  const result = runGeneratorParityWorker(parseOptions(process.argv.slice(2)));
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(path.resolve(entrypoint)).href) {
  await main();
}
