import { describe, expect, it } from 'vitest';

import { STATIC_LEVELS, TUTORIAL_LEVELS } from '../content';
import { en, ko, type MessageKey } from './index';

const TUTORIAL_COPY_BY_STEP_ID = Object.freeze({
  'tutorial.execute-pulse': 'tutorial.step.executePulse',
  'tutorial.observe-echo': 'tutorial.step.observeEcho',
  'tutorial.preview-intersection': 'tutorial.step.previewIntersection',
  'tutorial.select-column': 'tutorial.step.selectColumn',
  'tutorial.select-multiple-axes': 'tutorial.step.selectMultipleAxes',
  'tutorial.select-row': 'tutorial.step.selectRow',
});
const M06_REQUIRED_KEYS = [
  'app.nav.tutorial',
  'app.nav.lab',
  'app.status.tutorial',
  'app.status.lab',
  'app.status.labLevel',
  'home.eyebrow',
  'home.primaryTutorial',
  'home.primaryLab',
  'home.resumeLabel',
  'home.resumeDescription',
  'home.resumeAction',
  'home.modesLabel',
  'home.dailyTitle',
  'home.dailyDescription',
  'home.dailyAction',
  'home.dailyMetric',
  'home.dailyEyebrow',
  'home.labTitle',
  'home.labDescription',
  'home.labAction',
  'home.labEyebrow',
  'home.sprintTitle',
  'home.sprintDescription',
  'home.sprintComingSoon',
  'home.sprintEyebrow',
  'home.tutorialReplay',
  'home.labProgress',
  'tutorial.title',
  'tutorial.progressLabel',
  'tutorial.coachmarkLabel',
  'tutorial.action.skip',
  'tutorial.action.back',
  'tutorial.action.next',
  'tutorial.action.finish',
  'tutorial.action.startLab',
  'tutorial.complete.title',
  'tutorial.complete.description',
  'tutorial.error.title',
  'tutorial.error.description',
  'tutorial.error.restart',
  'lab.eyebrow',
  'lab.title',
  'lab.description',
  'lab.progressLabel',
  'lab.chapterLabel',
  'lab.levelCompleted',
  'lab.levelOpen',
  'lab.chapter.pulse.title',
  'lab.chapter.pulse.description',
  'lab.chapter.echo.title',
  'lab.chapter.echo.description',
  'lab.chapter.rank.title',
  'lab.chapter.rank.description',
  'lab.chapter.noise.title',
  'lab.chapter.noise.description',
  'lab.action.play',
  'lab.action.replay',
  'lab.action.nextLevel',
  'lab.action.backToLevels',
  'lab.action.backToChapters',
  'lab.error.unknownLevel.title',
  'lab.error.unknownLevel.description',
  'lab.error.unknownLevel.back',
  'game.eyebrow.tutorial',
  'game.eyebrow.lab',
  'game.axis.row',
  'game.axis.column',
  'game.target',
  'game.current',
  'game.action.pulse',
  'game.action.undo',
  'game.pulse.blocked',
  'game.pulse.ready',
  'game.pulse.running',
  'game.pulse.solved',
  'game.affectedCells',
  'game.status.idle.message',
  'game.status.selected.message',
  'game.status.preview.message',
  'game.status.pulsing.message',
  'game.status.paused.message',
  'game.status.solved.message',
  'game.status.error.message',
  'game.status.disabled.message',
  'game.error.title',
  'game.error.description',
  'game.error.recover',
  'hint.action',
  'hint.heading',
  'hint.description',
  'hint.level.depth',
  'hint.level.axis',
  'hint.level.pulse',
  'hint.used.none',
  'hint.used.depth',
  'hint.used.axis',
  'hint.used.pulse',
  'hint.unavailable',
  'reset.action',
  'reset.heading',
  'reset.description',
  'reset.confirm',
  'reset.cancel',
  'reset.completeRecordPreserved',
  'resume.title',
  'resume.description',
  'resume.action',
  'resume.discard',
  'resume.failed.title',
  'resume.failed.description',
  'resume.failed.restart',
  'persistence.warning.description',
  'persistence.warning.retry',
  'result.eyebrow',
  'result.title',
  'result.grade',
  'result.pulse',
  'result.par',
  'result.time',
  'result.undo',
  'result.hint',
  'result.best.new',
  'result.best.kept',
  'result.action.review',
  'result.action.replay',
  'result.action.nextLevel',
  'result.action.backToLab',
] as const satisfies readonly MessageKey[];

const localeResources = Object.freeze({ en, ko });

function expectLocalized(key: string): void {
  for (const [locale, resource] of Object.entries(localeResources)) {
    const value = (resource as Readonly<Record<string, string>>)[key];
    expect(value, `${locale}:${key}`).toBeDefined();
    expect(value?.trim(), `${locale}:${key}`).not.toBe('');
  }
}

describe('locale resources', () => {
  it('keeps Korean and English keys in exact parity', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(ko).sort());
  });

  it('has a non-empty Korean and English draft for every Tutorial step', () => {
    const koMessages = ko as Readonly<Record<string, string>>;
    const enMessages = en as Readonly<Record<string, string>>;
    const stepIds = TUTORIAL_LEVELS.flatMap((level) => level.tutorialStepIds ?? []);

    expect(stepIds).toHaveLength(6);
    expect(new Set(stepIds).size).toBe(6);

    for (const stepId of stepIds) {
      const key = TUTORIAL_COPY_BY_STEP_ID[stepId as keyof typeof TUTORIAL_COPY_BY_STEP_ID];
      expect(key, stepId).toBeDefined();
      expect(koMessages[key], `ko:${key}`).toBeTruthy();
      expect(enMessages[key], `en:${key}`).toBeTruthy();
    }
  });
  it('keeps every localized value non-empty', () => {
    for (const [locale, resource] of Object.entries(localeResources)) {
      for (const [key, value] of Object.entries(resource)) {
        expect(value.trim(), `${locale}:${key}`).not.toBe('');
      }
    }
  });

  it('resolves the exact 54 manifest title keys in both locales', () => {
    const titleKeys = STATIC_LEVELS.map((level) => level.titleKey);
    expect(titleKeys.every((key) => typeof key === 'string')).toBe(true);

    const manifestTitleKeys = titleKeys.filter((key): key is string => typeof key === 'string');
    const resourceTitleKeys = Object.keys(ko).filter((key) =>
      /^level\.(?:tutorial|lab)\..+\.title$/u.test(key),
    );

    expect(manifestTitleKeys).toHaveLength(54);
    expect(new Set(manifestTitleKeys).size).toBe(54);
    expect(resourceTitleKeys.sort()).toEqual([...manifestTitleKeys].sort());

    for (const key of manifestTitleKeys) expectLocalized(key);
  });

  it('provides non-empty copy for every core M06 product-flow key', () => {
    expect(new Set(M06_REQUIRED_KEYS).size).toBe(M06_REQUIRED_KEYS.length);
    for (const key of M06_REQUIRED_KEYS) expectLocalized(key);
  });
});
