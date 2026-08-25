import type { GameSession } from '../../domain/index.ts';

import type { StoragePort } from './local-storage-adapter.ts';
import { migrateSequentially } from './migrations.ts';
import {
  composePersistedAppState,
  DEFAULT_GENERATOR_MAP_SNAPSHOT,
  DEFAULT_PROGRESS,
  DEFAULT_USER_SETTINGS,
  normalizeGeneratorMapSnapshot,
  normalizeProgress,
  normalizeSessionEnvelope,
  normalizeSettings,
  splitPersistedAppState,
  STORAGE_KEYS,
  type GeneratorMapSnapshotV1,
  type PersistedAppState,
  type ProgressEnvelopeV1,
  type PuzzleResolver,
  type SchemaNormalization,
  type SessionEnvelopeV1,
  type StorageKeyKind,
  type UserSettings,
} from './schema.ts';

export type StorageWarningCode =
  | 'empty'
  | 'future-version'
  | 'invalid-fields'
  | 'invalid-json'
  | 'quarantine-write-failed'
  | 'read-failed'
  | 'remove-failed'
  | 'unsupported-version'
  | 'write-failed';

export interface StorageWarningEvent {
  readonly code: StorageWarningCode;
  readonly key: (typeof STORAGE_KEYS)[StorageKeyKind];
  readonly keyKind: StorageKeyKind;
}

export interface StorageRepositoryOptions {
  readonly createQuarantineId?: () => string;
  readonly defaultGeneratorMap?: GeneratorMapSnapshotV1;
  readonly defaultProgress?: ProgressEnvelopeV1;
  readonly defaultSettings?: UserSettings;
  readonly onWarning?: (warning: StorageWarningEvent) => void;
  readonly resolvePuzzle: PuzzleResolver;
  readonly storage: StoragePort;
}

export interface StorageRepository {
  getWarnings(): readonly StorageWarningEvent[];
  loadAppState(): PersistedAppState;
  loadGeneratorMap(): GeneratorMapSnapshotV1;
  loadProgress(): ProgressEnvelopeV1;
  loadSession(): SessionEnvelopeV1;
  loadSettings(): UserSettings;
  saveAppState(state: PersistedAppState): boolean;
  saveGeneratorMap(snapshot: GeneratorMapSnapshotV1): boolean;
  saveProgress(progress: ProgressEnvelopeV1): boolean;
  saveSession(session: GameSession | null): boolean;
  saveSettings(settings: UserSettings): boolean;
}

type QuarantineReason =
  'empty' | 'future-version' | 'invalid-fields' | 'invalid-json' | 'unsupported-version';

const KEY_KIND_TOKEN: Readonly<Record<StorageKeyKind, string>> = Object.freeze({
  settings: 'settings',
  progress: 'progress',
  session: 'session',
  generatorMap: 'generator-map',
});

function cloneProgress(progress: ProgressEnvelopeV1): ProgressEnvelopeV1 {
  return {
    schemaVersion: 1,
    tutorialCompleted: progress.tutorialCompleted,
    labRecords: { ...progress.labRecords },
    dailyRecords: { ...progress.dailyRecords },
    sprintBest: progress.sprintBest === null ? null : { ...progress.sprintBest },
  };
}

function cloneGeneratorMap(snapshot: GeneratorMapSnapshotV1): GeneratorMapSnapshotV1 {
  return {
    schemaVersion: 1,
    defaultVersion: snapshot.defaultVersion,
    schedule: snapshot.schedule.map((entry) => ({ ...entry })),
  };
}

export function createStorageRepository(options: StorageRepositoryOptions): StorageRepository {
  const warnings: StorageWarningEvent[] = [];
  const warningLedger = new Set<string>();
  let fallbackId = 0;

  const normalizedSettingsFallback = normalizeSettings(
    options.defaultSettings ?? DEFAULT_USER_SETTINGS,
    DEFAULT_USER_SETTINGS,
  ).value;
  const normalizedProgressFallback = normalizeProgress(
    options.defaultProgress ?? DEFAULT_PROGRESS,
  ).value;
  const normalizedGeneratorFallback = normalizeGeneratorMapSnapshot(
    options.defaultGeneratorMap ?? DEFAULT_GENERATOR_MAP_SNAPSHOT,
    DEFAULT_GENERATOR_MAP_SNAPSHOT,
  ).value;

  const warn = (keyKind: StorageKeyKind, code: StorageWarningCode): void => {
    const ledgerKey = `${keyKind}:${code}`;
    if (warningLedger.has(ledgerKey)) return;
    warningLedger.add(ledgerKey);
    const event = Object.freeze({ code, key: STORAGE_KEYS[keyKind], keyKind });
    warnings.push(event);
    try {
      options.onWarning?.(event);
    } catch {
      // A presentation callback must not turn a recoverable storage fault into an app failure.
    }
  };

  const nextQuarantineId = (): string | undefined => {
    try {
      const raw = options.createQuarantineId?.() ?? `q${String(++fallbackId)}`;
      const sanitized = raw.replaceAll(/[^A-Za-z0-9_-]/gu, '_').slice(0, 96);
      return sanitized.length > 0 ? sanitized : `q${String(++fallbackId)}`;
    } catch {
      return undefined;
    }
  };

  const quarantine = (keyKind: StorageKeyKind, reason: QuarantineReason, raw: string): boolean => {
    warn(keyKind, reason);
    let quarantineKey: string | undefined;
    for (let attempt = 0; attempt < 128; attempt += 1) {
      const id = nextQuarantineId();
      if (!id) break;
      const candidate = `axis-shift:quarantine:v1:${KEY_KIND_TOKEN[keyKind]}:${reason}:${id}`;
      try {
        if (options.storage.getItem(candidate) === null) {
          quarantineKey = candidate;
          break;
        }
      } catch {
        break;
      }
    }
    if (!quarantineKey) {
      warn(keyKind, 'quarantine-write-failed');
      return false;
    }
    try {
      options.storage.setItem(quarantineKey, raw);
    } catch {
      warn(keyKind, 'quarantine-write-failed');
      return false;
    }
    try {
      options.storage.removeItem(STORAGE_KEYS[keyKind]);
      return true;
    } catch {
      warn(keyKind, 'remove-failed');
      return false;
    }
  };

  const write = <T>(
    keyKind: StorageKeyKind,
    value: T,
    normalize: (candidate: unknown) => SchemaNormalization<T>,
  ): boolean => {
    const normalized = normalize(value);
    if (!normalized.valid) {
      warn(keyKind, 'invalid-fields');
      return false;
    }
    try {
      options.storage.setItem(STORAGE_KEYS[keyKind], JSON.stringify(normalized.value));
      return true;
    } catch {
      warn(keyKind, 'write-failed');
      return false;
    }
  };

  const load = <T>(
    keyKind: StorageKeyKind,
    fallback: () => T,
    normalize: (candidate: unknown) => SchemaNormalization<T>,
    persistRepair = false,
  ): T => {
    let raw: string | null;
    try {
      raw = options.storage.getItem(STORAGE_KEYS[keyKind]);
    } catch {
      warn(keyKind, 'read-failed');
      return fallback();
    }
    if (raw === null) return fallback();
    if (raw.length === 0) {
      quarantine(keyKind, 'empty', raw);
      return fallback();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      quarantine(keyKind, 'invalid-json', raw);
      return fallback();
    }

    const migration = migrateSequentially(parsed);
    if (migration.kind === 'future-version') {
      quarantine(keyKind, 'future-version', raw);
      return fallback();
    }
    if (migration.kind === 'unsupported-version') {
      quarantine(keyKind, 'unsupported-version', raw);
      return fallback();
    }
    if (migration.kind === 'invalid-version') {
      quarantine(keyKind, 'invalid-fields', raw);
      return fallback();
    }

    const normalized = normalize(migration.value);
    if (!normalized.valid) {
      const quarantined = quarantine(keyKind, 'invalid-fields', raw);
      if (quarantined && persistRepair) write(keyKind, normalized.value, normalize);
      return normalized.value;
    }
    if (migration.kind === 'migrated') write(keyKind, normalized.value, normalize);
    return normalized.value;
  };

  const loadSettings = (): UserSettings =>
    load(
      'settings',
      () => ({ ...normalizedSettingsFallback }),
      (candidate) => normalizeSettings(candidate, normalizedSettingsFallback),
    );

  const loadProgress = (): ProgressEnvelopeV1 =>
    load('progress', () => cloneProgress(normalizedProgressFallback), normalizeProgress, true);

  const loadSession = (): SessionEnvelopeV1 =>
    load(
      'session',
      () => ({ schemaVersion: 1, resumableSession: null }),
      (candidate) => normalizeSessionEnvelope(candidate, options.resolvePuzzle),
    );

  const loadGeneratorMap = (): GeneratorMapSnapshotV1 =>
    load(
      'generatorMap',
      () => cloneGeneratorMap(normalizedGeneratorFallback),
      (candidate) => normalizeGeneratorMapSnapshot(candidate, normalizedGeneratorFallback),
    );

  const saveSettings = (settings: UserSettings): boolean =>
    write('settings', settings, (candidate) =>
      normalizeSettings(candidate, normalizedSettingsFallback),
    );

  const saveProgress = (progress: ProgressEnvelopeV1): boolean =>
    write('progress', progress, normalizeProgress);

  const saveSession = (session: GameSession | null): boolean =>
    write('session', { schemaVersion: 1, resumableSession: session }, (candidate) =>
      normalizeSessionEnvelope(candidate, options.resolvePuzzle),
    );

  const saveGeneratorMap = (snapshot: GeneratorMapSnapshotV1): boolean =>
    write('generatorMap', snapshot, (candidate) =>
      normalizeGeneratorMapSnapshot(candidate, normalizedGeneratorFallback),
    );

  return Object.freeze({
    getWarnings: (): readonly StorageWarningEvent[] => [...warnings],
    loadAppState: (): PersistedAppState => composePersistedAppState(loadProgress(), loadSession()),
    loadGeneratorMap,
    loadProgress,
    loadSession,
    loadSettings,
    saveAppState: (state: PersistedAppState): boolean => {
      const split = splitPersistedAppState(state);
      const progressWritten = saveProgress(split.progress);
      const sessionWritten = saveSession(split.session.resumableSession);
      return progressWritten && sessionWritten;
    },
    saveGeneratorMap,
    saveProgress,
    saveSession,
    saveSettings,
  });
}
