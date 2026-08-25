import { describe, expect, it } from 'vitest';

import type { DifficultyFeatures, PuzzleDefinition } from '../../src/domain/index.ts';

import {
  approvalFingerprintFrom,
  assertCanonicalCurationProfileOrder,
  assertCurationMachineScaffold,
  buildCurationEvidence,
  normalizeCurationHumanFields,
} from './curation-evidence.ts';

const FEATURES: DifficultyFeatures = Object.freeze({
  activeCells: 2,
  complexityScore: 9,
  compressionGap: 0,
  density: 2 / 9,
  dispersionIndex: 0.5,
  gestureCost: 3,
  hardCandidatePassed: false,
  initialDensity: 0,
  noiseRatio: 0,
  nonzeroCols: 2,
  nonzeroRows: 1,
  normalizedGestureCost: 5,
  overlapIndex: 0,
  rank: 1,
  sweepBound: 1,
  symmetryScore: 1,
  targetDensity: 2 / 9,
});

const PUZZLE: PuzzleDefinition = Object.freeze({
  canonicalSolution: [{ colMask: 5, rowMask: 2 }],
  complexityScore: 9,
  difficulty: 'intro',
  generatorVersion: 'v1',
  id: 'tutorial-01-row',
  initialRows: [0, 0, 0],
  mode: 'tutorial',
  optimalPulseCount: 1,
  schemaVersion: 1,
  seed: 'axis-shift|curation|v1|fixture|tutorial-01-row|0',
  size: 3,
  tags: ['sparse', 'symmetric', 'tutorial'] as const,
  targetRows: [0, 5, 0],
  titleKey: 'level.tutorial.01.title',
  tutorialStepIds: ['tutorial.select-row'],
});

const MANIFEST = Object.freeze({
  candidateSeed: 'fixture',
  catalogVersion: 'content-v1',
  generatorVersion: 'v1',
  profiles: [{ chapter: 'tutorial', order: 1, requiredTags: ['sparse', 'tutorial'] }],
  schemaVersion: 1,
});

function buildFixture() {
  return buildCurationEvidence(
    [
      {
        attempt: 0,
        features: FEATURES,
        profile: { chapter: 'tutorial', order: 1 },
        puzzle: PUZZLE,
      },
    ],
    MANIFEST,
    MANIFEST.candidateSeed,
  );
}

describe('curation evidence binding', () => {
  it('binds manifest-only and puzzle changes into the approval fingerprint', () => {
    const baseline = buildFixture();
    const manifestChanged = buildCurationEvidence(
      [
        {
          attempt: 0,
          features: FEATURES,
          profile: { chapter: 'tutorial', order: 1 },
          puzzle: PUZZLE,
        },
      ],
      {
        ...MANIFEST,
        profiles: [{ chapter: 'tutorial', order: 1, requiredTags: ['tutorial', 'sparse'] }],
      },
      MANIFEST.candidateSeed,
    );
    const puzzleChanged = buildCurationEvidence(
      [
        {
          attempt: 0,
          features: FEATURES,
          profile: { chapter: 'tutorial', order: 1 },
          puzzle: { ...PUZZLE, targetRows: [0, 7, 0] },
        },
      ],
      MANIFEST,
      MANIFEST.candidateSeed,
    );

    expect(manifestChanged.approvalFingerprint).not.toBe(baseline.approvalFingerprint);
    expect(puzzleChanged.approvalFingerprint).not.toBe(baseline.approvalFingerprint);
  });

  it('normalizes only the documented human-editable fields', () => {
    const evidence = buildFixture();
    const approvedFragment = evidence.pendingMarkdown
      .replace('- Human reviewer: **PENDING**', '- Human reviewer: **프로젝트 오너**')
      .replace('- Reviewed at: **PENDING**', '- Reviewed at: **2026-08-26T12:34:56+09:00**')
      .replace('- Overall decision: **PENDING**', '- Overall decision: **APPROVED**')
      .replace(
        '| Tutorial 1→6 | 행 → 열 → 교차점 → PULSE → 복수 축 → 중첩 취소 | 없음 | PENDING | PENDING |',
        '| Tutorial 1→6 | 행 → 열 → 교차점 → PULSE → 복수 축 → 중첩 취소 | 없음 | PASS | 전체 승인 |',
      )
      .replace('- Pattern readability: **PENDING**', '- Pattern readability: **PASS**')
      .replace('- Difficulty/progression: **PENDING**', '- Difficulty/progression: **PASS**')
      .replace(
        '- Unpleasant or misleading pattern: **PENDING**',
        '- Unpleasant or misleading pattern: **NONE**',
      )
      .replace('- Human decision: **PENDING**', '- Human decision: **PASS**')
      .replaceAll('- [ ] ', '- [x] ');

    expect(normalizeCurationHumanFields(approvedFragment)).toBe(evidence.pendingMarkdown);
    expect(() =>
      assertCurationMachineScaffold(approvedFragment, evidence.pendingMarkdown),
    ).not.toThrow();
  });

  it('rejects machine scaffold edits and duplicate fingerprint lines', () => {
    const evidence = buildFixture();
    expect(() =>
      assertCurationMachineScaffold(
        evidence.pendingMarkdown.replace('- candidate attempt: 0', '- candidate attempt: 1'),
        evidence.pendingMarkdown,
      ),
    ).toThrow(/machine scaffold/u);

    const line = `- Approval fingerprint SHA-256: \`${evidence.approvalFingerprint}\``;
    expect(() =>
      approvalFingerprintFrom(evidence.pendingMarkdown.replace(line, `${line}\n${line}`)),
    ).toThrow(/exactly once/u);
  });

  it('requires the physical manifest array to use canonical chapter and order', () => {
    const canonical = [
      ...Array.from({ length: 6 }, (_, index) => ({ chapter: 'tutorial', order: index + 1 })),
      ...['pulse', 'echo', 'rank', 'noise'].flatMap((chapter) =>
        Array.from({ length: 12 }, (_, index) => ({ chapter, order: index + 1 })),
      ),
    ];
    const [first, second, ...remaining] = canonical;
    if (first === undefined || second === undefined)
      throw new Error('Canonical fixture is incomplete.');
    expect(() => assertCanonicalCurationProfileOrder(canonical)).not.toThrow();
    expect(() => assertCanonicalCurationProfileOrder([second, first, ...remaining])).toThrow(
      /canonical/u,
    );
  });
});
