import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  applyPulse,
  boardsEqual,
  composePulses,
  differenceRows,
  factorizeGF2,
  rankGF2,
  validateBoard,
} from "./core.mjs";
import { analyzeDifficulty } from "./difficulty.mjs";
import {
  M00_CONTROL_PROFILES,
  M00_DENSITY_RANGE,
  M00_GENERATOR_MAX_ATTEMPTS,
  M00_GENERATOR_VERSION,
  M00_STAGE_PROFILES,
  generateM00Candidate,
  getM00FallbackBoards,
  getM00StageProfile,
} from "./m00-seeded-generator.mjs";
import { analyzeCompletedRun } from "./play-analysis.mjs";
import {
  FIXTURES,
  STAGES,
  generateStageFixture,
  getFixture,
  getNextStage,
  getStage,
  normalizeSeed,
} from "./fixtures.mjs";
import {
  beginPulse,
  commitPulse,
  createSession,
  resetSession,
  toggleCol,
  toggleRow,
  undoSession,
} from "./session.mjs";
import {
  completeStopwatch,
  createStopwatch,
  formatElapsedSeconds,
  formatStopwatch,
  pauseStopwatch,
  readStopwatch,
  resetStopwatch,
  startStopwatch,
} from "./stopwatch.mjs";

let assertions = 0;

function equal(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

function same(actual, expected, message) {
  assert.strictEqual(actual, expected, message);
  assertions += 1;
}

function truthy(actual, message) {
  assert.ok(actual, message);
  assertions += 1;
}

function throws(action, message) {
  assert.throws(action, message);
  assertions += 1;
}

function encodeRows(rows, size) {
  return rows.reduce((state, row, index) => state | (row << (index * size)), 0);
}

function decodeRows(state, size) {
  const mask = (1 << size) - 1;
  return Array.from({ length: size }, (_, index) =>
    (state >> (index * size)) & mask,
  );
}

function encodePulse(rowMask, colMask, size) {
  let state = 0;
  for (let row = 0; row < size; row += 1) {
    if (((rowMask >> row) & 1) === 0) continue;
    for (let col = 0; col < size; col += 1) {
      if (((colMask >> col) & 1) === 1) {
        state |= 1 << (row * size + col);
      }
    }
  }
  return state;
}

function countBits(value) {
  let count = 0;
  for (let remaining = value; remaining !== 0; remaining >>>= 1) {
    count += remaining & 1;
  }
  return count;
}

function boardDensity(rows, size) {
  return rows.reduce((total, row) => total + countBits(row), 0) / (size * size);
}

function applyPulseRowLoopOracle(rows, size, rowMask, colMask) {
  const next = [...rows];
  for (let row = 0; row < size; row += 1) {
    if (((rowMask >> row) & 1) === 1) next[row] ^= colMask;
  }
  return next;
}

function indexCombinations(size, order) {
  const combinations = [];
  const selection = [];

  function choose(start) {
    if (selection.length === order) {
      combinations.push([...selection]);
      return;
    }

    const remaining = order - selection.length;
    for (let index = start; index <= size - remaining; index += 1) {
      selection.push(index);
      choose(index + 1);
      selection.pop();
    }
  }

  choose(0);
  return combinations;
}

function minorLeibnizParity(rows, rowIndices, colIndices) {
  const usedColumns = Array(colIndices.length).fill(false);
  let parity = 0;

  function visit(rowOffset) {
    if (rowOffset === rowIndices.length) {
      parity ^= 1;
      return;
    }

    const row = rows[rowIndices[rowOffset]];
    for (let colOffset = 0; colOffset < colIndices.length; colOffset += 1) {
      if (usedColumns[colOffset]) continue;
      const col = colIndices[colOffset];
      if (((row >> col) & 1) === 0) continue;

      usedColumns[colOffset] = true;
      visit(rowOffset + 1);
      usedColumns[colOffset] = false;
    }
  }

  // In GF(2), +1 and -1 are equal, so Leibniz signs collapse to parity.
  visit(0);
  return parity;
}

function hasNonzeroMinorLeibniz(rows, size, order) {
  if (!Number.isInteger(order) || order < 0 || order > size) {
    throw new RangeError("minor order must be between 0 and board size");
  }
  if (order === 0) return true;

  const combinations = indexCombinations(size, order);
  for (const rowIndices of combinations) {
    for (const colIndices of combinations) {
      if (minorLeibnizParity(rows, rowIndices, colIndices) === 1) return true;
    }
  }
  return false;
}

function buildIndependentOracle(size) {
  if (size !== 4) {
    throw new RangeError("the exhaustive M00 oracle is limited to 4x4 boards");
  }

  const axisMask = (1 << size) - 1;
  const stateCount = 1 << (size * size);
  const pulseStates = [];

  for (let rowMask = 1; rowMask <= axisMask; rowMask += 1) {
    for (let colMask = 1; colMask <= axisMask; colMask += 1) {
      pulseStates.push(encodePulse(rowMask, colMask, size));
    }
  }

  equal(pulseStates.length, 225, "4x4 legal pulse count");
  equal(new Set(pulseStates).size, 225, "4x4 pulse states are unique");

  const distances = new Int8Array(stateCount);
  distances.fill(-1);
  const queue = new Uint32Array(stateCount);
  let head = 0;
  let tail = 1;
  distances[0] = 0;
  queue[0] = 0;

  while (head < tail) {
    const state = queue[head];
    head += 1;
    const nextDistance = distances[state] + 1;

    for (const pulseState of pulseStates) {
      const next = state ^ pulseState;
      if (distances[next] !== -1) continue;
      distances[next] = nextDistance;
      queue[tail] = next;
      tail += 1;
    }
  }

  equal(tail, stateCount, "BFS visits every 4x4 matrix");
  return { size, distances, pulseCount: pulseStates.length, visited: tail };
}

function oracleDistanceFor(fixture, oracle) {
  if (fixture.size !== oracle.size) return null;
  const packed = encodeRows(
    differenceRows(fixture.initialRows, fixture.targetRows, fixture.size),
    fixture.size,
  );
  return oracle.distances[packed];
}

function selectMask(session, rowMask, colMask, size) {
  let next = session;
  for (let row = 0; row < size; row += 1) {
    if (((rowMask >> row) & 1) === 1) next = toggleRow(next, row);
  }
  for (let col = 0; col < size; col += 1) {
    if (((colMask >> col) & 1) === 1) next = toggleCol(next, col);
  }
  return next;
}

const main = STAGES[0];
const backup = getFixture("M00-BACKUP-v1");

const idleStopwatch = createStopwatch();
equal(
  idleStopwatch,
  {
    elapsedMs: 0,
    runningSince: null,
    hasStarted: false,
    completedMs: null,
  },
  "stopwatch starts idle",
);
truthy(Object.isFrozen(idleStopwatch), "stopwatch state is immutable");
same(readStopwatch(idleStopwatch, 0), 0, "idle stopwatch reads zero");
same(
  pauseStopwatch(idleStopwatch, 50),
  idleStopwatch,
  "pausing an idle stopwatch is a no-op",
);

const runningStopwatch = startStopwatch(idleStopwatch, 100);
same(readStopwatch(runningStopwatch, 350), 250, "running stopwatch accumulates time");
same(
  startStopwatch(runningStopwatch, 400),
  runningStopwatch,
  "starting a running stopwatch is a no-op",
);
const pausedStopwatch = pauseStopwatch(runningStopwatch, 350);
same(readStopwatch(pausedStopwatch, 900), 250, "paused stopwatch excludes later time");
equal(
  pausedStopwatch,
  {
    elapsedMs: 250,
    runningSince: null,
    hasStarted: true,
    completedMs: null,
  },
  "pause stores accumulated elapsed time",
);

const resumedStopwatch = startStopwatch(pausedStopwatch, 900);
const completedStopwatch = completeStopwatch(resumedStopwatch, 1150);
same(readStopwatch(completedStopwatch, 5000), 500, "completed stopwatch stays frozen");
same(completedStopwatch.completedMs, 500, "completion captures elapsed time");
const reopenedStopwatch = startStopwatch(completedStopwatch, 1200);
same(reopenedStopwatch.completedMs, null, "restart clears completed marker");
same(readStopwatch(reopenedStopwatch, 1300), 600, "restart resumes accumulated time");
equal(resetStopwatch(), idleStopwatch, "reset returns a fresh idle stopwatch");

same(formatStopwatch(0), "00:00.0", "timer formats zero");
same(formatStopwatch(61_249), "01:01.2", "timer formats minutes and tenths");
same(formatElapsedSeconds(1_099), "1.0초", "result time floors to tenths");
throws(() => startStopwatch(idleStopwatch, -1), "stopwatch rejects negative time");
throws(() => readStopwatch(idleStopwatch, Number.NaN), "stopwatch rejects NaN time");
throws(() => formatStopwatch(-1), "timer formatter rejects negative elapsed time");
throws(
  () => formatElapsedSeconds(Number.POSITIVE_INFINITY),
  "result formatter rejects infinite elapsed time",
);

same(STAGES.length, 6, "prototype exposes six difficulty-by-size stages");
equal(
  STAGES.map(({ stageId, difficulty, size, par, structuralClass }) => ({
    stageId,
    difficulty,
    size,
    par,
    structuralClass,
  })),
  [
    {
      stageId: "easy",
      difficulty: "easy",
      size: 4,
      par: 2,
      structuralClass: "intro",
    },
    {
      stageId: "normal",
      difficulty: "normal",
      size: 4,
      par: 3,
      structuralClass: "standard",
    },
    {
      stageId: "normal-5",
      difficulty: "normal",
      size: 5,
      par: 3,
      structuralClass: "standard",
    },
    {
      stageId: "hard-4",
      difficulty: "hard",
      size: 4,
      par: 2,
      structuralClass: "anti-sweep",
    },
    {
      stageId: "hard-5",
      difficulty: "hard",
      size: 5,
      par: 3,
      structuralClass: "anti-sweep",
    },
    {
      stageId: "hard-6",
      difficulty: "hard",
      size: 6,
      par: 3,
      structuralClass: "anti-sweep",
    },
  ],
  "stage order and difficulty contract",
);
equal(new Set(STAGES.map(({ id }) => id)).size, 6, "stage fixture ids are unique");
equal(
  new Set(STAGES.map(({ size, targetRows }) => size + ":" + targetRows.join(","))).size,
  6,
  "stage targets are unique",
);
same(STAGES[0], main, "current M00 fixture remains the Easy stage");
truthy(!STAGES.includes(backup), "backup stays outside the playable stage path");
same(getNextStage("easy"), STAGES[1], "Easy 4x4 advances to Normal 4x4");
same(getNextStage("normal"), STAGES[2], "Normal 4x4 advances to Normal 5x5");
same(getNextStage("normal-5"), STAGES[3], "Normal 5x5 advances to Hard 4x4");
same(getNextStage("hard-4"), STAGES[4], "Hard 4x4 advances to Hard 5x5");
same(getNextStage("hard-5"), STAGES[5], "Hard 5x5 advances to Hard 6x6");
same(getNextStage("hard-6"), STAGES[0], "Hard 6x6 wraps to Easy 4x4");
same(getStage("easy-4"), STAGES[0], "size-explicit Easy route resolves to Easy 4x4");
same(getStage("normal-4"), STAGES[1], "size-explicit Normal route resolves to Normal 4x4");
same(getStage("hard-4"), STAGES[3], "Hard 4x4 route resolves to rank-2 playable stage");
same(
  getStage("full-rank"),
  getFixture("M00-HARD-v1"),
  "Full Rank route resolves to the hidden control",
);
same(getStage("hard"), getStage("full-rank"), "legacy hard route resolves to Full Rank");
truthy(!STAGES.includes(getStage("full-rank")), "Full Rank control is outside playable stages");
same(getNextStage("hard"), STAGES[4], "legacy hard control advances to Hard 5x5");

equal(
  analyzeCompletedRun([]),
  { kind: "none", shouldShowSweepGuidance: false },
  "empty completion is not a sweep",
);
equal(
  analyzeCompletedRun([{ rowMask: 15, colMask: 1 }]),
  { kind: "none", shouldShowSweepGuidance: false },
  "one-move trivial completion is not a sweep",
);
const columnSweepAnalysis = analyzeCompletedRun(getStage("full-rank").canonicalPulses);
equal(
  columnSweepAnalysis,
  { kind: "column", shouldShowSweepGuidance: true },
  "Full Rank singleton-column solution is a column sweep completion",
);
truthy(Object.isFrozen(columnSweepAnalysis), "sweep analysis result is immutable");
equal(
  analyzeCompletedRun([
    { rowMask: 1, colMask: 3 },
    { rowMask: 2, colMask: 5 },
    { rowMask: 4, colMask: 6 },
  ]),
  { kind: "row", shouldShowSweepGuidance: true },
  "singleton-row solution is a row sweep completion",
);
equal(
  analyzeCompletedRun([
    { rowMask: 3, colMask: 1 },
    { rowMask: 1, colMask: 3 },
  ]),
  { kind: "none", shouldShowSweepGuidance: false },
  "mixed-axis completion is not a sweep",
);
equal(
  analyzeCompletedRun(getStage("easy").canonicalPulses),
  { kind: "none", shouldShowSweepGuidance: false },
  "Easy canonical multi-axis solution is a normal completion",
);
equal(
  analyzeCompletedRun(getStage("hard-5").canonicalPulses),
  { kind: "none", shouldShowSweepGuidance: false },
  "5x5 canonical multi-axis solution is a normal completion",
);
equal(
  analyzeCompletedRun(getStage("hard-6").canonicalPulses),
  { kind: "none", shouldShowSweepGuidance: false },
  "6x6 canonical multi-axis solution is a normal completion",
);
equal(
  analyzeCompletedRun([
    { rowMask: 1, colMask: 1 },
    { rowMask: 2, colMask: 2 },
  ]),
  { kind: "column", shouldShowSweepGuidance: true },
  "all-singleton tie resolves deterministically to column sweep",
);
throws(() => analyzeCompletedRun(null), "sweep analyzer rejects non-array input");
throws(
  () => analyzeCompletedRun([{ rowMask: 0, colMask: 1 }]),
  "sweep analyzer rejects an empty axis mask",
);

validateBoard(main.initialRows, 4);
assertions += 1;
throws(() => validateBoard([0, 0], 2), "size below range is rejected");
throws(() => validateBoard(Array(9).fill(0), 9), "size above range is rejected");
throws(() => validateBoard([0, 0, 0], 4), "row length mismatch is rejected");
throws(() => validateBoard([0, -1, 0, 0], 4), "negative row is rejected");
throws(() => validateBoard([0, 1.5, 0, 0], 4), "fraction row is rejected");
throws(() => validateBoard([0, Number.NaN, 0, 0], 4), "NaN row is rejected");
throws(() => validateBoard([0, 16, 0, 0], 4), "outside bit is rejected");

const guardInput = [3, 5, 15, 0];
const guardSnapshot = [...guardInput];
const affected = applyPulse(guardInput, 4, 5, 10);
equal(affected, [9, 5, 5, 0], "only Cartesian intersections change");
equal(guardInput, guardSnapshot, "applyPulse does not mutate input");
const emptyPulse = applyPulse(guardInput, 4, 0, 10);
equal(emptyPulse, guardInput, "empty axis pulse is a no-op");
truthy(emptyPulse !== guardInput, "empty axis returns a fresh copy");
throws(() => applyPulse(guardInput, 4, 16, 1), "outside row mask is rejected");
throws(() => applyPulse(guardInput, 4, 1, 16), "outside col mask is rejected");

same(M00_GENERATOR_VERSION, "m00-seeded-v1", "M00 generator version is explicit");
same(M00_GENERATOR_MAX_ATTEMPTS, 512, "M00 generator retry bound is explicit");
equal(M00_DENSITY_RANGE, { min: 0.22, max: 0.68 }, "M00 density range contract");
const generatorSource = readFileSync(
  new URL("./m00-seeded-generator.mjs", import.meta.url),
  "utf8",
);
same(generatorSource.includes("Math.random"), false, "generator has no ambient Math RNG");
same(/\bcrypto\b/u.test(generatorSource), false, "generator has no ambient crypto RNG");
same(normalizeSeed("  ＡＸＩＳ  "), "AXIS", "seed normalization trims and applies NFKC");
same(normalizeSeed(""), "0", "empty seed normalizes to the zero seed");
same(normalizeSeed(42), "42", "finite numeric seed is stable");
same(normalizeSeed(42n), "42", "bigint seed is stable");
throws(() => normalizeSeed(Number.NaN), "NaN seed is rejected");
throws(() => normalizeSeed(Number.POSITIVE_INFINITY), "infinite seed is rejected");
throws(() => normalizeSeed(undefined), "missing seed is rejected");
throws(() => normalizeSeed({}), "object seed is rejected");
throws(() => getM00StageProfile("unknown"), "unknown generator profile is rejected");

const generatorSeeds = Object.freeze([
  "0",
  "1",
  "2",
  "pilot-a",
  "pilot-b",
  "2026-08-09",
  "2026-08-10",
  "한글-seed",
  "AXIS//SHIFT",
  "4294967295",
  "-17",
  "normal-seed",
]);

// If one of these literals changes, bump M00_GENERATOR_VERSION or record an
// intentional golden migration before updating the expected value.
const generatorGoldenVectors = Object.freeze({
  "easy-4": {
    seed: "golden-v1",
    initialRows: [0, 0, 0, 0],
    targetRows: [11, 12, 12, 11],
    generationAttempt: 3,
    fallbackUsed: false,
    seedKey: "3f557851",
    puzzleKey:
      "m00-seeded-v1|easy-4|3f557851|0067006f006c00640065006e002d00760031",
    canonicalPulses: [
      { rowMask: 9, colMask: 11 },
      { rowMask: 6, colMask: 12 },
    ],
  },
  "normal-4": {
    seed: "golden-v1",
    initialRows: [0, 0, 0, 0],
    targetRows: [12, 2, 7, 14],
    generationAttempt: 1,
    fallbackUsed: false,
    seedKey: "786aeaec",
    puzzleKey:
      "m00-seeded-v1|normal-4|786aeaec|0067006f006c00640065006e002d00760031",
    canonicalPulses: [
      { rowMask: 4, colMask: 9 },
      { rowMask: 14, colMask: 2 },
      { rowMask: 13, colMask: 12 },
    ],
  },
  "normal-5": {
    seed: "golden-v1",
    initialRows: [0, 0, 0, 0, 0],
    targetRows: [25, 7, 10, 30, 0],
    generationAttempt: 1,
    fallbackUsed: false,
    seedKey: "aa263c7f",
    puzzleKey:
      "m00-seeded-v1|normal-5|aa263c7f|0067006f006c00640065006e002d00760031",
    canonicalPulses: [
      { rowMask: 3, colMask: 25 },
      { rowMask: 14, colMask: 10 },
      { rowMask: 10, colMask: 20 },
    ],
  },
  "hard-4": {
    seed: "golden-v1",
    initialRows: [9, 3, 0, 12],
    targetRows: [8, 13, 1, 2],
    generationAttempt: 1,
    fallbackUsed: false,
    seedKey: "1d202386",
    puzzleKey:
      "m00-seeded-v1|hard-4|1d202386|0067006f006c00640065006e002d00760031",
    canonicalPulses: [
      { rowMask: 5, colMask: 1 },
      { rowMask: 10, colMask: 14 },
    ],
  },
  "hard-5": {
    seed: "golden-v1",
    initialRows: [0, 0, 0, 0, 0],
    targetRows: [7, 14, 31, 9, 7],
    generationAttempt: 1,
    fallbackUsed: false,
    seedKey: "3fc76c59",
    puzzleKey:
      "m00-seeded-v1|hard-5|3fc76c59|0067006f006c00640065006e002d00760031",
    canonicalPulses: [
      { rowMask: 29, colMask: 17 },
      { rowMask: 23, colMask: 22 },
      { rowMask: 14, colMask: 24 },
    ],
  },
  "hard-6": {
    seed: "golden-v1",
    initialRows: [0, 0, 0, 0, 0, 0],
    targetRows: [63, 49, 14, 9, 7, 56],
    generationAttempt: 1,
    fallbackUsed: false,
    seedKey: "e269905c",
    puzzleKey:
      "m00-seeded-v1|hard-6|e269905c|0067006f006c00640065006e002d00760031",
    canonicalPulses: [
      { rowMask: 27, colMask: 49 },
      { rowMask: 21, colMask: 54 },
      { rowMask: 45, colMask: 56 },
    ],
  },
  "full-rank-control": {
    seed: "golden-v1",
    initialRows: [0, 0, 0, 0],
    targetRows: [12, 13, 14, 9],
    generationAttempt: 1,
    fallbackUsed: false,
    seedKey: "cb33e366",
    puzzleKey:
      "m00-seeded-v1|full-rank-control|cb33e366|0067006f006c00640065006e002d00760031",
    canonicalPulses: [
      { rowMask: 10, colMask: 1 },
      { rowMask: 4, colMask: 2 },
      { rowMask: 7, colMask: 4 },
      { rowMask: 15, colMask: 8 },
    ],
  },
});

for (const [profileId, expected] of Object.entries(generatorGoldenVectors)) {
  const generated = generateM00Candidate(profileId, expected.seed);
  equal(
    {
      seed: generated.seed,
      initialRows: generated.initialRows,
      targetRows: generated.targetRows,
      generationAttempt: generated.generationAttempt,
      fallbackUsed: generated.fallbackUsed,
      seedKey: generated.seedKey,
      puzzleKey: generated.puzzleKey,
      canonicalPulses: generated.canonicalPulses,
    },
    expected,
    profileId + " generator-version golden vector",
  );
}

for (const [profileId, profile] of Object.entries(M00_STAGE_PROFILES)) {
  same(getM00StageProfile(profileId), profile, profileId + " profile lookup is stable");
  truthy(Object.isFrozen(profile), profileId + " profile is immutable");
  const targetSignatures = new Set();
  const puzzleKeys = new Set();

  for (const seed of generatorSeeds) {
    const generated = generateM00Candidate(profileId, seed);
    const repeated = generateM00Candidate(profileId, seed);
    const stageFixture = generateStageFixture(profileId, seed);
    const repeatedStageFixture = generateStageFixture(profileId, seed);
    const baseStage = getStage(profileId);
    const difficulty = analyzeDifficulty(generated);
    const generatedDifference = differenceRows(
      generated.initialRows,
      generated.targetRows,
      generated.size,
    );
    const context = profileId + " seed=" + seed;

    equal(repeated, generated, context + " candidate is deterministic");
    equal(repeatedStageFixture, stageFixture, context + " stage fixture is deterministic");
    truthy(Object.isFrozen(generated), context + " candidate is immutable");
    truthy(Object.isFrozen(generated.initialRows), context + " initial rows are immutable");
    truthy(
      Object.isFrozen(generated.differenceRows),
      context + " difference rows are immutable",
    );
    truthy(Object.isFrozen(generated.targetRows), context + " target rows are immutable");
    truthy(
      Object.isFrozen(generated.canonicalPulses),
      context + " canonical pulses are immutable",
    );
    same(generated.generatorVersion, M00_GENERATOR_VERSION, context + " version");
    same(generated.profileId, profileId, context + " profile id");
    same(generated.size, profile.size, context + " size");
    same(generated.par, profile.rank, context + " Par");
    same(generated.structuralClass, profile.structuralClass, context + " structure");
    same(generated.seed, normalizeSeed(seed), context + " normalized seed");
    truthy(
      generated.generationAttempt >= 1 &&
        generated.generationAttempt <= M00_GENERATOR_MAX_ATTEMPTS,
      context + " generation attempt stays within the deterministic bound",
    );
    same(typeof generated.fallbackUsed, "boolean", context + " fallback marker");
    truthy(
      generated.targetRows.some((row, index) => row !== generated.initialRows[index]),
      context + " target differs from initial board",
    );
    validateBoard(generated.initialRows, generated.size);
    assertions += 1;
    validateBoard(generated.differenceRows, generated.size);
    assertions += 1;
    validateBoard(generated.targetRows, generated.size);
    assertions += 1;
    equal(generated.differenceRows, generatedDifference, context + " stored difference rows");
    const initialDensity = boardDensity(generated.initialRows, generated.size);
    truthy(
      initialDensity >= profile.initialDensityMin &&
        initialDensity <= profile.initialDensityMax,
      context + " initial density contract",
    );
    if (profile.initialMode === "zero") {
      equal(
        generated.initialRows,
        Array(generated.size).fill(0),
        context + " preserves the zero initial board",
      );
    } else {
      same(profileId, "hard-4", context + " only Hard 4x4 uses initial noise");
      truthy(
        generated.initialRows.some((row) => row !== 0),
        context + " has nonzero initial noise",
      );
    }
    same(difficulty.rank, profile.rank, context + " exact rank");
    same(difficulty.par, profile.rank, context + " exact Par");
    same(difficulty.parMatchesRank, true, context + " rank equals Par");
    same(difficulty.nonzeroRows, profile.nonzeroRows, context + " nonzero rows");
    same(difficulty.nonzeroCols, profile.nonzeroCols, context + " nonzero columns");
    same(difficulty.sweepBound, profile.sweepBound, context + " sweep bound");
    same(
      difficulty.compressionGap,
      profile.compressionGap,
      context + " compression gap",
    );
    same(
      difficulty.hardCandidatePassed,
      profile.hardGateExpected,
      context + " structural gate",
    );
    truthy(
      difficulty.density >= M00_DENSITY_RANGE.min &&
        difficulty.density <= M00_DENSITY_RANGE.max,
      context + " difference density stays inside the M00 range",
    );
    truthy(
      boardDensity(generated.targetRows, generated.size) >= M00_DENSITY_RANGE.min &&
        boardDensity(generated.targetRows, generated.size) <= M00_DENSITY_RANGE.max,
      context + " visual target density stays inside the M00 range",
    );
    truthy(
      generated.targetRows.some((row) => row !== 0),
      context + " target is not all-OFF",
    );
    truthy(
      generated.targetRows.some((row) => row !== (1 << generated.size) - 1),
      context + " target is not all-ON",
    );
    if (profile.antiSweepRequired) {
      same(difficulty.hardCandidatePassed, true, context + " anti-sweep requirement");
    }
    truthy(
      hasNonzeroMinorLeibniz(generatedDifference, generated.size, generated.par),
      context + " independent rank lower bound",
    );
    if (generated.par < generated.size) {
      same(
        hasNonzeroMinorLeibniz(
          generatedDifference,
          generated.size,
          generated.par + 1,
        ),
        false,
        context + " independent rank upper bound",
      );
    }
    equal(
      factorizeGF2(generatedDifference, generated.size),
      generated.canonicalPulses,
      context + " canonical factorization",
    );
    same(
      generated.canonicalPulses.length,
      generated.par,
      context + " canonical pulse count",
    );
    same(
      generated.expectedStates.length,
      generated.canonicalPulses.length,
      context + " expected state count",
    );
    equal(
      composePulses(
        generated.initialRows,
        generated.size,
        generated.canonicalPulses,
      ),
      generated.targetRows,
      context + " canonical round-trip",
    );
    let generatedRows = [...generated.initialRows];
    generated.canonicalPulses.forEach((pulse, index) => {
      generatedRows = applyPulseRowLoopOracle(
        generatedRows,
        generated.size,
        pulse.rowMask,
        pulse.colMask,
      );
      equal(
        generatedRows,
        generated.expectedStates[index],
        context + " expected state " + (index + 1),
      );
    });

    equal(
      {
        stageId: stageFixture.stageId,
        stageNumber: stageFixture.stageNumber,
        label: stageFixture.label,
        difficulty: stageFixture.difficulty,
        title: stageFixture.title,
        size: stageFixture.size,
        profileId: stageFixture.profileId,
        structuralClass: stageFixture.structuralClass,
      },
      {
        stageId: baseStage.stageId,
        stageNumber: baseStage.stageNumber,
        label: baseStage.label,
        difficulty: baseStage.difficulty,
        title: baseStage.title,
        size: baseStage.size,
        profileId: baseStage.profileId,
        structuralClass: baseStage.structuralClass,
      },
      context + " generated stage preserves catalog metadata",
    );
    same(stageFixture.baseFixtureId, baseStage.id, context + " base fixture id");
    same(stageFixture.id, baseStage.id + "@" + generated.seedKey, context + " seeded id");
    same(stageFixture.puzzleKey, generated.puzzleKey, context + " puzzle key");
    equal(stageFixture.initialRows, generated.initialRows, context + " stage initial board");
    equal(
      stageFixture.differenceRows,
      generated.differenceRows,
      context + " stage difference rows",
    );
    equal(stageFixture.targetRows, generated.targetRows, context + " stage target");
    equal(
      stageFixture.canonicalPulses,
      generated.canonicalPulses,
      context + " stage canonical pulses",
    );

    targetSignatures.add(generated.targetRows.join(","));
    puzzleKeys.add(generated.puzzleKey);
  }

  truthy(
    targetSignatures.size >= generatorSeeds.length / 2,
    profileId + " changes target across representative seeds",
  );
  same(
    puzzleKeys.size,
    generatorSeeds.length,
    profileId + " gives each normalized seed a distinct puzzle key",
  );
}

same(Object.keys(M00_STAGE_PROFILES).length, 6, "generator exposes six playable profiles");
same(Object.keys(M00_CONTROL_PROFILES).length, 1, "generator keeps one hidden control profile");
const allGeneratorProfiles = {
  ...M00_STAGE_PROFILES,
  ...M00_CONTROL_PROFILES,
};
for (const [profileId, profile] of Object.entries(allGeneratorProfiles)) {
  const fallback = getM00FallbackBoards(profileId);
  const fallbackDifference = differenceRows(
    fallback.initialRows,
    fallback.targetRows,
    profile.size,
  );
  const fallbackDifficulty = analyzeDifficulty({
    ...fallback,
    size: profile.size,
    par: profile.rank,
  });
  const context = profileId + " fallback";

  truthy(Object.isFrozen(fallback), context + " is immutable");
  truthy(Object.isFrozen(fallback.initialRows), context + " initial rows immutable");
  truthy(Object.isFrozen(fallback.differenceRows), context + " difference rows immutable");
  truthy(Object.isFrozen(fallback.targetRows), context + " target rows immutable");
  equal(fallback.differenceRows, fallbackDifference, context + " XOR difference");
  truthy(
    boardDensity(fallback.initialRows, profile.size) >= profile.initialDensityMin &&
      boardDensity(fallback.initialRows, profile.size) <= profile.initialDensityMax,
    context + " initial density",
  );
  truthy(
    fallbackDifficulty.density >= M00_DENSITY_RANGE.min &&
      fallbackDifficulty.density <= M00_DENSITY_RANGE.max,
    context + " difference density",
  );
  truthy(
    boardDensity(fallback.targetRows, profile.size) >= M00_DENSITY_RANGE.min &&
      boardDensity(fallback.targetRows, profile.size) <= M00_DENSITY_RANGE.max,
    context + " visual target density",
  );
  same(fallbackDifficulty.rank, profile.rank, context + " exact rank");
  truthy(
    hasNonzeroMinorLeibniz(fallbackDifference, profile.size, profile.rank),
    context + " independent rank lower bound",
  );
  if (profile.rank < profile.size) {
    same(
      hasNonzeroMinorLeibniz(
        fallbackDifference,
        profile.size,
        profile.rank + 1,
      ),
      false,
      context + " independent rank upper bound",
    );
  }
  same(fallbackDifficulty.sweepBound, profile.sweepBound, context + " sweep bound");
  same(
    fallbackDifficulty.compressionGap,
    profile.compressionGap,
    context + " compression gap",
  );
  same(
    fallbackDifficulty.hardCandidatePassed,
    profile.hardGateExpected,
    context + " structural gate",
  );
  const fallbackPulses = factorizeGF2(fallbackDifference, profile.size);
  same(fallbackPulses.length, profile.rank, context + " canonical pulse count");
  let fallbackRows = [...fallback.initialRows];
  for (const pulse of fallbackPulses) {
    fallbackRows = applyPulseRowLoopOracle(
      fallbackRows,
      profile.size,
      pulse.rowMask,
      pulse.colMask,
    );
  }
  equal(fallbackRows, fallback.targetRows, context + " independent canonical round-trip");
}
const fullRankProfile = M00_CONTROL_PROFILES["full-rank-control"];
for (const seed of generatorSeeds) {
  const generated = generateM00Candidate(fullRankProfile.profileId, seed);
  const stageFixture = generateStageFixture("full-rank", seed);
  const legacyStageFixture = generateStageFixture("hard", seed);
  const difficulty = analyzeDifficulty(generated);
  const context = "full-rank-control seed=" + seed;

  equal(generated.initialRows, [0, 0, 0, 0], context + " zero initial board");
  equal(
    generated.differenceRows,
    differenceRows(generated.initialRows, generated.targetRows, generated.size),
    context + " stored difference rows",
  );
  same(generated.size, 4, context + " size");
  same(generated.par, 4, context + " Par");
  same(difficulty.rank, 4, context + " exact rank");
  same(difficulty.sweepBound, 4, context + " sweep bound");
  same(difficulty.compressionGap, 0, context + " zero compression gap");
  same(difficulty.hardCandidatePassed, false, context + " fails anti-sweep gate");
  truthy(
    difficulty.density >= M00_DENSITY_RANGE.min &&
      difficulty.density <= M00_DENSITY_RANGE.max,
    context + " density",
  );
  same(
    generated.expectedStates.length,
    generated.canonicalPulses.length,
    context + " expected state count",
  );
  equal(stageFixture.targetRows, generated.targetRows, context + " generated route target");
  equal(legacyStageFixture, stageFixture, context + " legacy hard route determinism");
  equal(
    analyzeCompletedRun(generated.canonicalPulses),
    { kind: "column", shouldShowSweepGuidance: true },
    context + " remains the sweep-guidance control",
  );
}

for (const fixture of FIXTURES) {
  const diff = differenceRows(fixture.initialRows, fixture.targetRows, fixture.size);
  const rank = rankGF2(diff, fixture.size);
  const pulses = factorizeGF2(diff, fixture.size);
  const difficulty = analyzeDifficulty(fixture);
  if (fixture.profileId) {
    const profile = getM00StageProfile(fixture.profileId);
    equal(
      {
        size: fixture.size,
        rank: difficulty.rank,
        par: fixture.par,
        nonzeroRows: difficulty.nonzeroRows,
        nonzeroCols: difficulty.nonzeroCols,
        sweepBound: difficulty.sweepBound,
        compressionGap: difficulty.compressionGap,
        hardCandidatePassed: difficulty.hardCandidatePassed,
        structuralClass: fixture.structuralClass,
      },
      {
        size: profile.size,
        rank: profile.rank,
        par: profile.rank,
        nonzeroRows: profile.nonzeroRows,
        nonzeroCols: profile.nonzeroCols,
        sweepBound: profile.sweepBound,
        compressionGap: profile.compressionGap,
        hardCandidatePassed: profile.hardGateExpected,
        structuralClass: profile.structuralClass,
      },
      fixture.id + " matches its seeded generation profile",
    );
    const initialDensity = boardDensity(fixture.initialRows, fixture.size);
    truthy(
      initialDensity >= profile.initialDensityMin &&
        initialDensity <= profile.initialDensityMax,
      fixture.id + " initial density profile",
    );
    if (profile.initialMode === "zero") {
      equal(
        fixture.initialRows,
        Array(fixture.size).fill(0),
        fixture.id + " zero initial board",
      );
    } else {
      same(fixture.stageId, "hard-4", fixture.id + " is the only noisy catalog stage");
      truthy(
        fixture.initialRows.some((row) => row !== 0),
        fixture.id + " noisy initial board",
      );
    }
    truthy(
      boardDensity(fixture.targetRows, fixture.size) >= M00_DENSITY_RANGE.min &&
        boardDensity(fixture.targetRows, fixture.size) <= M00_DENSITY_RANGE.max,
      fixture.id + " visual target density",
    );
  }
  const minorLabel =
    fixture.stageId === "hard-5"
      ? "5x5 comparison candidate"
      : fixture.stageId === "hard-6"
        ? "6x6 comparison candidate"
        : fixture.id;
  truthy(
    hasNonzeroMinorLeibniz(diff, fixture.size, fixture.par),
    minorLabel +
      " has an independent nonzero order-" +
      fixture.par +
      " minor proving rank >= declared Par",
  );
  if (fixture.par < fixture.size) {
    same(
      hasNonzeroMinorLeibniz(diff, fixture.size, fixture.par + 1),
      false,
      minorLabel +
        " has no nonzero order-" +
        (fixture.par + 1) +
        " minor, independently proving rank <= declared Par",
    );
  }
  truthy(Object.isFrozen(difficulty), fixture.id + " difficulty analysis is immutable");
  same(difficulty.nonzeroRows, difficulty.rowSweepBound, fixture.id + " row sweep bound");
  same(difficulty.nonzeroCols, difficulty.colSweepBound, fixture.id + " column sweep bound");
  same(
    difficulty.sweepBound,
    Math.min(difficulty.nonzeroRows, difficulty.nonzeroCols),
    fixture.id + " best sweep bound",
  );
  same(difficulty.rank, rank, fixture.id + " analyzed rank");
  same(difficulty.par, fixture.par, fixture.id + " declared par");
  same(difficulty.parMatchesRank, true, fixture.id + " declared par matches rank");
  same(
    difficulty.compressionGap,
    difficulty.sweepBound - difficulty.rank,
    fixture.id + " compression gap",
  );
  truthy(
    difficulty.density > 0 && difficulty.density <= 1,
    fixture.id + " density range",
  );
  equal(rank, fixture.par, `${fixture.id} rank`);
  equal(pulses, fixture.canonicalPulses, `${fixture.id} canonical pulses`);
  equal(factorizeGF2(diff, fixture.size), pulses, `${fixture.id} factorization deterministic`);
  equal(pulses.length, rank, `${fixture.id} pulse count equals rank`);
  equal(composePulses(fixture.initialRows, fixture.size, pulses), fixture.targetRows, `${fixture.id} round-trip`);

  equal(
    fixture.canonicalPulses.length,
    fixture.par,
    fixture.id + " canonical Par-pulse upper bound length",
  );
  same(
    fixture.expectedStates.length,
    fixture.canonicalPulses.length,
    fixture.id + " expected state count matches canonical pulses",
  );
  equal(
    composePulses(fixture.initialRows, fixture.size, fixture.canonicalPulses),
    fixture.targetRows,
    fixture.id + " canonical Par-pulse upper bound round-trip",
  );

  let rows = [...fixture.initialRows];
  fixture.canonicalPulses.forEach((pulse, index) => {
    rows = applyPulse(rows, fixture.size, pulse.rowMask, pulse.colMask);
    equal(rows, fixture.expectedStates[index], `${fixture.id} state ${index + 1}`);
  });

  const first = fixture.canonicalPulses[0];
  equal(
    applyPulse(applyPulse(fixture.initialRows, fixture.size, first.rowMask, first.colMask), fixture.size, first.rowMask, first.colMask),
    fixture.initialRows,
    `${fixture.id} involution`,
  );

  if (fixture.canonicalPulses.length > 1) {
    const second = fixture.canonicalPulses[1];
    const forward = composePulses(fixture.initialRows, fixture.size, [first, second]);
    const reverse = composePulses(fixture.initialRows, fixture.size, [second, first]);
    equal(forward, reverse, `${fixture.id} pulse commutativity`);
  }
}

const normal5Difficulty = analyzeDifficulty(getStage("normal-5"));
equal(
  {
    nonzeroRows: normal5Difficulty.nonzeroRows,
    nonzeroCols: normal5Difficulty.nonzeroCols,
    sweepBound: normal5Difficulty.sweepBound,
    rank: normal5Difficulty.rank,
    par: normal5Difficulty.par,
    compressionGap: normal5Difficulty.compressionGap,
    hardCandidatePassed: normal5Difficulty.hardCandidatePassed,
  },
  {
    nonzeroRows: 4,
    nonzeroCols: 5,
    sweepBound: 4,
    rank: 3,
    par: 3,
    compressionGap: 1,
    hardCandidatePassed: false,
  },
  "Normal 5x5 stays outside the anti-sweep Hard gate",
);

const hard4Difficulty = analyzeDifficulty(getStage("hard-4"));
const hard4Catalog = getStage("hard-4");
equal(
  {
    initialRows: hard4Catalog.initialRows,
    differenceRows: differenceRows(
      hard4Catalog.initialRows,
      hard4Catalog.targetRows,
      hard4Catalog.size,
    ),
    targetRows: hard4Catalog.targetRows,
    canonicalPulses: hard4Catalog.canonicalPulses,
    expectedStates: hard4Catalog.expectedStates,
    generationAttempt: hard4Catalog.generationAttempt,
    seedKey: hard4Catalog.seedKey,
  },
  {
    initialRows: [0, 8, 9, 10],
    differenceRows: [11, 5, 5, 11],
    targetRows: [11, 13, 12, 1],
    canonicalPulses: [
      { rowMask: 15, colMask: 5 },
      { rowMask: 9, colMask: 14 },
    ],
    expectedStates: [
      [5, 13, 12, 15],
      [11, 13, 12, 1],
    ],
    generationAttempt: 2,
    seedKey: "236467e3",
  },
  "catalog Hard 4x4 noisy fixture golden",
);
equal(getStage("easy").initialRows, [0, 0, 0, 0], "Easy keeps a zero initial board");
truthy(
  hard4Catalog.initialRows.some((row) => row !== 0),
  "Hard 4x4 is visually distinguished by initial noise",
);
same(boardDensity(hard4Catalog.initialRows, 4), 5 / 16, "Hard 4x4 initial density");
same(boardDensity(hard4Catalog.targetRows, 4), 9 / 16, "Hard 4x4 target density");
equal(
  {
    nonzeroRows: hard4Difficulty.nonzeroRows,
    nonzeroCols: hard4Difficulty.nonzeroCols,
    sweepBound: hard4Difficulty.sweepBound,
    rank: hard4Difficulty.rank,
    par: hard4Difficulty.par,
    compressionGap: hard4Difficulty.compressionGap,
    hardCandidatePassed: hard4Difficulty.hardCandidatePassed,
  },
  {
    nonzeroRows: 4,
    nonzeroCols: 4,
    sweepBound: 4,
    rank: 2,
    par: 2,
    compressionGap: 2,
    hardCandidatePassed: true,
  },
  "Playable Hard 4x4 passes the rank-2 anti-sweep structural gate",
);

const fullRankDifficulty = analyzeDifficulty(getStage("full-rank"));
equal(
  {
    nonzeroRows: fullRankDifficulty.nonzeroRows,
    nonzeroCols: fullRankDifficulty.nonzeroCols,
    sweepBound: fullRankDifficulty.sweepBound,
    rank: fullRankDifficulty.rank,
    par: fullRankDifficulty.par,
    compressionGap: fullRankDifficulty.compressionGap,
    density: fullRankDifficulty.density,
    hardCandidatePassed: fullRankDifficulty.hardCandidatePassed,
  },
  {
    nonzeroRows: 4,
    nonzeroCols: 4,
    sweepBound: 4,
    rank: 4,
    par: 4,
    compressionGap: 0,
    density: 9 / 16,
    hardCandidatePassed: false,
  },
  "Full Rank control exposes the zero-gap sweep shortcut",
);

const hard5Difficulty = analyzeDifficulty(getStage("hard-5"));
const hard6Difficulty = analyzeDifficulty(getStage("hard-6"));
equal(
  {
    nonzeroRows: hard5Difficulty.nonzeroRows,
    nonzeroCols: hard5Difficulty.nonzeroCols,
    sweepBound: hard5Difficulty.sweepBound,
    rank: hard5Difficulty.rank,
    compressionGap: hard5Difficulty.compressionGap,
    density: hard5Difficulty.density,
    hardCandidatePassed: hard5Difficulty.hardCandidatePassed,
  },
  {
    nonzeroRows: 5,
    nonzeroCols: 5,
    sweepBound: 5,
    rank: 3,
    compressionGap: 2,
    density: 16 / 25,
    hardCandidatePassed: true,
  },
  "5x5 comparison candidate passes the structural gate",
);
equal(
  {
    nonzeroRows: hard6Difficulty.nonzeroRows,
    nonzeroCols: hard6Difficulty.nonzeroCols,
    sweepBound: hard6Difficulty.sweepBound,
    rank: hard6Difficulty.rank,
    compressionGap: hard6Difficulty.compressionGap,
    density: hard6Difficulty.density,
    hardCandidatePassed: hard6Difficulty.hardCandidatePassed,
  },
  {
    nonzeroRows: 6,
    nonzeroCols: 6,
    sweepBound: 6,
    rank: 3,
    compressionGap: 3,
    density: 20 / 36,
    hardCandidatePassed: true,
  },
  "6x6 comparison candidate passes the structural gate",
);

const missingRowDifficulty = analyzeDifficulty({
  initialRows: [0, 0, 0, 0],
  targetRows: [15, 15, 15, 0],
  size: 4,
  par: 1,
});
const missingColDifficulty = analyzeDifficulty({
  initialRows: [0, 0, 0, 0],
  targetRows: [7, 7, 7, 7],
  size: 4,
  par: 1,
});
same(missingRowDifficulty.compressionGap, 2, "missing-row gate probe has enough gap");
same(missingRowDifficulty.hardCandidatePassed, false, "hard gate requires every row");
same(missingColDifficulty.compressionGap, 2, "missing-column gate probe has enough gap");
same(missingColDifficulty.hardCandidatePassed, false, "hard gate requires every column");
const mismatchedParDifficulty = analyzeDifficulty({
  ...getStage("hard-5"),
  par: 2,
});
same(mismatchedParDifficulty.rank, 3, "mismatched-par probe preserves computed rank");
same(mismatchedParDifficulty.parMatchesRank, false, "difficulty reports a Par mismatch");
same(
  mismatchedParDifficulty.hardCandidatePassed,
  false,
  "hard gate rejects a structurally valid fixture with the wrong Par",
);
throws(() => analyzeDifficulty(null), "difficulty analyzer rejects a missing fixture");
throws(
  () => analyzeDifficulty({ ...main, par: 5 }),
  "difficulty analyzer rejects par above board size",
);

equal(rankGF2([0, 0, 0, 0], 4), 0, "zero matrix rank");
equal(factorizeGF2([0, 0, 0, 0], 4), [], "zero matrix factorization");
equal(rankGF2(applyPulse([0, 0, 0, 0], 4, 5, 9), 4), 1, "outer product rank");

const oracle = buildIndependentOracle(4);
same(oracle.size, 4, "exhaustive oracle records its 4x4 scope");
throws(() => buildIndependentOracle(5), "exhaustive oracle rejects 5x5 allocation");
equal(
  encodeRows(differenceRows(main.initialRows, main.targetRows, 4), 4),
  0x6d6b,
  "main difference packed state",
);
equal(
  encodeRows(differenceRows(backup.initialRows, backup.targetRows, 4), 4),
  0xa56f,
  "backup difference packed state",
);
equal(
  encodeRows(
    differenceRows(
      getStage("normal-4").initialRows,
      getStage("normal-4").targetRows,
      4,
    ),
    4,
  ),
  0x3695,
  "Normal difference packed state",
);
equal(
  encodeRows(getStage("hard-4").initialRows, 4),
  0xa980,
  "Hard 4x4 noisy initial packed state",
);
equal(
  encodeRows(
    differenceRows(
      getStage("hard-4").initialRows,
      getStage("hard-4").targetRows,
      4,
    ),
    4,
  ),
  0xb55b,
  "Hard 4x4 difference packed state",
);
equal(
  encodeRows(getStage("hard-4").targetRows, 4),
  0x1cdb,
  "Hard 4x4 visual target packed state",
);
equal(
  encodeRows(
    differenceRows(
      getStage("full-rank").initialRows,
      getStage("full-rank").targetRows,
      4,
    ),
    4,
  ),
  0xda96,
  "Full Rank difference packed state",
);
equal(oracleDistanceFor(main, oracle), 2, "main BFS minimum");
equal(oracleDistanceFor(backup, oracle), 3, "backup BFS minimum");
equal(oracleDistanceFor(getStage("normal-4"), oracle), 3, "Normal BFS minimum");
equal(oracleDistanceFor(getStage("hard-4"), oracle), 2, "Hard 4x4 BFS minimum");
equal(oracleDistanceFor(getStage("full-rank"), oracle), 4, "Full Rank BFS minimum");
same(
  oracleDistanceFor(getStage("normal-5"), oracle),
  null,
  "Normal 5x5 fixture cannot index the 4x4 oracle",
);
same(
  oracleDistanceFor(getStage("hard-5"), oracle),
  null,
  "5x5 fixture cannot index the 4x4 oracle",
);
same(
  oracleDistanceFor(getStage("hard-6"), oracle),
  null,
  "6x6 fixture cannot index the 4x4 oracle",
);

for (let state = 0; state < 65536; state += 1) {
  const rows = decodeRows(state, 4);
  const rank = rankGF2(rows, 4);
  const pulses = factorizeGF2(rows, 4);
  equal(oracle.distances[state], rank, `BFS/rank parity state=${state}`);
  equal(pulses.length, rank, `factor length state=${state}`);
  equal(composePulses([0, 0, 0, 0], 4, pulses), rows, `factor round-trip state=${state}`);
}

let session = createSession(main);
same(undoSession(session), session, "empty history undo is a no-op");
const partial = toggleRow(session, 0);
same(beginPulse(partial), partial, "partial selection cannot pulse");

session = selectMask(session, 5, 13, 4);
const pulsing = beginPulse(session);
equal(pulsing.phase, "pulsing", "valid pulse locks session");
same(beginPulse(pulsing), pulsing, "rapid duplicate begin is ignored");
same(toggleRow(pulsing, 1), pulsing, "axis input is ignored while pulsing");
session = commitPulse(pulsing);
equal(session.currentRows, main.expectedStates[0], "session first state");
equal(session.moves.length, 1, "session first move recorded once");
equal(session.phase, "ready", "session remains unsolved after P0");
same(commitPulse(session), session, "duplicate commit is ignored");

session = selectMask(session, 11, 6, 4);
session = commitPulse(beginPulse(session));
equal(session.currentRows, main.targetRows, "session reaches target");
equal(session.moves.length, 2, "session records two moves");
equal(session.phase, "solved", "session locks when solved");
equal(session.completionCount, 1, "completion emitted once");
same(beginPulse(session), session, "solved session rejects pulse");

session = undoSession(session);
equal(session.currentRows, main.expectedStates[0], "undo restores prior board");
equal(session.moves.length, 1, "undo removes one move");
equal(session.phase, "ready", "undo reopens solved board");

session = selectMask(session, 11, 6, 4);
session = commitPulse(beginPulse(session));
equal(session.completionCount, 1, "re-solve does not duplicate completion");
session = resetSession(session);
equal(session.currentRows, main.initialRows, "reset restores initial board");
equal(session.moves, [], "reset clears history");
equal([session.rowMask, session.colMask], [0, 0], "reset clears selections");
equal(session.phase, "ready", "reset reopens board");

const alreadySolved = createSession({ ...main, initialRows: main.targetRows });
equal(alreadySolved.phase, "solved", "initial target is solved");

for (const fixture of FIXTURES) {
  const difficulty = analyzeDifficulty(fixture);
  const bfsDistance = oracleDistanceFor(fixture, oracle);
  const bfsLabel = bfsDistance === null ? "not-run" : String(bfsDistance);
  console.log(
    "fixture=" +
      fixture.id +
      " size=" +
      fixture.size +
      " rank=" +
      difficulty.rank +
      " bfs=" +
      bfsLabel,
  );
  console.log(
    "difficulty=" +
      fixture.id +
      " rank=" +
      difficulty.rank +
      " sweep=" +
      difficulty.sweepBound +
      " gap=" +
      difficulty.compressionGap +
      " density=" +
      difficulty.density.toFixed(4) +
      " hardGate=" +
      (difficulty.hardCandidatePassed ? "pass" : "fail"),
  );
}
console.log(
  `generatorRegression=version:${M00_GENERATOR_VERSION} playableProfiles:${Object.keys(M00_STAGE_PROFILES).length} controlProfiles:${Object.keys(M00_CONTROL_PROFILES).length} goldenVectors:${Object.keys(generatorGoldenVectors).length} seedsPerProfile:${generatorSeeds.length} maxAttempts:${M00_GENERATOR_MAX_ATTEMPTS} density:${M00_DENSITY_RANGE.min}-${M00_DENSITY_RANGE.max} hard4Initial:0.25-0.5`,
);
console.log(
  `stageSequence=${STAGES.map(({ stageId, par }) => `${stageId}:${par}`).join(">")}`,
);
console.log(
  `assertions=${assertions} bfsVisited=${oracle.visited} legalPulseCount=${oracle.pulseCount} failures=0`,
);
