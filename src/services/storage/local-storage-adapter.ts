export interface StoragePort {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export interface StorageLike {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export function createLocalStorageAdapter(storage: StorageLike): StoragePort {
  return Object.freeze({
    getItem: (key: string): string | null => storage.getItem(key),
    removeItem: (key: string): void => storage.removeItem(key),
    setItem: (key: string, value: string): void => storage.setItem(key, value),
  });
}

export function createMemoryStorageAdapter(
  initial: Readonly<Record<string, string>> = {},
): StoragePort & { readonly snapshot: () => Readonly<Record<string, string>> } {
  const values = new Map(Object.entries(initial));
  return Object.freeze({
    getItem: (key: string): string | null => values.get(key) ?? null,
    removeItem: (key: string): void => {
      values.delete(key);
    },
    setItem: (key: string, value: string): void => {
      values.set(key, value);
    },
    snapshot: (): Readonly<Record<string, string>> => Object.fromEntries(values),
  });
}
