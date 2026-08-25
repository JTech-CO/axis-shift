import { describe, expect, it } from 'vitest';

import { createLocalStorageAdapter, createMemoryStorageAdapter } from './local-storage-adapter.ts';

describe('storage adapters', () => {
  it('delegates the three Storage operations without swallowing adapter errors', () => {
    const values = new Map<string, string>();
    const adapter = createLocalStorageAdapter({
      getItem: (key) => values.get(key) ?? null,
      removeItem: (key) => {
        values.delete(key);
      },
      setItem: (key, value) => {
        values.set(key, value);
      },
    });
    adapter.setItem('key', 'value');
    expect(adapter.getItem('key')).toBe('value');
    adapter.removeItem('key');
    expect(adapter.getItem('key')).toBeNull();
  });

  it('provides an injectable memory adapter with detached snapshots', () => {
    const adapter = createMemoryStorageAdapter({ first: '1' });
    adapter.setItem('second', '2');
    const snapshot = adapter.snapshot();
    expect(snapshot).toEqual({ first: '1', second: '2' });
    adapter.removeItem('first');
    expect(snapshot).toEqual({ first: '1', second: '2' });
    expect(adapter.snapshot()).toEqual({ second: '2' });
  });
});
