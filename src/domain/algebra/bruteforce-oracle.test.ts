import { describe, expect, it } from 'vitest';

import { applyPulse, applyPulses, createEmptyBoard, factorizeGF2, rankGF2 } from '../index.ts';

const ORACLE_SIZE = 3;
const ORACLE_STATE_COUNT = 1 << (ORACLE_SIZE * ORACLE_SIZE);
const RANDOM_CASES_PER_SIZE = 10_000;

function oraclePulseState(rowMask: number, colMask: number): number {
  let state = 0;
  for (let rowIndex = 0; rowIndex < ORACLE_SIZE; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < ORACLE_SIZE; columnIndex += 1) {
      if ((rowMask & (1 << rowIndex)) !== 0 && (colMask & (1 << columnIndex)) !== 0) {
        state |= 1 << (rowIndex * ORACLE_SIZE + columnIndex);
      }
    }
  }
  return state;
}

function decodeOracleState(state: number): number[] {
  return Array.from({ length: ORACLE_SIZE }, (_, rowIndex) => {
    let row = 0;
    for (let columnIndex = 0; columnIndex < ORACLE_SIZE; columnIndex += 1) {
      const cellBit = 1 << (rowIndex * ORACLE_SIZE + columnIndex);
      if ((state & cellBit) !== 0) row |= 1 << columnIndex;
    }
    return row;
  });
}

function buildIndependentOracleDistances(): Int16Array {
  const pulseStates: number[] = [];
  for (let rowMask = 1; rowMask < 1 << ORACLE_SIZE; rowMask += 1) {
    for (let colMask = 1; colMask < 1 << ORACLE_SIZE; colMask += 1) {
      pulseStates.push(oraclePulseState(rowMask, colMask));
    }
  }

  const distances = new Int16Array(ORACLE_STATE_COUNT);
  distances.fill(-1);
  distances[0] = 0;
  const queue = new Uint16Array(ORACLE_STATE_COUNT);
  queue[0] = 0;
  let head = 0;
  let tail = 1;

  while (head < tail) {
    const state = queue[head] as number;
    head += 1;
    for (const pulseState of pulseStates) {
      const nextState = state ^ pulseState;
      if (distances[nextState] !== -1) continue;
      distances[nextState] = (distances[state] as number) + 1;
      queue[tail] = nextState;
      tail += 1;
    }
  }

  return distances;
}

function createXorshift32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

function randomBoard(size: number, next: () => number): number[] {
  const mask = (1 << size) - 1;
  return Array.from({ length: size }, () => next() & mask);
}

function equalRows(left: readonly number[], right: readonly number[]): boolean {
  return left.length === right.length && left.every((row, index) => row === right[index]);
}

describe('independent GF(2) minimum-move oracle and deterministic property corpus', () => {
  it('matches rank and canonical round-trip for every 3x3 matrix and 50,000 larger cases', () => {
    const distances = buildIndependentOracleDistances();
    let matrixCount = 0;
    let oracleUnvisited = 0;
    let rankMismatch = 0;
    let factorizationMismatch = 0;
    let pulseInvariantFailures = 0;
    let determinismFailures = 0;
    let randomMatrices = 0;
    const firstFailures: string[] = [];

    for (let state = 0; state < ORACLE_STATE_COUNT; state += 1) {
      const rows = decodeOracleState(state);
      const rank = rankGF2(rows, ORACLE_SIZE);
      const oracleDistance = distances[state] as number;
      const pulses = factorizeGF2(rows, ORACLE_SIZE);
      const reconstructed = applyPulses(createEmptyBoard(ORACLE_SIZE), ORACLE_SIZE, pulses);
      matrixCount += 1;

      if (oracleDistance < 0) oracleUnvisited += 1;
      if (rank !== oracleDistance) {
        rankMismatch += 1;
        if (firstFailures.length === 0) {
          firstFailures.push(`oracle state=${state} rows=${rows.join(',')}`);
        }
      }
      if (pulses.length !== rank || !equalRows(reconstructed, rows)) {
        factorizationMismatch += 1;
        if (firstFailures.length === 0) {
          firstFailures.push(`factorization state=${state} rows=${rows.join(',')}`);
        }
      }
    }

    for (let size = 4; size <= 8; size += 1) {
      const next = createXorshift32(0x9e37_79b9 ^ Math.imul(size, 0x85eb_ca6b));
      const mask = (1 << size) - 1;
      for (let caseIndex = 0; caseIndex < RANDOM_CASES_PER_SIZE; caseIndex += 1) {
        const rows = randomBoard(size, next);
        const rank = rankGF2(rows, size);
        const pulses = factorizeGF2(rows, size);
        const reconstructed = applyPulses(createEmptyBoard(size), size, pulses);
        const repeatedRank = rankGF2([...rows], size);
        const repeatedPulses = factorizeGF2([...rows], size);
        const firstPulse = { rowMask: next() & mask, colMask: next() & mask };
        const secondPulse = { rowMask: next() & mask, colMask: next() & mask };
        const twice = applyPulse(
          applyPulse(rows, size, firstPulse.rowMask, firstPulse.colMask),
          size,
          firstPulse.rowMask,
          firstPulse.colMask,
        );
        const firstThenSecond = applyPulses(rows, size, [firstPulse, secondPulse]);
        const secondThenFirst = applyPulses(rows, size, [secondPulse, firstPulse]);
        randomMatrices += 1;

        if (rank < 0 || rank > size) {
          rankMismatch += 1;
          if (firstFailures.length === 0) {
            firstFailures.push(`rank size=${size} case=${caseIndex} rows=${rows.join(',')}`);
          }
        }
        if (pulses.length !== rank || !equalRows(reconstructed, rows)) {
          factorizationMismatch += 1;
          if (firstFailures.length === 0) {
            firstFailures.push(
              `factorization size=${size} case=${caseIndex} rows=${rows.join(',')}`,
            );
          }
        }
        if (!equalRows(twice, rows) || !equalRows(firstThenSecond, secondThenFirst)) {
          pulseInvariantFailures += 1;
          if (firstFailures.length === 0) {
            firstFailures.push(`pulse size=${size} case=${caseIndex} rows=${rows.join(',')}`);
          }
        }
        if (rank !== repeatedRank || JSON.stringify(pulses) !== JSON.stringify(repeatedPulses)) {
          determinismFailures += 1;
          if (firstFailures.length === 0) {
            firstFailures.push(`determinism size=${size} case=${caseIndex} rows=${rows.join(',')}`);
          }
        }
      }
    }

    const report =
      `matrixCount=${matrixCount} oracleUnvisited=${oracleUnvisited} ` +
      `rankMismatch=${rankMismatch} factorizationMismatch=${factorizationMismatch} ` +
      `pulseInvariantFailures=${pulseInvariantFailures} randomMatrices=${randomMatrices} ` +
      `determinismFailures=${determinismFailures}`;
    console.log(report);

    expect(matrixCount).toBe(512);
    expect(randomMatrices).toBe(50_000);
    expect(
      {
        determinismFailures,
        factorizationMismatch,
        oracleUnvisited,
        pulseInvariantFailures,
        rankMismatch,
      },
      firstFailures.join('; '),
    ).toEqual({
      determinismFailures: 0,
      factorizationMismatch: 0,
      oracleUnvisited: 0,
      pulseInvariantFailures: 0,
      rankMismatch: 0,
    });
  });
});
