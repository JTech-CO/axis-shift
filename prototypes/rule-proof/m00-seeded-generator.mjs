import {
  applyPulse,
  differenceRows as boardDifferenceRows,
  factorizeGF2,
  rankGF2,
  validateBoard,
} from "./core.mjs";
import { analyzeDifficulty } from "./difficulty.mjs";

export const M00_GENERATOR_VERSION = "m00-seeded-v1";
export const M00_GENERATOR_MAX_ATTEMPTS = 512;
export const M00_DENSITY_RANGE = Object.freeze({ min: 0.22, max: 0.68 });

function freezeProfile(profile) {
  return Object.freeze({
    initialMode: "zero",
    initialDensityMin: 0,
    initialDensityMax: 0,
    ...profile,
  });
}

export const M00_STAGE_PROFILES = Object.freeze({
  "easy-4": freezeProfile({
    profileId: "easy-4",
    size: 4,
    rank: 2,
    nonzeroRows: 4,
    nonzeroCols: 4,
    sweepBound: 4,
    compressionGap: 2,
    hardGateExpected: true,
    antiSweepRequired: false,
    structuralClass: "intro",
  }),
  "normal-4": freezeProfile({
    profileId: "normal-4",
    size: 4,
    rank: 3,
    nonzeroRows: 4,
    nonzeroCols: 4,
    sweepBound: 4,
    compressionGap: 1,
    hardGateExpected: false,
    antiSweepRequired: false,
    structuralClass: "standard",
  }),
  "normal-5": freezeProfile({
    profileId: "normal-5",
    size: 5,
    rank: 3,
    nonzeroRows: 4,
    nonzeroCols: 5,
    sweepBound: 4,
    compressionGap: 1,
    hardGateExpected: false,
    antiSweepRequired: false,
    structuralClass: "standard",
  }),
  "hard-4": freezeProfile({
    profileId: "hard-4",
    size: 4,
    rank: 2,
    nonzeroRows: 4,
    nonzeroCols: 4,
    sweepBound: 4,
    compressionGap: 2,
    hardGateExpected: true,
    antiSweepRequired: true,
    structuralClass: "anti-sweep",
    initialMode: "noise",
    initialDensityMin: 0.25,
    initialDensityMax: 0.5,
  }),
  "hard-5": freezeProfile({
    profileId: "hard-5",
    size: 5,
    rank: 3,
    nonzeroRows: 5,
    nonzeroCols: 5,
    sweepBound: 5,
    compressionGap: 2,
    hardGateExpected: true,
    antiSweepRequired: true,
    structuralClass: "anti-sweep",
  }),
  "hard-6": freezeProfile({
    profileId: "hard-6",
    size: 6,
    rank: 3,
    nonzeroRows: 6,
    nonzeroCols: 6,
    sweepBound: 6,
    compressionGap: 3,
    hardGateExpected: true,
    antiSweepRequired: true,
    structuralClass: "anti-sweep",
  }),
});

export const M00_CONTROL_PROFILES = Object.freeze({
  "full-rank-control": freezeProfile({
    profileId: "full-rank-control",
    size: 4,
    rank: 4,
    nonzeroRows: 4,
    nonzeroCols: 4,
    sweepBound: 4,
    compressionGap: 0,
    hardGateExpected: false,
    antiSweepRequired: false,
    structuralClass: "control",
  }),
});

const M00_PROFILES = Object.freeze({
  ...M00_STAGE_PROFILES,
  ...M00_CONTROL_PROFILES,
});

function freezeFallback(initialRows, differenceRows) {
  return Object.freeze({
    initialRows: Object.freeze([...initialRows]),
    differenceRows: Object.freeze([...differenceRows]),
  });
}

const PROFILE_FALLBACKS = Object.freeze({
  "easy-4": freezeFallback([0, 0, 0, 0], [11, 6, 13, 6]),
  "normal-4": freezeFallback([0, 0, 0, 0], [5, 9, 6, 3]),
  "normal-5": freezeFallback([0, 0, 0, 0, 0], [13, 24, 3, 0, 27]),
  "hard-4": freezeFallback([1, 2, 4, 8], [13, 2, 2, 15]),
  "hard-5": freezeFallback([0, 0, 0, 0, 0], [25, 19, 13, 30, 7]),
  "hard-6": freezeFallback([0, 0, 0, 0, 0, 0], [7, 25, 42, 7, 30, 45]),
  "full-rank-control": freezeFallback([0, 0, 0, 0], [6, 9, 10, 13]),
});

export function getM00StageProfile(profileId) {
  if (!Object.hasOwn(M00_PROFILES, profileId)) {
    throw new RangeError(`Unknown M00 stage profile: ${profileId}`);
  }
  return M00_PROFILES[profileId];
}

export function getM00FallbackBoards(profileId) {
  getM00StageProfile(profileId);
  const fallback = PROFILE_FALLBACKS[profileId];
  const initialRows = [...fallback.initialRows];
  const differenceRows = [...fallback.differenceRows];
  return Object.freeze({
    profileId,
    initialRows: Object.freeze(initialRows),
    differenceRows: Object.freeze(differenceRows),
    targetRows: Object.freeze(xorRows(initialRows, differenceRows)),
  });
}

export function normalizeSeed(seed) {
  if (typeof seed === "number") {
    if (!Number.isFinite(seed)) throw new TypeError("seed number must be finite");
  } else if (typeof seed !== "string" && typeof seed !== "bigint") {
    throw new TypeError("seed must be a string, finite number, or bigint");
  }

  const normalized = String(seed).normalize("NFKC").trim();
  return normalized.length === 0 ? "0" : normalized;
}

function hash32(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function encodeSeedToken(value) {
  let encoded = "";
  for (let index = 0; index < value.length; index += 1) {
    encoded += value.charCodeAt(index).toString(16).padStart(4, "0");
  }
  return encoded;
}

function createUint32Source(profileId, normalizedSeed) {
  let state = hash32(
    `axis-shift|${M00_GENERATOR_VERSION}|${profileId}|${normalizedSeed}`,
  );
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return (value ^ (value >>> 14)) >>> 0;
  };
}

function nextIndex(nextUint32, limit) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError("limit must be a positive integer");
  }
  return nextUint32() % limit;
}

function shuffled(values, nextUint32) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = nextIndex(nextUint32, index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function vectorRank(vectors, width) {
  const work = [...vectors];
  let pivotRow = 0;
  for (let col = 0; col < width && pivotRow < work.length; col += 1) {
    let candidate = pivotRow;
    while (candidate < work.length && ((work[candidate] >> col) & 1) === 0) {
      candidate += 1;
    }
    if (candidate === work.length) continue;

    [work[pivotRow], work[candidate]] = [work[candidate], work[pivotRow]];
    for (let row = 0; row < work.length; row += 1) {
      if (row !== pivotRow && ((work[row] >> col) & 1) === 1) {
        work[row] ^= work[pivotRow];
      }
    }
    pivotRow += 1;
  }
  return pivotRow;
}

function independentNonzeroVectors(width, nextUint32) {
  const candidates = shuffled(
    Array.from({ length: (1 << width) - 1 }, (_, index) => index + 1),
    nextUint32,
  );
  const selected = [];
  for (const candidate of candidates) {
    if (vectorRank([...selected, candidate], width) === selected.length + 1) {
      selected.push(candidate);
      if (selected.length === width) return selected;
    }
  }
  throw new Error(`Could not construct a ${width}-vector basis`);
}

function fullRankCoefficients(count, rank, nextUint32) {
  const coefficients = independentNonzeroVectors(rank, nextUint32);
  const limit = (1 << rank) - 1;
  while (coefficients.length < count) {
    coefficients.push(1 + nextIndex(nextUint32, limit));
  }
  return shuffled(coefficients, nextUint32);
}

function buildDifferenceRows(profile, nextUint32) {
  const { size, rank, nonzeroRows, nonzeroCols } = profile;
  const activeRowSlots = shuffled(
    Array.from({ length: size }, (_, index) => index),
    nextUint32,
  ).slice(0, nonzeroRows);
  const activeColSlots = shuffled(
    Array.from({ length: size }, (_, index) => index),
    nextUint32,
  ).slice(0, nonzeroCols);
  const rowCoefficients = fullRankCoefficients(nonzeroRows, rank, nextUint32);
  const colCoefficients = fullRankCoefficients(nonzeroCols, rank, nextUint32);

  const componentRows = Array(rank).fill(0);
  colCoefficients.forEach((coefficient, index) => {
    const col = activeColSlots[index];
    for (let component = 0; component < rank; component += 1) {
      if (((coefficient >> component) & 1) === 1) {
        componentRows[component] |= 1 << col;
      }
    }
  });

  const rows = Array(size).fill(0);
  rowCoefficients.forEach((coefficient, index) => {
    let row = 0;
    for (let component = 0; component < rank; component += 1) {
      if (((coefficient >> component) & 1) === 1) row ^= componentRows[component];
    }
    rows[activeRowSlots[index]] = row;
  });
  return rows;
}

function buildInitialRows(profile, nextUint32) {
  if (profile.initialMode === "zero") return Array(profile.size).fill(0);
  if (profile.initialMode !== "noise") {
    throw new RangeError(`Unknown initial mode: ${profile.initialMode}`);
  }

  const cellCount = profile.size * profile.size;
  const minimumActive = Math.ceil(cellCount * profile.initialDensityMin);
  const maximumActive = Math.floor(cellCount * profile.initialDensityMax);
  const activeCount =
    minimumActive + nextIndex(nextUint32, maximumActive - minimumActive + 1);
  const activeCells = shuffled(
    Array.from({ length: cellCount }, (_, index) => index),
    nextUint32,
  ).slice(0, activeCount);
  const rows = Array(profile.size).fill(0);
  for (const cell of activeCells) {
    const row = Math.floor(cell / profile.size);
    const col = cell % profile.size;
    rows[row] |= 1 << col;
  }
  return rows;
}

function xorRows(left, right) {
  return left.map((row, index) => row ^ right[index]);
}

function expectedStatesFor(initialRows, size, pulses) {
  const states = [];
  let rows = [...initialRows];
  for (const pulse of pulses) {
    rows = applyPulse(rows, size, pulse.rowMask, pulse.colMask);
    states.push(rows);
  }
  return states;
}

function freezePulse({ rowMask, colMask }) {
  return Object.freeze({ rowMask, colMask });
}

function freezeRows(rows) {
  return Object.freeze([...rows]);
}

function countBits(value) {
  let count = 0;
  for (let remaining = value; remaining !== 0; remaining >>>= 1) {
    count += remaining & 1;
  }
  return count;
}

function boardDensity(rows, size) {
  const activeCells = rows.reduce((total, row) => total + countBits(row), 0);
  return activeCells / (size * size);
}

function boardsMatchProfile(initialRows, differenceRows, targetRows, profile) {
  const allOnMask = (1 << profile.size) - 1;
  if (targetRows.every((row, index) => row === initialRows[index])) return false;
  if (targetRows.every((row) => row === 0)) return false;
  if (targetRows.every((row) => row === allOnMask)) return false;
  if (profile.initialMode === "zero" && initialRows.some((row) => row !== 0)) {
    return false;
  }
  const initialDensity = boardDensity(initialRows, profile.size);
  if (
    initialDensity < profile.initialDensityMin ||
    initialDensity > profile.initialDensityMax
  ) {
    return false;
  }
  const differenceDensity = boardDensity(differenceRows, profile.size);
  if (
    differenceDensity < M00_DENSITY_RANGE.min ||
    differenceDensity > M00_DENSITY_RANGE.max
  ) {
    return false;
  }
  const visualTargetDensity = boardDensity(targetRows, profile.size);
  if (
    visualTargetDensity < M00_DENSITY_RANGE.min ||
    visualTargetDensity > M00_DENSITY_RANGE.max
  ) {
    return false;
  }

  const analysis = analyzeDifficulty({
    initialRows,
    targetRows,
    size: profile.size,
    par: profile.rank,
  });
  return (
    analysis.rank === profile.rank &&
    analysis.nonzeroRows === profile.nonzeroRows &&
    analysis.nonzeroCols === profile.nonzeroCols &&
    analysis.sweepBound === profile.sweepBound &&
    analysis.compressionGap === profile.compressionGap &&
    analysis.hardCandidatePassed === profile.hardGateExpected
  );
}

function selectBoards(profile, nextUint32) {
  for (let attempt = 1; attempt <= M00_GENERATOR_MAX_ATTEMPTS; attempt += 1) {
    const initialRows = buildInitialRows(profile, nextUint32);
    const differenceRows = buildDifferenceRows(profile, nextUint32);
    const targetRows = xorRows(initialRows, differenceRows);
    if (boardsMatchProfile(initialRows, differenceRows, targetRows, profile)) {
      return {
        initialRows,
        differenceRows,
        targetRows,
        generationAttempt: attempt,
        fallbackUsed: false,
      };
    }
  }

  const fallback = PROFILE_FALLBACKS[profile.profileId];
  const initialRows = [...fallback.initialRows];
  const differenceRows = [...fallback.differenceRows];
  const targetRows = xorRows(initialRows, differenceRows);
  if (!boardsMatchProfile(initialRows, differenceRows, targetRows, profile)) {
    throw new Error(`${profile.profileId} has no valid deterministic fallback`);
  }
  return {
    initialRows,
    differenceRows,
    targetRows,
    generationAttempt: M00_GENERATOR_MAX_ATTEMPTS,
    fallbackUsed: true,
  };
}

function assertGeneratedContract(candidate, profile) {
  validateBoard(candidate.initialRows, candidate.size);
  validateBoard(candidate.differenceRows, candidate.size);
  validateBoard(candidate.targetRows, candidate.size);
  if (candidate.targetRows.every((row, index) => row === candidate.initialRows[index])) {
    throw new Error(`${profile.profileId} generated target equals its initial board`);
  }
  if (candidate.targetRows.every((row) => row === 0)) {
    throw new Error(`${profile.profileId} generated an all-OFF target`);
  }
  const allOnMask = (1 << candidate.size) - 1;
  if (candidate.targetRows.every((row) => row === allOnMask)) {
    throw new Error(`${profile.profileId} generated an all-ON target`);
  }
  const computedDifference = boardDifferenceRows(
    candidate.initialRows,
    candidate.targetRows,
    candidate.size,
  );
  if (computedDifference.some((row, index) => row !== candidate.differenceRows[index])) {
    throw new Error(`${profile.profileId} generated inconsistent difference rows`);
  }

  const initialDensity = boardDensity(candidate.initialRows, candidate.size);
  if (
    initialDensity < profile.initialDensityMin ||
    initialDensity > profile.initialDensityMax
  ) {
    throw new Error(
      `${profile.profileId} generated initial density=${initialDensity}; expected ` +
        `${profile.initialDensityMin}..${profile.initialDensityMax}`,
    );
  }
  if (profile.initialMode === "zero" && candidate.initialRows.some((row) => row !== 0)) {
    throw new Error(`${profile.profileId} generated unexpected initial noise`);
  }
  if (profile.initialMode === "noise" && candidate.initialRows.every((row) => row === 0)) {
    throw new Error(`${profile.profileId} generated no required initial noise`);
  }

  const analysis = analyzeDifficulty(candidate);
  if (
    analysis.density < M00_DENSITY_RANGE.min ||
    analysis.density > M00_DENSITY_RANGE.max
  ) {
    throw new Error(
      `${profile.profileId} generated density=${analysis.density}; expected ` +
        `${M00_DENSITY_RANGE.min}..${M00_DENSITY_RANGE.max}`,
    );
  }
  const visualTargetDensity = boardDensity(candidate.targetRows, candidate.size);
  if (
    visualTargetDensity < M00_DENSITY_RANGE.min ||
    visualTargetDensity > M00_DENSITY_RANGE.max
  ) {
    throw new Error(
      `${profile.profileId} generated target density=${visualTargetDensity}; expected ` +
        `${M00_DENSITY_RANGE.min}..${M00_DENSITY_RANGE.max}`,
    );
  }
  const expected = {
    rank: profile.rank,
    nonzeroRows: profile.nonzeroRows,
    nonzeroCols: profile.nonzeroCols,
    sweepBound: profile.sweepBound,
    compressionGap: profile.compressionGap,
    hardCandidatePassed: profile.hardGateExpected,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (analysis[key] !== value) {
      throw new Error(
        `${profile.profileId} generated ${key}=${analysis[key]}; expected ${value}`,
      );
    }
  }
  if (profile.antiSweepRequired && !analysis.hardCandidatePassed) {
    throw new Error(`${profile.profileId} failed its anti-sweep requirement`);
  }
  if (rankGF2(computedDifference, candidate.size) !== candidate.par) {
    throw new Error(`${profile.profileId} generated rank does not match Par`);
  }
}

export function generateM00Candidate(profileId, seed) {
  const profile = getM00StageProfile(profileId);
  const normalizedSeed = normalizeSeed(seed);
  const nextUint32 = createUint32Source(profileId, normalizedSeed);
  const {
    initialRows,
    differenceRows,
    targetRows,
    generationAttempt,
    fallbackUsed,
  } = selectBoards(profile, nextUint32);
  const canonicalPulses = factorizeGF2(differenceRows, profile.size);
  const expectedStates = expectedStatesFor(
    initialRows,
    profile.size,
    canonicalPulses,
  );
  const seedKey = hash32(
    `axis-shift|${M00_GENERATOR_VERSION}|${profileId}|${normalizedSeed}`,
  )
    .toString(16)
    .padStart(8, "0");

  const candidate = {
    profileId,
    structuralClass: profile.structuralClass,
    generatorVersion: M00_GENERATOR_VERSION,
    seed: normalizedSeed,
    seedKey,
    generationAttempt,
    fallbackUsed,
    puzzleKey:
      `${M00_GENERATOR_VERSION}|${profileId}|${seedKey}|` +
      encodeSeedToken(normalizedSeed),
    size: profile.size,
    initialRows,
    differenceRows,
    targetRows,
    par: profile.rank,
    canonicalPulses,
    expectedStates,
  };
  assertGeneratedContract(candidate, profile);

  return Object.freeze({
    ...candidate,
    initialRows: freezeRows(candidate.initialRows),
    differenceRows: freezeRows(candidate.differenceRows),
    targetRows: freezeRows(candidate.targetRows),
    canonicalPulses: Object.freeze(candidate.canonicalPulses.map(freezePulse)),
    expectedStates: Object.freeze(candidate.expectedStates.map(freezeRows)),
  });
}
