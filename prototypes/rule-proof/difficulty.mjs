import { differenceRows, rankGF2, validateBoard } from "./core.mjs";

function countBits(value) {
  let count = 0;
  for (let remaining = value; remaining !== 0; remaining >>>= 1) {
    count += remaining & 1;
  }
  return count;
}

function countNonzeroColumns(rows, size) {
  let count = 0;
  for (let col = 0; col < size; col += 1) {
    if (rows.some((row) => ((row >> col) & 1) === 1)) count += 1;
  }
  return count;
}

export function analyzeDifficulty(fixture) {
  if (fixture === null || typeof fixture !== "object") {
    throw new TypeError("fixture must be an object");
  }

  const { initialRows, targetRows, size, par } = fixture;
  validateBoard(initialRows, size);
  validateBoard(targetRows, size);
  if (!Number.isInteger(par) || par < 0 || par > size) {
    throw new RangeError(
      "par must be an integer from 0 to " + size + "; received " + par,
    );
  }

  const difference = differenceRows(initialRows, targetRows, size);
  const nonzeroRows = difference.filter((row) => row !== 0).length;
  const nonzeroCols = countNonzeroColumns(difference, size);
  const rowSweepBound = nonzeroRows;
  const colSweepBound = nonzeroCols;
  const sweepBound = Math.min(rowSweepBound, colSweepBound);
  const rank = rankGF2(difference, size);
  const parMatchesRank = par === rank;
  const compressionGap = sweepBound - rank;
  const activeCells = difference.reduce((total, row) => total + countBits(row), 0);
  const density = activeCells / (size * size);
  const hardCandidatePassed =
    parMatchesRank &&
    nonzeroRows === size &&
    nonzeroCols === size &&
    compressionGap >= 2;

  return Object.freeze({
    nonzeroRows,
    nonzeroCols,
    rowSweepBound,
    colSweepBound,
    sweepBound,
    rank,
    par,
    parMatchesRank,
    compressionGap,
    density,
    hardCandidatePassed,
  });
}
