import { describe, expect, it, vi } from 'vitest';

import {
  ClockError,
  MAX_SUPPORTED_EPOCH_MS,
  SystemClock,
  epochMsToCanonicalUtcIso,
  readClockNow,
  systemClock,
  type Clock,
} from './clock.ts';

describe('Clock port and guards', () => {
  it('reads an injected clock and converts supported epochs to canonical UTC ISO', () => {
    const fixed: Clock = { nowEpochMs: () => 1_777_075_323_004 };
    expect(readClockNow(fixed)).toBe(1_777_075_323_004);
    expect(epochMsToCanonicalUtcIso(0)).toBe('1970-01-01T00:00:00.000Z');
    expect(epochMsToCanonicalUtcIso(MAX_SUPPORTED_EPOCH_MS)).toBe('9999-12-31T23:59:59.999Z');
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1, 1.5, MAX_SUPPORTED_EPOCH_MS + 1])(
    'rejects abnormal clock value %s',
    (value) => {
      expect(() => readClockNow({ nowEpochMs: () => value })).toThrowError(
        expect.objectContaining<Partial<ClockError>>({ code: 'clock-value-invalid' }),
      );
    },
  );

  it('wraps injected clock failures with a stable error code and cause', () => {
    const cause = new Error('unavailable');
    const failing: Clock = {
      nowEpochMs() {
        throw cause;
      },
    };

    try {
      readClockNow(failing);
      expect.unreachable('readClockNow should throw');
    } catch (error) {
      expect(error).toMatchObject({ code: 'clock-read-failed', cause });
    }
  });

  it('preserves an intentional ClockError from an injected adapter', () => {
    const original = new ClockError('clock-value-invalid', 'known failure');
    const failing: Clock = {
      nowEpochMs() {
        throw original;
      },
    };
    expect(() => readClockNow(failing)).toThrow(original);
  });

  it('uses Date.now only inside the SystemClock adapter', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1_777_075_323_004);
    expect(new SystemClock().nowEpochMs()).toBe(1_777_075_323_004);
    expect(readClockNow(systemClock)).toBe(1_777_075_323_004);
    expect(nowSpy).toHaveBeenCalledTimes(2);
  });

  it('guards direct SystemClock reads when the platform returns an abnormal value', () => {
    vi.spyOn(Date, 'now').mockReturnValue(Number.NaN);
    expect(() => new SystemClock().nowEpochMs()).toThrowError(
      expect.objectContaining<Partial<ClockError>>({ code: 'clock-value-invalid' }),
    );
  });
});
