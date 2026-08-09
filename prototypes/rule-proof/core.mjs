function validateSize(size) {
  if (!Number.isInteger(size) || size < 3 || size > 8) {
    throw new RangeError(`size must be an integer from 3 to 8; received ${size}`);
  }
  return size;
}

function boardMask(size) {
  return (1 << size) - 1;
}

function validateMask(mask, size, label) {
  const limit = boardMask(size);
  if (!Number.isInteger(mask) || mask < 0 || mask > limit) {
    throw new RangeError(`${label} must be an integer from 0 to ${limit}; received ${mask}`);
  }
  return mask;
}

export function validateBoard(rows, size) {
  validateSize(size);
  if (!Array.isArray(rows) || rows.length !== size) {
    throw new TypeError(`board must contain exactly ${size} rows`);
  }

  const limit = boardMask(size);
  rows.forEach((row, index) => {
    if (!Number.isInteger(row) || row < 0 || row > limit) {
      throw new RangeError(`row ${index} must be an integer from 0 to ${limit}; received ${row}`);
    }
  });
  return true;
}

export function boardsEqual(left, right, size) {
  validateBoard(left, size);
  validateBoard(right, size);
  return left.every((row, index) => row === right[index]);
}

export function differenceRows(left, right, size) {
  validateBoard(left, size);
  validateBoard(right, size);
  return left.map((row, index) => row ^ right[index]);
}

export function applyPulse(rows, size, rowMask, colMask) {
  validateBoard(rows, size);
  validateMask(rowMask, size, "rowMask");
  validateMask(colMask, size, "colMask");

  const next = [...rows];
  if (rowMask === 0 || colMask === 0) return next;

  for (let row = 0; row < size; row += 1) {
    if (((rowMask >> row) & 1) === 1) next[row] ^= colMask;
  }
  return next;
}

function rankVectors(vectors, size) {
  const limit = boardMask(size);
  const work = vectors.map((vector, index) => {
    if (!Number.isInteger(vector) || vector < 0 || vector > limit) {
      throw new RangeError(`vector ${index} is outside the ${size}-bit board`);
    }
    return vector;
  });

  let pivotRow = 0;
  for (let col = 0; col < size && pivotRow < work.length; col += 1) {
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

export function rankGF2(rows, size) {
  validateBoard(rows, size);
  return rankVectors(rows, size);
}

function columnsFromRows(rows, size) {
  return Array.from({ length: size }, (_, col) => {
    let column = 0;
    for (let row = 0; row < size; row += 1) {
      column |= ((rows[row] >> col) & 1) << row;
    }
    return column;
  });
}

function solveCoefficients(basis, column) {
  const combinationCount = 1 << basis.length;
  for (let coefficients = 0; coefficients < combinationCount; coefficients += 1) {
    let composed = 0;
    for (let index = 0; index < basis.length; index += 1) {
      if (((coefficients >> index) & 1) === 1) composed ^= basis[index];
    }
    if (composed === column) return coefficients;
  }
  throw new Error("column is not represented by the selected basis");
}

export function factorizeGF2(rows, size) {
  validateBoard(rows, size);
  const columns = columnsFromRows(rows, size);
  const basis = [];

  for (const column of columns) {
    if (rankVectors([...basis, column], size) > basis.length) basis.push(column);
  }
  if (basis.length === 0) return [];

  const coefficients = columns.map((column) => solveCoefficients(basis, column));
  return basis.map((rowMask, basisIndex) => ({
    rowMask,
    colMask: coefficients.reduce(
      (mask, coefficient, col) => mask | (((coefficient >> basisIndex) & 1) << col),
      0,
    ),
  }));
}

export function composePulses(initialRows, size, pulses) {
  validateBoard(initialRows, size);
  if (!Array.isArray(pulses)) throw new TypeError("pulses must be an array");
  return pulses.reduce((rows, pulse, index) => {
    if (pulse === null || typeof pulse !== "object") {
      throw new TypeError(`pulse ${index} must be an object`);
    }
    return applyPulse(rows, size, pulse.rowMask, pulse.colMask);
  }, [...initialRows]);
}
