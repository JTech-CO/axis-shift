function validateNow(now) {
  if (!Number.isFinite(now) || now < 0) {
    throw new RangeError("stopwatch time must be a non-negative finite number");
  }
  return now;
}

function freezeStopwatch(stopwatch) {
  return Object.freeze(stopwatch);
}

export function createStopwatch() {
  return freezeStopwatch({
    elapsedMs: 0,
    runningSince: null,
    hasStarted: false,
    completedMs: null,
  });
}

export function startStopwatch(stopwatch, now) {
  validateNow(now);
  if (stopwatch.runningSince !== null) return stopwatch;
  return freezeStopwatch({
    ...stopwatch,
    runningSince: now,
    hasStarted: true,
    completedMs: null,
  });
}

export function pauseStopwatch(stopwatch, now) {
  validateNow(now);
  if (stopwatch.runningSince === null) return stopwatch;
  return freezeStopwatch({
    ...stopwatch,
    elapsedMs:
      stopwatch.elapsedMs + Math.max(0, now - stopwatch.runningSince),
    runningSince: null,
  });
}

export function completeStopwatch(stopwatch, now) {
  const paused = pauseStopwatch(stopwatch, now);
  const completedMs = readStopwatch(paused, now);
  return freezeStopwatch({
    ...paused,
    completedMs,
  });
}

export function resetStopwatch() {
  return createStopwatch();
}

export function readStopwatch(stopwatch, now) {
  validateNow(now);
  if (stopwatch.completedMs !== null) return stopwatch.completedMs;
  if (stopwatch.runningSince === null) return stopwatch.elapsedMs;
  return stopwatch.elapsedMs + Math.max(0, now - stopwatch.runningSince);
}

export function formatStopwatch(elapsedMs) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new RangeError("elapsed time must be a non-negative finite number");
  }
  const tenths = Math.floor(elapsedMs / 100);
  const minutes = Math.floor(tenths / 600);
  const seconds = Math.floor((tenths % 600) / 10);
  const fraction = tenths % 10;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${fraction}`;
}

export function formatElapsedSeconds(elapsedMs) {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new RangeError("elapsed time must be a non-negative finite number");
  }
  return `${(Math.floor(elapsedMs / 100) / 10).toFixed(1)}초`;
}
