import {
  createBrowserGameSessionRuntime,
  type GameSessionRuntime,
  type VisibilitySource,
} from '../features/game-session';
import { createMemoryStorageAdapter, type StorageLike } from '../services/storage';

let browserRuntime: GameSessionRuntime | undefined;

function browserVisibilitySource(): VisibilitySource {
  return {
    get visibilityState(): string {
      return document.visibilityState;
    },
    addEventListener: (_type, listener): void => {
      document.addEventListener('visibilitychange', listener);
    },
    removeEventListener: (_type, listener): void => {
      document.removeEventListener('visibilitychange', listener);
    },
  };
}
function browserStorage(): StorageLike {
  try {
    const storage = window.localStorage;
    storage.getItem('axis-shift:availability-probe');
    return storage;
  } catch {
    return createMemoryStorageAdapter();
  }
}

export function getAppGameSessionRuntime(): GameSessionRuntime {
  browserRuntime ??= createBrowserGameSessionRuntime({
    cryptoSource: window.crypto,
    storage: browserStorage(),
    visibilitySource: browserVisibilitySource(),
  });
  return browserRuntime;
}

export function resetAppGameSessionRuntimeForTests(): void {
  browserRuntime = undefined;
}
