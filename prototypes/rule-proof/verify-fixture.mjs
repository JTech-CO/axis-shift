import assert from "node:assert/strict";

import {
  applyPulse,
  boardsEqual,
  composePulses,
  differenceRows,
  factorizeGF2,
  rankGF2,
  validateBoard,
} from "./core.mjs";
import { FIXTURES, STAGES, getFixture, getNextStage } from "./fixtures.mjs";
import {
  beginPulse,
  commitPulse,
  createSession,
  resetSession,
  toggleCol,
  toggleRow,
  undoSession,
} from "./session.mjs";

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

function buildIndependentOracle(size) {
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
  return { distances, pulseCount: pulseStates.length, visited: tail };
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

same(STAGES.length, 3, "prototype exposes three stages");
equal(
  STAGES.map(({ stageId, difficulty, par }) => ({ stageId, difficulty, par })),
  [
    { stageId: "easy", difficulty: "easy", par: 2 },
    { stageId: "normal", difficulty: "normal", par: 3 },
    { stageId: "hard", difficulty: "hard", par: 4 },
  ],
  "stage order and difficulty contract",
);
equal(new Set(STAGES.map(({ id }) => id)).size, 3, "stage fixture ids are unique");
equal(new Set(STAGES.map(({ targetRows }) => targetRows.join(","))).size, 3, "stage targets are unique");
same(STAGES[0], main, "current M00 fixture remains the Easy stage");
truthy(!STAGES.includes(backup), "backup stays outside the playable stage path");
same(getNextStage("easy"), STAGES[1], "Easy advances to Normal");
same(getNextStage("normal"), STAGES[2], "Normal advances to Hard");
same(getNextStage("hard"), STAGES[0], "Hard wraps to Easy");

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

for (const fixture of FIXTURES) {
  const diff = differenceRows(fixture.initialRows, fixture.targetRows, fixture.size);
  const rank = rankGF2(diff, fixture.size);
  const pulses = factorizeGF2(diff, fixture.size);
  equal(rank, fixture.par, `${fixture.id} rank`);
  equal(pulses, fixture.canonicalPulses, `${fixture.id} canonical pulses`);
  equal(factorizeGF2(diff, fixture.size), pulses, `${fixture.id} factorization deterministic`);
  equal(pulses.length, rank, `${fixture.id} pulse count equals rank`);
  equal(composePulses(fixture.initialRows, fixture.size, pulses), fixture.targetRows, `${fixture.id} round-trip`);

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

equal(rankGF2([0, 0, 0, 0], 4), 0, "zero matrix rank");
equal(factorizeGF2([0, 0, 0, 0], 4), [], "zero matrix factorization");
equal(rankGF2(applyPulse([0, 0, 0, 0], 4, 5, 9), 4), 1, "outer product rank");

const oracle = buildIndependentOracle(4);
equal(encodeRows(main.targetRows, 4), 0x6d6b, "main packed state");
equal(encodeRows(backup.targetRows, 4), 0xa56f, "backup packed state");
equal(encodeRows(STAGES[1].targetRows, 4), 0x3695, "Normal packed state");
equal(encodeRows(STAGES[2].targetRows, 4), 0xda96, "Hard packed state");
equal(oracle.distances[0x6d6b], 2, "main BFS minimum");
equal(oracle.distances[0xa56f], 3, "backup BFS minimum");
equal(oracle.distances[0x3695], 3, "Normal BFS minimum");
equal(oracle.distances[0xda96], 4, "Hard BFS minimum");

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
  const packed = encodeRows(fixture.targetRows, 4);
  console.log(`${fixture.id} rank=${fixture.par} bfs=${oracle.distances[packed]}`);
}
console.log(
  `stageSequence=${STAGES.map(({ stageId, par }) => `${stageId}:${par}`).join(">")}`,
);
console.log(
  `assertions=${assertions} bfsVisited=${oracle.visited} legalPulseCount=${oracle.pulseCount} failures=0`,
);
