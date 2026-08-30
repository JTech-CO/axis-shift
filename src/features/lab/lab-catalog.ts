import { LAB_LEVELS } from '../../content';
import type { PuzzleBestRecord, PuzzleDefinition } from '../../domain';

export const LAB_CHAPTER_IDS = ['pulse', 'echo', 'rank', 'noise'] as const;

export type LabChapterId = (typeof LAB_CHAPTER_IDS)[number];

export interface LabChapter {
  readonly descriptionKey: `lab.chapter.${LabChapterId}.description`;
  readonly id: LabChapterId;
  readonly levels: readonly PuzzleDefinition[];
  readonly titleKey: `lab.chapter.${LabChapterId}.title`;
}

export interface LabProgressSummary {
  readonly completedCount: number;
  readonly totalCount: number;
}

function levelBelongsToChapter(level: PuzzleDefinition, chapterId: LabChapterId): boolean {
  return level.id.includes(`-${chapterId}-`);
}

export const LAB_CHAPTERS: readonly LabChapter[] = Object.freeze(
  LAB_CHAPTER_IDS.map((id) =>
    Object.freeze({
      descriptionKey: `lab.chapter.${id}.description` as const,
      id,
      levels: Object.freeze(LAB_LEVELS.filter((level) => levelBelongsToChapter(level, id))),
      titleKey: `lab.chapter.${id}.title` as const,
    }),
  ),
);

const LAB_LEVELS_BY_ID = new Map(LAB_LEVELS.map((level) => [level.id, level]));

export function getLabLevel(levelId: string): PuzzleDefinition | undefined {
  return LAB_LEVELS_BY_ID.get(levelId);
}

export function getNextLabLevel(levelId: string): PuzzleDefinition | undefined {
  const index = LAB_LEVELS.findIndex((level) => level.id === levelId);
  return index < 0 ? undefined : LAB_LEVELS[index + 1];
}

export function summarizeLabProgress(
  records: Readonly<Record<string, PuzzleBestRecord>>,
): LabProgressSummary {
  return Object.freeze({
    completedCount: LAB_LEVELS.reduce(
      (count, level) => count + (records[level.id]?.completed ? 1 : 0),
      0,
    ),
    totalCount: LAB_LEVELS.length,
  });
}
