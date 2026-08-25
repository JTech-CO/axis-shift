export const ID_SCOPES = ['pulse', 'quarantine', 'session'] as const;

export type IdScope = (typeof ID_SCOPES)[number];
export type IdSource = (scope: IdScope) => string;

export interface IdGenerator {
  hasIssued(id: string): boolean;
  nextId(scope: IdScope): string;
  reserveId(id: string): boolean;
}

export type IdGenerationErrorCode =
  'attempt-limit-invalid' | 'exhausted' | 'identifier-invalid' | 'scope-invalid';

export class IdGenerationError extends Error {
  readonly code: IdGenerationErrorCode;

  constructor(code: IdGenerationErrorCode, message: string) {
    super(message);
    this.name = 'IdGenerationError';
    this.code = code;
  }
}

function isIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.trim() === value;
}

function assertIdentifier(value: unknown): asserts value is string {
  if (!isIdentifier(value)) {
    throw new IdGenerationError(
      'identifier-invalid',
      'IDs must be non-empty strings without surrounding whitespace.',
    );
  }
}

function assertScope(scope: unknown): asserts scope is IdScope {
  if (!ID_SCOPES.includes(scope as IdScope)) {
    throw new IdGenerationError('scope-invalid', 'Unknown ID scope.');
  }
}

export function createUniqueIdGenerator(
  source: IdSource,
  previouslyIssued: Iterable<string> = [],
  attemptLimit = 128,
): IdGenerator {
  if (!Number.isSafeInteger(attemptLimit) || attemptLimit <= 0) {
    throw new IdGenerationError(
      'attempt-limit-invalid',
      'attemptLimit must be a positive safe integer.',
    );
  }

  const issued = new Set<string>();
  for (const id of previouslyIssued) {
    assertIdentifier(id);
    issued.add(id);
  }

  const reserveId = (id: string): boolean => {
    assertIdentifier(id);
    if (issued.has(id)) return false;
    issued.add(id);
    return true;
  };

  return Object.freeze({
    hasIssued: (id: string): boolean => issued.has(id),
    nextId: (scope: IdScope): string => {
      assertScope(scope);
      for (let attempt = 0; attempt < attemptLimit; attempt += 1) {
        const candidate = source(scope);
        if (isIdentifier(candidate) && reserveId(candidate)) return candidate;
      }
      throw new IdGenerationError('exhausted', 'ID source did not produce a unique valid ID.');
    },
    reserveId,
  });
}
