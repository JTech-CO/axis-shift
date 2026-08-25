export const MIN_SUPPORTED_EPOCH_MS = 0;
export const MAX_SUPPORTED_EPOCH_MS = 253_402_300_799_999;

export interface Clock {
  nowEpochMs(): number;
}

export type ClockErrorCode = 'clock-read-failed' | 'clock-value-invalid';

export class ClockError extends Error {
  readonly code: ClockErrorCode;

  constructor(code: ClockErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ClockError';
    this.code = code;
  }
}

export function assertClockEpochMs(value: unknown): asserts value is number {
  if (
    !Number.isSafeInteger(value) ||
    (value as number) < MIN_SUPPORTED_EPOCH_MS ||
    (value as number) > MAX_SUPPORTED_EPOCH_MS
  ) {
    throw new ClockError(
      'clock-value-invalid',
      'Clock value must be a safe integer in ' +
        MIN_SUPPORTED_EPOCH_MS +
        '..' +
        MAX_SUPPORTED_EPOCH_MS +
        '.',
    );
  }
}

export function readClockNow(clock: Clock): number {
  let value: unknown;
  try {
    value = clock.nowEpochMs();
  } catch (cause) {
    if (cause instanceof ClockError) throw cause;
    throw new ClockError('clock-read-failed', 'Clock failed to provide the current time.', {
      cause,
    });
  }
  assertClockEpochMs(value);
  return value;
}

export function epochMsToCanonicalUtcIso(epochMs: number): string {
  assertClockEpochMs(epochMs);
  return new Date(epochMs).toISOString();
}

export class SystemClock implements Clock {
  nowEpochMs(): number {
    const value = Date.now();
    assertClockEpochMs(value);
    return value;
  }
}

export const systemClock: Clock = Object.freeze(new SystemClock());
