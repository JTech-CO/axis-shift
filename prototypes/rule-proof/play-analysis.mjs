const NONE_RESULT = Object.freeze({
  kind: "none",
  shouldShowSweepGuidance: false,
});

function validateMove(move, index) {
  if (move === null || typeof move !== "object") {
    throw new TypeError("move " + index + " must be an object");
  }
  for (const axis of ["rowMask", "colMask"]) {
    const mask = move[axis];
    if (!Number.isSafeInteger(mask) || mask <= 0) {
      throw new RangeError(
        "move " + index + " " + axis + " must be a positive safe integer",
      );
    }
  }
}

function isSingletonMask(mask) {
  let value = mask;
  let count = 0;
  while (value > 0) {
    count += value % 2;
    if (count > 1) return false;
    value = Math.floor(value / 2);
  }
  return count === 1;
}

export function analyzeCompletedRun(moves) {
  if (!Array.isArray(moves)) {
    throw new TypeError("moves must be an array");
  }
  moves.forEach(validateMove);

  if (moves.length < 2) return NONE_RESULT;

  const columnSweep = moves.every((move) => isSingletonMask(move.colMask));
  const rowSweep = moves.every((move) => isSingletonMask(move.rowMask));
  const kind = columnSweep ? "column" : rowSweep ? "row" : "none";

  if (kind === "none") return NONE_RESULT;
  return Object.freeze({
    kind,
    shouldShowSweepGuidance: true,
  });
}
