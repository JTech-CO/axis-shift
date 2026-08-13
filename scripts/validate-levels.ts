import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { PROJECT_ROOT, projectPath, walkFiles } from './lib/project-files.ts';

const LEVEL_ROOT = path.join(PROJECT_ROOT, 'src', 'content', 'levels');
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const MODES = new Set(['archive', 'daily', 'lab', 'sprint', 'tutorial']);
const DIFFICULTIES = new Set(['easy', 'hard', 'intro', 'master', 'normal']);
const TAGS = new Set([
  'asymmetric',
  'dense',
  'noise',
  'overlap',
  'sparse',
  'symmetric',
  'tutorial',
]);

type JsonObject = Record<string, unknown>;
type RankFunction = (rows: readonly number[], size?: number) => number;
interface EncodedPulse {
  readonly rowMask: number;
  readonly colMask: number;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function levelRecords(value: unknown, filename: string): JsonObject[] {
  const candidate = isObject(value) && Array.isArray(value.levels) ? value.levels : value;
  const records = Array.isArray(candidate) ? candidate : [candidate];
  if (records.some((record) => !isObject(record))) {
    throw new Error(
      `${projectPath(filename)} must contain a puzzle object or an array of puzzle objects.`,
    );
  }
  return records as JsonObject[];
}

function requireInteger(value: unknown, label: string, minimum: number, maximum: number): number {
  if (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    throw new Error(`${label} must be an integer in ${minimum}..${maximum}.`);
  }
  return value as number;
}

function requireRows(value: unknown, size: number, label: string): number[] {
  if (!Array.isArray(value) || value.length !== size) {
    throw new Error(`${label} must contain exactly ${size} rows.`);
  }
  const mask = (1 << size) - 1;
  return value.map((row, index) => requireInteger(row, `${label}[${index}]`, 0, mask));
}

function requireStringEnum(value: unknown, allowed: ReadonlySet<string>, label: string): string {
  if (typeof value !== 'string' || !allowed.has(value)) {
    throw new Error(`${label} must be one of: ${[...allowed].join(', ')}.`);
  }
  return value;
}

function requireNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value;
}

function validatePulse(value: unknown, size: number, label: string): EncodedPulse {
  if (!isObject(value)) throw new Error(`${label} must be an object.`);
  const mask = (1 << size) - 1;
  return {
    rowMask: requireInteger(value.rowMask, `${label}.rowMask`, 1, mask),
    colMask: requireInteger(value.colMask, `${label}.colMask`, 1, mask),
  };
}

function applyPulses(
  initialRows: readonly number[],
  pulses: readonly EncodedPulse[],
  size: number,
): number[] {
  const rows = [...initialRows];
  for (const pulse of pulses) {
    for (let row = 0; row < size; row += 1) {
      if ((pulse.rowMask & (1 << row)) !== 0) rows[row] = (rows[row] ?? 0) ^ pulse.colMask;
    }
  }
  return rows;
}

function proveSolutionValidator(): number {
  const pulse = { rowMask: 0b101, colMask: 0b011 };
  const toggled = applyPulses([0, 0, 0], [pulse], 3);
  const restored = applyPulses(toggled, [pulse], 3);
  if (toggled.join(',') !== '3,0,3' || restored.some((row) => row !== 0)) {
    throw new Error('Canonical solution validator self-check failed.');
  }
  return 2;
}

async function loadRankFunction(): Promise<RankFunction> {
  const entrypoint = path.join(PROJECT_ROOT, 'src', 'domain', 'index.ts');
  let domain: Record<string, unknown>;
  try {
    domain = (await import(pathToFileURL(entrypoint).href)) as Record<string, unknown>;
  } catch (error) {
    throw new Error('Level files exist, but the domain public entrypoint could not be loaded.', {
      cause: error,
    });
  }

  if (typeof domain.rankGF2 !== 'function') {
    throw new Error('Level files exist, but src/domain/index.ts does not export rankGF2.');
  }
  return domain.rankGF2 as RankFunction;
}

async function main(): Promise<void> {
  const validatorSelfChecks = proveSolutionValidator();
  const files = (await walkFiles(LEVEL_ROOT)).filter((filename) => filename.endsWith('.json'));
  if (files.length === 0) {
    console.log(
      `levelValidation root=${projectPath(LEVEL_ROOT)} files=0 levels=0 rankChecks=0 solutionChecks=0 validatorSelfChecks=${validatorSelfChecks} failures=0`,
    );
    return;
  }

  const parsed: { filename: string; record: JsonObject }[] = [];
  for (const filename of files) {
    let value: unknown;
    try {
      value = JSON.parse(await readFile(filename, 'utf8')) as unknown;
    } catch (error) {
      throw new Error(`${projectPath(filename)} is not valid JSON.`, { cause: error });
    }
    for (const record of levelRecords(value, filename)) parsed.push({ filename, record });
  }

  const rankGF2 = await loadRankFunction();
  const ids = new Set<string>();
  const boardPairs = new Set<string>();
  let solutionChecks = 0;

  for (const { filename, record } of parsed) {
    const location = projectPath(filename);
    if (record.schemaVersion !== 1) throw new Error(`${location}: schemaVersion must be 1.`);
    if (typeof record.id !== 'string' || !ID_PATTERN.test(record.id)) {
      throw new Error(`${location}: id must be lowercase kebab-case.`);
    }
    if (ids.has(record.id)) throw new Error(`${location}: duplicate level id ${record.id}.`);
    ids.add(record.id);

    requireNonEmptyString(record.generatorVersion, `${record.id}.generatorVersion`);
    requireStringEnum(record.mode, MODES, `${record.id}.mode`);
    requireStringEnum(record.difficulty, DIFFICULTIES, `${record.id}.difficulty`);
    const size = requireInteger(record.size, `${record.id}.size`, 3, 8);
    const initialRows = requireRows(record.initialRows, size, `${record.id}.initialRows`);
    const targetRows = requireRows(record.targetRows, size, `${record.id}.targetRows`);
    const difference = initialRows.map((row, index) => row ^ (targetRows[index] ?? 0));
    if (difference.every((row) => row === 0)) throw new Error(`${record.id} is already solved.`);

    const pairKey = `${size}:${initialRows.join(',')}:${targetRows.join(',')}`;
    if (boardPairs.has(pairKey)) throw new Error(`${record.id} duplicates another board pair.`);
    boardPairs.add(pairKey);

    const storedPar = requireInteger(
      record.optimalPulseCount,
      `${record.id}.optimalPulseCount`,
      1,
      size,
    );
    const actualPar = rankGF2(difference, size);
    if (actualPar !== storedPar) {
      throw new Error(`${record.id} stores par ${storedPar}, but rankGF2 returned ${actualPar}.`);
    }
    if (!Number.isFinite(record.complexityScore) || (record.complexityScore as number) < 0) {
      throw new Error(`${record.id}.complexityScore must be a non-negative finite number.`);
    }
    if (
      !Array.isArray(record.tags) ||
      record.tags.some((tag) => typeof tag !== 'string' || !TAGS.has(tag))
    ) {
      throw new Error(`${record.id}.tags contains an unsupported value.`);
    }
    if (record.canonicalSolution !== undefined) {
      if (
        !Array.isArray(record.canonicalSolution) ||
        record.canonicalSolution.length !== storedPar
      ) {
        throw new Error(`${record.id}.canonicalSolution must contain exactly ${storedPar} pulses.`);
      }
      const pulses = record.canonicalSolution.map((pulse, index) =>
        validatePulse(pulse, size, `${record.id}.canonicalSolution[${index}]`),
      );
      const solvedRows = applyPulses(initialRows, pulses, size);
      if (solvedRows.some((row, index) => row !== targetRows[index])) {
        throw new Error(`${record.id}.canonicalSolution does not produce targetRows.`);
      }
      solutionChecks += 1;
    }
  }

  console.log(
    `levelValidation root=${projectPath(LEVEL_ROOT)} files=${files.length} levels=${parsed.length} rankChecks=${parsed.length} solutionChecks=${solutionChecks} validatorSelfChecks=${validatorSelfChecks} failures=0`,
  );
}

await main();
