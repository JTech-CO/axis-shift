import { STORAGE_SCHEMA_VERSION, schemaVersionOf } from './schema.ts';

export type MigrationStep = (value: unknown) => unknown;
export type MigrationRegistry = ReadonlyMap<number, MigrationStep>;

export type MigrationResult =
  | { readonly kind: 'current'; readonly value: unknown }
  | { readonly fromVersion: number; readonly kind: 'migrated'; readonly value: unknown }
  | { readonly kind: 'invalid-version' }
  | { readonly kind: 'future-version'; readonly version: number }
  | { readonly kind: 'unsupported-version'; readonly version: number };

// v1 is the first published persistence schema. The empty registry is intentional:
// migrations are added only after a real prior schema exists, never from an invented v0.
export const STORAGE_MIGRATIONS: MigrationRegistry = new Map<number, MigrationStep>();

export function migrateSequentially(
  value: unknown,
  registry: MigrationRegistry = STORAGE_MIGRATIONS,
  targetVersion: number = STORAGE_SCHEMA_VERSION,
): MigrationResult {
  const fromVersion = schemaVersionOf(value);
  if (fromVersion === undefined || fromVersion < 1) {
    return fromVersion === undefined
      ? { kind: 'invalid-version' }
      : { kind: 'unsupported-version', version: fromVersion };
  }
  if (fromVersion > targetVersion) return { kind: 'future-version', version: fromVersion };
  if (fromVersion === targetVersion) return { kind: 'current', value };

  let current: unknown = value;
  for (let version = fromVersion; version < targetVersion; version += 1) {
    const migrate = registry.get(version);
    if (!migrate) return { kind: 'unsupported-version', version };
    current = migrate(current);
    if (schemaVersionOf(current) !== version + 1) {
      return { kind: 'unsupported-version', version };
    }
  }
  return { fromVersion, kind: 'migrated', value: current };
}
