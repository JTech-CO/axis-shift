import { describe, expect, it } from 'vitest';

import { SUPPORTED_DAILY_GENERATOR_VERSIONS, puzzleOutputHash } from '../domain/index.ts';

import levelManifestValue from './level-manifest.v1.json';

import {
  DAILY_GENERATOR_RESOURCES,
  DAILY_GENERATOR_RESOURCE_REGISTRY,
  LAB_LEVELS,
  STATIC_LEVELS,
  TUTORIAL_LEVELS,
  DAILY_GENERATOR_SCHEDULE,
  DAILY_V1_GOLDEN_VECTORS,
  DEFAULT_DAILY_GENERATOR_VERSION,
  dailyGeneratorResourcesForVersion,
  generateDailyPuzzle,
  generatorVersionForDate,
} from './index.ts';

describe('static content catalog', () => {
  it('exports the exact manifest progression order to consumers', () => {
    const manifestIds = levelManifestValue.profiles.map((profile) => profile.id);
    const tutorialIds = levelManifestValue.profiles
      .filter((profile) => profile.mode === 'tutorial')
      .map((profile) => profile.id);
    const labIds = levelManifestValue.profiles
      .filter((profile) => profile.mode === 'lab')
      .map((profile) => profile.id);

    expect(STATIC_LEVELS.map((puzzle) => puzzle.id)).toEqual(manifestIds);
    expect(TUTORIAL_LEVELS.map((puzzle) => puzzle.id)).toEqual(tutorialIds);
    expect(LAB_LEVELS.map((puzzle) => puzzle.id)).toEqual(labIds);
  });
});

describe('content Daily generator registry', () => {
  it('resolves the frozen default and effectiveFrom schedule', () => {
    expect(DEFAULT_DAILY_GENERATOR_VERSION).toBe('v1');
    expect(DAILY_GENERATOR_SCHEDULE).toEqual([{ effectiveFrom: '2026-01-01', version: 'v1' }]);
    expect(Object.isFrozen(DAILY_GENERATOR_SCHEDULE)).toBe(true);
    expect(Object.isFrozen(DAILY_GENERATOR_SCHEDULE[0])).toBe(true);
    expect(generatorVersionForDate('2026-01-01')).toBe('v1');
    expect(generatorVersionForDate('9999-12-31')).toBe('v1');
    expect(() => generatorVersionForDate('2025-12-31')).toThrow(RangeError);
    expect(() => generatorVersionForDate('2026-02-30')).toThrow(RangeError);
  });

  it('keeps v1 policy, fallbacks, distributions, and 20 golden vectors in one registry entry', () => {
    const v1 = dailyGeneratorResourcesForVersion('v1');
    expect(v1.generatorResources).toBe(DAILY_GENERATOR_RESOURCES);
    expect(v1.policy.version).toBe('v1');
    expect(Object.keys(DAILY_GENERATOR_RESOURCE_REGISTRY).sort()).toEqual(
      [...SUPPORTED_DAILY_GENERATOR_VERSIONS].sort(),
    );
    expect(v1.fallbacks).toHaveLength(14);
    expect(v1.goldenVectors).toHaveLength(20);
    expect(v1.goldenVectors).toEqual(DAILY_V1_GOLDEN_VECTORS);
    expect(Object.isFrozen(DAILY_GENERATOR_RESOURCE_REGISTRY)).toBe(true);
    expect(Object.isFrozen(v1)).toBe(true);
    expect(Object.isFrozen(v1.distributionTargets)).toBe(true);
  });

  it('keeps implicit scheduled and explicit v1 output at the frozen hash', () => {
    const golden = DAILY_V1_GOLDEN_VECTORS.find((vector) => vector.dateUtc === '2026-01-01');
    expect(golden).toBeDefined();
    const implicit = generateDailyPuzzle({ dateUtc: '2026-01-01' });
    const explicit = generateDailyPuzzle({ dateUtc: '2026-01-01', generatorVersion: 'v1' });
    expect(implicit).toEqual(explicit);
    expect(puzzleOutputHash(explicit)).toBe(golden?.puzzleHash);
  });

  it('uses explicit version lookup and rejects unknown versions before domain generation', () => {
    expect(() => dailyGeneratorResourcesForVersion('v2')).toThrow(
      'Unsupported Daily generator version: v2.',
    );
    expect(() => generateDailyPuzzle({ dateUtc: '2026-01-01', generatorVersion: 'v2' })).toThrow(
      RangeError,
    );
    expect(() => generateDailyPuzzle({ dateUtc: '0001-01-01' })).toThrow(RangeError);
    expect(
      generateDailyPuzzle({ dateUtc: '0001-01-01', generatorVersion: 'v1' }).generatorVersion,
    ).toBe('v1');
  });
});
