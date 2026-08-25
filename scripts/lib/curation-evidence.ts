import {
  sha256Hex,
  stableSerialize,
  type DifficultyFeatures,
  type PuzzleDefinition,
} from '../../src/domain/index.ts';

const APPROVAL_FINGERPRINT_DOMAIN = 'axis-shift/m03-curation-approval/v1';
const APPROVAL_FINGERPRINT_PLACEHOLDER = '0'.repeat(64);

const PROGRESSION_ROWS = [
  ['Tutorial 1→6', '행 → 열 → 교차점 → PULSE → 복수 축 → 중첩 취소', '없음'],
  ['Pulse 01→12', '직접적인 축 묶음과 rank 1→3', 'Tutorial'],
  ['Echo 01→12', '겹침과 짝수 번 취소', 'Tutorial Echo, Pulse'],
  ['Rank 01→12', 'sweep보다 압축된 최소 PULSE', 'Pulse, Echo'],
  ['Noise 01→12', '비어 있지 않은 initial에서 차이 읽기', 'Pulse, Echo, Rank'],
] as const;

const COMPLETION_LABELS = [
  '54/54 Pattern readability PASS',
  '54/54 Difficulty/progression PASS 또는 사람 근거를 남긴 재분류',
  'Tutorial + Lab 4 chapter 학습 순서 5/5 PASS',
  'replacement pending=0',
  'reviewer/time/overall decision 기입',
] as const;

const LEVEL_VERDICT_LABELS = [
  'Pattern readability',
  'Difficulty/progression',
  'Unpleasant or misleading pattern',
  'Human decision',
] as const;

export interface CurationEvidenceManifest {
  readonly catalogVersion: string;
  readonly generatorVersion: string;
  readonly profiles?: readonly unknown[];
}

export interface CurationEvidenceProfile {
  readonly chapter: string;
  readonly order: number;
}

export interface CurationEvidenceItem {
  readonly attempt: number;
  readonly features: DifficultyFeatures;
  readonly profile: CurationEvidenceProfile;
  readonly puzzle: PuzzleDefinition;
}

export interface CurationEvidenceBuild {
  readonly approvalFingerprint: string;
  readonly catalogHash: string;
  readonly pendingMarkdown: string;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

function xorRows(left: readonly number[], right: readonly number[]): number[] {
  return left.map((row, index) => row ^ (right[index] as number));
}

function asciiBoard(rows: readonly number[], size: number): string {
  return rows
    .map((row) =>
      Array.from({ length: size }, (_, column) => ((row & (1 << column)) === 0 ? '·' : '◆')).join(
        ' ',
      ),
    )
    .join('\n');
}

function renderPendingMarkdown(
  items: readonly CurationEvidenceItem[],
  manifest: CurationEvidenceManifest,
  baseSeed: string,
  catalogHash: string,
  approvalFingerprint: string,
): string {
  const lines = [
    '# M03 콘텐츠 큐레이션 체크리스트 — v1',
    '',
    '> 이 파일의 보드·수치·해답 정보는 자동 생성된 E2/E3 검토 보조 자료다. 사람 검토 결과는 아래 reviewer/time/decision 및 판정 필드에 기록한다.',
    '',
    `- Catalog version: \`${manifest.catalogVersion}\``,
    `- Generator version: \`${manifest.generatorVersion}\``,
    `- Candidate seed: \`${baseSeed}\``,
    `- Catalog SHA-256: \`${catalogHash}\``,
    `- Approval fingerprint SHA-256: \`${approvalFingerprint}\``,
    `- Automated candidates: ${items.length}`,
    '- Human reviewer: **PENDING**',
    '- Reviewed at: **PENDING**',
    '- Overall decision: **PENDING**',
    '',
    '## 학습 순서 승인',
    '',
    '| 구간 | 도입 개념 | 선행 개념 | 사람 판정 | 메모 |',
    '|---|---|---|---|---|',
    ...PROGRESSION_ROWS.map(
      ([label, concept, prerequisite]) =>
        `| ${label} | ${concept} | ${prerequisite} | PENDING | PENDING |`,
    ),
    '',
    '## 개별 후보 atlas',
    '',
  ];

  for (const item of items) {
    const difference = xorRows(item.puzzle.initialRows, item.puzzle.targetRows);
    lines.push(
      `### ${item.puzzle.id}`,
      '',
      `- titleKey: \`${item.puzzle.titleKey ?? ''}\``,
      `- chapter/order: \`${item.profile.chapter}/${item.profile.order}\``,
      `- candidate attempt: ${item.attempt}`,
      `- size/rank/difficulty: ${item.puzzle.size}×${item.puzzle.size} / ${item.features.rank} / ${item.puzzle.difficulty}`,
      `- tags: ${item.puzzle.tags.join(', ')}`,
      `- density/target/initial: ${item.features.density.toFixed(4)} / ${item.features.targetDensity.toFixed(4)} / ${item.features.initialDensity.toFixed(4)}`,
      `- nonzero rows/cols, sweep/gap: ${item.features.nonzeroRows}/${item.features.nonzeroCols}, ${item.features.sweepBound}/${item.features.compressionGap}`,
      `- overlap/symmetry/complexity/gesture: ${item.features.overlapIndex.toFixed(4)} / ${item.features.symmetryScore.toFixed(4)} / ${item.features.complexityScore} / ${item.features.gestureCost}`,
      `- canonical: ${JSON.stringify(item.puzzle.canonicalSolution)}`,
      '',
      '```text',
      'INITIAL',
      asciiBoard(item.puzzle.initialRows, item.puzzle.size),
      '',
      'TARGET',
      asciiBoard(item.puzzle.targetRows, item.puzzle.size),
      '',
      'DIFFERENCE',
      asciiBoard(difference, item.puzzle.size),
      '```',
      '',
      '- Pattern readability: **PENDING**',
      '- Difficulty/progression: **PENDING**',
      '- Unpleasant or misleading pattern: **PENDING**',
      '- Human decision: **PENDING**',
      '',
    );
  }

  lines.push(
    '## 완료 조건',
    '',
    ...COMPLETION_LABELS.map((label) => `- [ ] ${label}`),
    '',
    '위 조건 전에는 M03 DOD-04를 완료로 표시하지 않는다.',
    '',
  );
  return lines.join('\n');
}

export function assertCanonicalCurationProfileOrder(
  profiles: readonly CurationEvidenceProfile[],
): void {
  const expected = [
    ...Array.from({ length: 6 }, (_, index) => `tutorial:${index + 1}`),
    ...['pulse', 'echo', 'rank', 'noise'].flatMap((chapter) =>
      Array.from({ length: 12 }, (_, index) => `${chapter}:${index + 1}`),
    ),
  ];
  const actual = profiles.map((profile) => `${profile.chapter}:${profile.order}`);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      'Curation manifest profiles must use canonical tutorial/pulse/echo/rank/noise array order.',
    );
  }
}

export function buildCurationEvidence(
  items: readonly CurationEvidenceItem[],
  manifest: CurationEvidenceManifest,
  baseSeed: string,
): CurationEvidenceBuild {
  const catalog = items.map((item) => item.puzzle);
  const catalogHash = sha256Hex(JSON.stringify(catalog));
  const pendingWithPlaceholder = renderPendingMarkdown(
    items,
    manifest,
    baseSeed,
    catalogHash,
    APPROVAL_FINGERPRINT_PLACEHOLDER,
  );
  const approvalFingerprint = sha256Hex(
    stableSerialize({
      domain: APPROVAL_FINGERPRINT_DOMAIN,
      catalog,
      manifest,
      pendingScaffold: pendingWithPlaceholder,
      schemaVersion: 1,
    }),
  );
  return Object.freeze({
    approvalFingerprint,
    catalogHash,
    pendingMarkdown: renderPendingMarkdown(
      items,
      manifest,
      baseSeed,
      catalogHash,
      approvalFingerprint,
    ),
  });
}

export function approvalFingerprintFrom(markdown: string): string | undefined {
  const matches = [...markdown.matchAll(/^- Approval fingerprint SHA-256: `([0-9a-f]{64})`$/gmu)];
  if (matches.length === 0) return undefined;
  if (matches.length !== 1) {
    throw new Error('Curation approval fingerprint must occur exactly once.');
  }
  return matches[0]?.[1];
}

export function normalizeCurationHumanFields(markdown: string): string {
  let normalized = markdown.replaceAll('\r\n', '\n');
  for (const label of ['Human reviewer', 'Reviewed at', 'Overall decision']) {
    normalized = normalized.replace(
      new RegExp(`^- ${escapeRegex(label)}: \\*\\*[^*\\r\\n]+\\*\\*$`, 'gmu'),
      `- ${label}: **PENDING**`,
    );
  }
  for (const [label, concept, prerequisite] of PROGRESSION_ROWS) {
    const prefix = `| ${label} | ${concept} | ${prerequisite} |`;
    normalized = normalized.replace(
      new RegExp(`^${escapeRegex(prefix)} (?:PENDING|PASS) \\| [^|\\r\\n]* \\|$`, 'gmu'),
      `${prefix} PENDING | PENDING |`,
    );
  }
  for (const label of LEVEL_VERDICT_LABELS) {
    normalized = normalized.replace(
      new RegExp(`^- ${escapeRegex(label)}: \\*\\*(?:PENDING|PASS|NONE|REPLACE)\\*\\*$`, 'gmu'),
      `- ${label}: **PENDING**`,
    );
  }
  for (const label of COMPLETION_LABELS) {
    normalized = normalized.replace(
      new RegExp(`^- \\[([ x])\\] ${escapeRegex(label)}$`, 'gmu'),
      `- [ ] ${label}`,
    );
  }
  return normalized;
}

export function assertCurationMachineScaffold(
  actualMarkdown: string,
  expectedPendingMarkdown: string,
): void {
  if (normalizeCurationHumanFields(actualMarkdown) !== expectedPendingMarkdown) {
    throw new Error('Curation atlas machine scaffold differs from the current generated template.');
  }
}
