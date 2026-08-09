import { applyPulse, boardsEqual, validateBoard } from "./core.mjs";

function validateFixture(fixture) {
  if (fixture === null || typeof fixture !== "object") {
    throw new TypeError("fixture must be an object");
  }
  validateBoard(fixture.initialRows, fixture.size);
  validateBoard(fixture.targetRows, fixture.size);
  return fixture;
}

function validateAxisIndex(index, size, label) {
  if (!Number.isInteger(index) || index < 0 || index >= size) {
    throw new RangeError(`${label} index must be between 0 and ${size - 1}`);
  }
}

export function createSession(fixture) {
  validateFixture(fixture);
  const solved = boardsEqual(fixture.initialRows, fixture.targetRows, fixture.size);
  return {
    fixture,
    size: fixture.size,
    initialRows: [...fixture.initialRows],
    targetRows: [...fixture.targetRows],
    currentRows: [...fixture.initialRows],
    rowMask: 0,
    colMask: 0,
    moves: [],
    pendingMove: null,
    phase: solved ? "solved" : "ready",
    completionCount: solved ? 1 : 0,
  };
}

export function toggleRow(session, index) {
  validateAxisIndex(index, session.size, "row");
  if (session.phase !== "ready") return session;
  return { ...session, rowMask: session.rowMask ^ (1 << index) };
}

export function toggleCol(session, index) {
  validateAxisIndex(index, session.size, "column");
  if (session.phase !== "ready") return session;
  return { ...session, colMask: session.colMask ^ (1 << index) };
}

export function beginPulse(session) {
  if (
    session.phase !== "ready" ||
    session.rowMask === 0 ||
    session.colMask === 0
  ) {
    return session;
  }

  return {
    ...session,
    phase: "pulsing",
    pendingMove: { rowMask: session.rowMask, colMask: session.colMask },
  };
}

export function commitPulse(session) {
  if (session.phase !== "pulsing" || session.pendingMove === null) return session;

  const { rowMask, colMask } = session.pendingMove;
  const currentRows = applyPulse(session.currentRows, session.size, rowMask, colMask);
  const solved = boardsEqual(currentRows, session.targetRows, session.size);

  return {
    ...session,
    currentRows,
    rowMask: 0,
    colMask: 0,
    moves: [...session.moves, { rowMask, colMask }],
    pendingMove: null,
    phase: solved ? "solved" : "ready",
    completionCount: solved ? Math.max(1, session.completionCount) : session.completionCount,
  };
}

export function undoSession(session) {
  if (session.phase === "pulsing" || session.moves.length === 0) return session;

  const move = session.moves[session.moves.length - 1];
  const currentRows = applyPulse(
    session.currentRows,
    session.size,
    move.rowMask,
    move.colMask,
  );
  const solved = boardsEqual(currentRows, session.targetRows, session.size);

  return {
    ...session,
    currentRows,
    rowMask: 0,
    colMask: 0,
    moves: session.moves.slice(0, -1),
    pendingMove: null,
    phase: solved ? "solved" : "ready",
  };
}

export function resetSession(session) {
  if (session.phase === "pulsing") return session;
  const solved = boardsEqual(session.initialRows, session.targetRows, session.size);
  return {
    ...session,
    currentRows: [...session.initialRows],
    rowMask: 0,
    colMask: 0,
    moves: [],
    pendingMove: null,
    phase: solved ? "solved" : "ready",
  };
}
