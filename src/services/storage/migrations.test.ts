import { describe, expect, it } from 'vitest';

import { STORAGE_MIGRATIONS, migrateSequentially } from './migrations.ts';

describe('storage migration registry', () => {
  it('keeps the first published v1 schema current without inventing v0', () => {
    expect(STORAGE_MIGRATIONS.size).toBe(0);
    const value = { schemaVersion: 1, payload: 'current' };
    expect(migrateSequentially(value)).toEqual({ kind: 'current', value });
    expect(migrateSequentially({ schemaVersion: 0 })).toEqual({
      kind: 'unsupported-version',
      version: 0,
    });
  });

  it('classifies missing and future versions without mutating the payload', () => {
    expect(migrateSequentially({ payload: true })).toEqual({ kind: 'invalid-version' });
    expect(migrateSequentially({ schemaVersion: 2 })).toEqual({
      kind: 'future-version',
      version: 2,
    });
  });

  it('runs only explicit consecutive steps when a real next schema is supplied', () => {
    const registry = new Map([
      [1, (value: unknown) => ({ ...(value as object), migrated: true, schemaVersion: 2 })],
    ]);
    expect(migrateSequentially({ schemaVersion: 1 }, registry, 2)).toEqual({
      fromVersion: 1,
      kind: 'migrated',
      value: { migrated: true, schemaVersion: 2 },
    });
    expect(migrateSequentially({ schemaVersion: 1 }, new Map(), 2)).toEqual({
      kind: 'unsupported-version',
      version: 1,
    });
  });
});
