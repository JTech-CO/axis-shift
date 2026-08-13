import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { PROJECT_ROOT, pathExists, projectPath, walkFiles } from './lib/project-files.ts';

const GENERATOR_ROOT = path.join(PROJECT_ROOT, 'src', 'domain', 'generator');
const REPRESENTATIVE_DATES = [
  '2024-02-29',
  '2025-01-01',
  '2025-12-31',
  '2026-03-08',
  '2026-08-09',
  '2026-11-01',
  '2027-01-01',
  '2028-02-29',
  '2030-06-30',
  '2035-12-31',
] as const;

type DailyGenerator = (input: {
  readonly dateUtc: string;
  readonly generatorVersion: string;
}) => unknown | Promise<unknown>;
type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function containsDailyImplementation(source: string): boolean {
  return /\bgenerateDaily(?:Puzzle)?\b/u.test(source);
}

function proveImplementationDetection(): number {
  if (
    containsDailyImplementation('export {};') ||
    !containsDailyImplementation('export function generateDailyPuzzle() {}')
  ) {
    throw new Error('Daily implementation detector self-check failed.');
  }
  return 2;
}

function assertDailyPuzzle(value: unknown, expectedVersion: string, dateUtc: string): void {
  if (!isObject(value)) {
    throw new Error(`Daily generator returned a non-object for ${dateUtc}.`);
  }
  if (typeof value.id !== 'string' || value.id.trim().length === 0) {
    throw new Error(`Daily generator returned a puzzle without an id for ${dateUtc}.`);
  }
  if (value.mode !== 'daily') {
    throw new Error(`Daily generator returned mode ${String(value.mode)} for ${dateUtc}.`);
  }
  if (value.generatorVersion !== expectedVersion) {
    throw new Error(`Daily generator version mismatch for ${dateUtc}.`);
  }
  if (!Number.isInteger(value.size) || (value.size as number) < 3 || (value.size as number) > 8) {
    throw new Error(`Daily generator returned an invalid size for ${dateUtc}.`);
  }
  const size = value.size as number;
  const mask = (1 << size) - 1;
  const validRows = (rows: unknown): rows is number[] =>
    Array.isArray(rows) &&
    rows.length === size &&
    rows.every((row) => Number.isInteger(row) && row >= 0 && row <= mask);
  const initialRows = value.initialRows;
  const targetRows = value.targetRows;
  if (!validRows(initialRows) || !validRows(targetRows)) {
    throw new Error(`Daily generator returned invalid board rows for ${dateUtc}.`);
  }
  if (initialRows.every((row, index) => row === targetRows[index])) {
    throw new Error(`Daily generator returned an already-solved puzzle for ${dateUtc}.`);
  }
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  if (typeof value === 'object' && value !== null) {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(object[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

async function main(): Promise<void> {
  const detectorSelfChecks = proveImplementationDetection();
  const sourceFiles = (await walkFiles(GENERATOR_ROOT)).filter(
    (filename) => /\.(?:ts|tsx)$/u.test(filename) && !/\.(?:test|spec)\.[^.]+$/u.test(filename),
  );

  const sourceByFile = new Map<string, string>();
  for (const filename of sourceFiles) {
    const source = await readFile(filename, 'utf8');
    sourceByFile.set(filename, source);
    if (/\bMath\.random\s*\(/u.test(source) || /\bDate\.now\s*\(/u.test(source)) {
      throw new Error(`${projectPath(filename)} uses ambient random or current time.`);
    }
  }

  const implementationFiles = sourceFiles.filter((filename) =>
    containsDailyImplementation(sourceByFile.get(filename) ?? ''),
  );
  if (implementationFiles.length === 0) {
    console.log(
      `dailyAudit root=${projectPath(GENERATOR_ROOT)} sourceFiles=${sourceFiles.length} implementations=0 dates=0 repeats=0 puzzleChecks=0 detectorSelfChecks=${detectorSelfChecks} failures=0`,
    );
    return;
  }

  const publicEntrypoint = path.join(GENERATOR_ROOT, 'index.ts');
  if (!(await pathExists(publicEntrypoint))) {
    throw new Error('Daily generator implementation exists without src/domain/generator/index.ts.');
  }
  const generatorModule = (await import(pathToFileURL(publicEntrypoint).href)) as Record<
    string,
    unknown
  >;
  const generator = generatorModule.generateDailyPuzzle ?? generatorModule.generateDaily;
  const version = generatorModule.DAILY_GENERATOR_VERSION ?? generatorModule.GENERATOR_VERSION;
  if (typeof generator !== 'function' || typeof version !== 'string' || version.length === 0) {
    throw new Error(
      'Daily generator public API must export generateDailyPuzzle (or generateDaily) and a non-empty generator version.',
    );
  }

  for (const dateUtc of REPRESENTATIVE_DATES) {
    const input = { dateUtc, generatorVersion: version };
    const generated = await Promise.all(
      Array.from({ length: 3 }, async () => (generator as DailyGenerator)(input)),
    );
    generated.forEach((puzzle) => assertDailyPuzzle(puzzle, version, dateUtc));
    const outputs = generated.map(stableSerialize);
    if (new Set(outputs).size !== 1 || outputs[0] === undefined) {
      throw new Error(`Daily generator is not deterministic for ${dateUtc}.`);
    }
  }

  console.log(
    `dailyAudit root=${projectPath(GENERATOR_ROOT)} sourceFiles=${sourceFiles.length} implementations=${implementationFiles.length} dates=${REPRESENTATIVE_DATES.length} repeats=3 puzzleChecks=${REPRESENTATIVE_DATES.length * 3} detectorSelfChecks=${detectorSelfChecks} failures=0`,
  );
}

await main();
