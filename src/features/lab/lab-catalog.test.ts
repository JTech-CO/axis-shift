import { describe, expect, it } from 'vitest';

import { LAB_LEVELS } from '../../content';
import { createEmptyPuzzleBestRecord } from '../../domain';
import {
  getLabLevel,
  getNextLabLevel,
  LAB_CHAPTERS,
  LAB_CHAPTER_IDS,
  summarizeLabProgress,
} from './lab-catalog';

describe('Lab catalog', () => {
  it('exposes four open chapters with twelve ordered levels each', () => {
    expect(LAB_CHAPTERS.map((chapter) => chapter.id)).toEqual(LAB_CHAPTER_IDS);
    expect(LAB_CHAPTERS.every((chapter) => chapter.levels.length === 12)).toBe(true);
    expect(LAB_CHAPTERS.flatMap((chapter) => chapter.levels)).toEqual(LAB_LEVELS);
  });

  it('allowlists only real Lab level IDs and advances in catalog order', () => {
    const first = LAB_LEVELS[0];
    const second = LAB_LEVELS[1];
    const last = LAB_LEVELS.at(-1);
    if (!first || !second || !last) throw new Error('Lab catalog must contain ordered levels.');

    expect(getLabLevel('lab-01-pulse-01')).toBe(LAB_LEVELS[0]);
    expect(getLabLevel('tutorial-01-row')).toBeUndefined();
    expect(getLabLevel('../../daily')).toBeUndefined();
    expect(getNextLabLevel(first.id)).toBe(second);
    expect(getNextLabLevel(last.id)).toBeUndefined();
  });

  it('counts only completed records that belong to the catalog', () => {
    const first = LAB_LEVELS[0];
    if (!first) throw new Error('Lab catalog requires at least one level.');

    const completed = {
      [first.id]: {
        ...createEmptyPuzzleBestRecord(first.id),
        completed: true,
      },
      outside: { ...createEmptyPuzzleBestRecord('outside'), completed: true },
    };

    expect(summarizeLabProgress(completed)).toEqual({ completedCount: 1, totalCount: 48 });
  });
});
