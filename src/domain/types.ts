export type BoardRows = readonly number[];

export interface EncodedPulse {
  readonly rowMask: number;
  readonly colMask: number;
}

export const GAME_MODES = ['tutorial', 'lab', 'daily', 'sprint', 'archive'] as const;
export type GameMode = (typeof GAME_MODES)[number];

export const DIFFICULTIES = ['intro', 'easy', 'normal', 'hard', 'master'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const PUZZLE_TAGS = [
  'sparse',
  'dense',
  'symmetric',
  'asymmetric',
  'overlap',
  'noise',
  'tutorial',
] as const;
export type PuzzleTag = (typeof PUZZLE_TAGS)[number];

export interface PuzzleDefinition {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly mode: GameMode;
  readonly generatorVersion: string;
  readonly seed?: string;
  readonly size: number;
  readonly initialRows: BoardRows;
  readonly targetRows: BoardRows;
  readonly optimalPulseCount: number;
  readonly canonicalSolution?: readonly EncodedPulse[];
  readonly difficulty: Difficulty;
  readonly complexityScore: number;
  readonly tags: readonly PuzzleTag[];
  readonly titleKey?: string;
  readonly tutorialStepIds?: readonly string[];
}
