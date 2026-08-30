import { getStaticLevel } from '../../content';
import type { GameSession } from '../../domain';
import { systemClock, type Clock } from '../../services/clock';
import { createUniqueIdGenerator, type IdGenerator, type IdSource } from '../../services/id';
import {
  createLocalStorageAdapter,
  createStorageRepository,
  type PersistedAppState,
  type StorageLike,
  type StorageRepository,
  type StorageWarningEvent,
} from '../../services/storage';

export interface VisibilityPort {
  isHidden(): boolean;
  subscribe(listener: (hidden: boolean) => void): () => void;
}

export interface VisibilitySource {
  readonly visibilityState: string;
  addEventListener(type: 'visibilitychange', listener: () => void): void;
  removeEventListener(type: 'visibilitychange', listener: () => void): void;
}

export interface CryptoIdSource {
  randomUUID?: () => string;
  getRandomValues<T extends ArrayBufferView<ArrayBuffer>>(array: T): T;
}

export interface GameSessionRuntimeDependencies {
  readonly clock: Clock;
  readonly idGenerator: IdGenerator;
  readonly repository: StorageRepository;
  readonly visibility?: VisibilityPort;
}

export interface GameSessionRuntime {
  readonly clock: Clock;
  readonly idGenerator: IdGenerator;
  readonly repository: StorageRepository;
  readonly visibility: VisibilityPort;
  loadAppState(): PersistedAppState;
}

export interface BrowserGameSessionRuntimeOptions {
  readonly clock?: Clock;
  readonly cryptoSource: CryptoIdSource;
  readonly onStorageWarning?: (warning: StorageWarningEvent) => void;
  readonly storage: StorageLike;
  readonly visibilitySource?: VisibilitySource;
}

const ALWAYS_VISIBLE: VisibilityPort = Object.freeze({
  isHidden: (): boolean => false,
  subscribe: (): (() => void) => () => undefined,
});

function reserveHydratedSessionIds(idGenerator: IdGenerator, session: GameSession | null): void {
  if (session === null) return;
  const identifiers = [session.sessionId, ...session.acceptedPulseActionIds];
  for (const identifier of identifiers) {
    if (!idGenerator.hasIssued(identifier)) idGenerator.reserveId(identifier);
  }
}

export function createVisibilityPort(source: VisibilitySource): VisibilityPort {
  return Object.freeze({
    isHidden: (): boolean => source.visibilityState === 'hidden',
    subscribe: (listener: (hidden: boolean) => void): (() => void) => {
      const handleVisibilityChange = (): void => listener(source.visibilityState === 'hidden');
      source.addEventListener('visibilitychange', handleVisibilityChange);
      return () => source.removeEventListener('visibilitychange', handleVisibilityChange);
    },
  });
}

export function createCryptoIdSource(source: CryptoIdSource): IdSource {
  return (scope): string => {
    if (typeof source.randomUUID === 'function') return `${scope}-${source.randomUUID()}`;

    const words = source.getRandomValues(new Uint32Array(4));
    const token = [...words].map((word) => word.toString(16).padStart(8, '0')).join('');
    return `${scope}-${token}`;
  };
}

export function createGameSessionRuntime(
  dependencies: GameSessionRuntimeDependencies,
): GameSessionRuntime {
  const visibility = dependencies.visibility ?? ALWAYS_VISIBLE;

  return Object.freeze({
    clock: dependencies.clock,
    idGenerator: dependencies.idGenerator,
    repository: dependencies.repository,
    visibility,
    loadAppState: (): PersistedAppState => {
      const state = dependencies.repository.loadAppState();
      reserveHydratedSessionIds(dependencies.idGenerator, state.resumableSession);
      return state;
    },
  });
}

export function createBrowserGameSessionRuntime(
  options: BrowserGameSessionRuntimeOptions,
): GameSessionRuntime {
  const idGenerator = createUniqueIdGenerator(createCryptoIdSource(options.cryptoSource));
  const repository = createStorageRepository({
    createQuarantineId: () => idGenerator.nextId('quarantine'),
    onWarning: options.onStorageWarning,
    resolvePuzzle: getStaticLevel,
    storage: createLocalStorageAdapter(options.storage),
  });

  return createGameSessionRuntime({
    clock: options.clock ?? systemClock,
    idGenerator,
    repository,
    visibility:
      options.visibilitySource === undefined
        ? ALWAYS_VISIBLE
        : createVisibilityPort(options.visibilitySource),
  });
}
