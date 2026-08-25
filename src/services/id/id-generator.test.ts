import { describe, expect, it } from 'vitest';

import { createUniqueIdGenerator, IdGenerationError, type IdScope } from './id-generator.ts';

describe('unique ID generator', () => {
  it('retries malformed and repeated source values across all scopes', () => {
    const values = [' bad ', 'session-a', 'session-a', 'pulse-b'];
    const observedScopes: IdScope[] = [];
    const generator = createUniqueIdGenerator((scope) => {
      observedScopes.push(scope);
      return values.shift() ?? 'fallback';
    });

    expect(generator.nextId('session')).toBe('session-a');
    expect(generator.nextId('pulse')).toBe('pulse-b');
    expect(generator.hasIssued('session-a')).toBe(true);
    expect(generator.hasIssued('missing')).toBe(false);
    expect(observedScopes).toEqual(['session', 'session', 'pulse', 'pulse']);
  });

  it('seeds and extends the issued ledger for hydrated storage IDs', () => {
    const values = ['seed-a', 'session-b'];
    const generator = createUniqueIdGenerator(() => values.shift() ?? 'session-c', ['seed-a']);

    expect(generator.nextId('session')).toBe('session-b');
    expect(generator.reserveId('pulse-c')).toBe(true);
    expect(generator.reserveId('pulse-c')).toBe(false);
    expect(() => generator.reserveId('')).toThrowError(
      expect.objectContaining<Partial<IdGenerationError>>({ code: 'identifier-invalid' }),
    );
  });

  it('fails closed for invalid configuration, scope, seed, and source exhaustion', () => {
    expect(() => createUniqueIdGenerator(() => 'id', [], 0)).toThrowError(
      expect.objectContaining<Partial<IdGenerationError>>({ code: 'attempt-limit-invalid' }),
    );
    expect(() => createUniqueIdGenerator(() => 'id', [1 as unknown as string])).toThrowError(
      expect.objectContaining<Partial<IdGenerationError>>({ code: 'identifier-invalid' }),
    );

    const exhausted = createUniqueIdGenerator(() => 'taken', ['taken'], 2);
    expect(() => exhausted.nextId('quarantine')).toThrowError(
      expect.objectContaining<Partial<IdGenerationError>>({ code: 'exhausted' }),
    );
    expect(() => exhausted.nextId('unknown' as IdScope)).toThrowError(
      expect.objectContaining<Partial<IdGenerationError>>({ code: 'scope-invalid' }),
    );
  });
});
