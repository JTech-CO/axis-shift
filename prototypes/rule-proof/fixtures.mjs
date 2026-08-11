import {
  generateM00Candidate,
  normalizeSeed,
} from "./m00-seeded-generator.mjs";

const freezePulse = ({ rowMask, colMask }) =>
  Object.freeze({ rowMask, colMask });

const freezeRows = (rows) => Object.freeze([...rows]);

const freezeFixture = (fixture) =>
  Object.freeze({
    ...fixture,
    initialRows: freezeRows(fixture.initialRows),
    targetRows: freezeRows(fixture.targetRows),
    canonicalPulses: Object.freeze(fixture.canonicalPulses.map(freezePulse)),
    expectedStates: Object.freeze(fixture.expectedStates.map(freezeRows)),
  });

const easyStage = freezeFixture({
  id: "M00-MAIN-v1",
  stageId: "easy",
  stageNumber: 1,
  label: "쉬움 4×4",
  difficulty: "easy",
  title: "기본 신호",
  profileId: "easy-4",
  structuralClass: "intro",
  size: 4,
  initialRows: [0, 0, 0, 0],
  targetRows: [11, 6, 13, 6],
  par: 2,
  canonicalPulses: [
    { rowMask: 5, colMask: 13 },
    { rowMask: 11, colMask: 6 },
  ],
  expectedStates: [
    [13, 0, 13, 0],
    [11, 6, 13, 6],
  ],
});

const normalStage = freezeFixture({
  id: "M00-NORMAL-v1",
  stageId: "normal",
  stageNumber: 2,
  label: "보통 4×4",
  difficulty: "normal",
  title: "교차 신호",
  profileId: "normal-4",
  structuralClass: "standard",
  size: 4,
  initialRows: [0, 0, 0, 0],
  targetRows: [5, 9, 6, 3],
  par: 3,
  canonicalPulses: [
    { rowMask: 11, colMask: 9 },
    { rowMask: 12, colMask: 10 },
    { rowMask: 5, colMask: 12 },
  ],
  expectedStates: [
    [9, 9, 0, 9],
    [9, 9, 10, 3],
    [5, 9, 6, 3],
  ],
});

const normal5Candidate = generateM00Candidate("normal-5", "catalog-normal-5-v1");
const normal5Stage = freezeFixture({
  ...normal5Candidate,
  id: "M00-NORMAL-5X5-v1",
  stageId: "normal-5",
  stageNumber: 3,
  label: "보통 5×5",
  difficulty: "normal",
  title: "확장 교차 신호",
});

const fullRankStage = freezeFixture({
  id: "M00-HARD-v1",
  stageId: "full-rank",
  stageNumber: null,
  label: "대조군",
  difficulty: "control",
  title: "Full Rank 4×4 대조군",
  profileId: "full-rank-control",
  structuralClass: "control",
  size: 4,
  initialRows: [0, 0, 0, 0],
  targetRows: [6, 9, 10, 13],
  par: 4,
  canonicalPulses: [
    { rowMask: 10, colMask: 1 },
    { rowMask: 5, colMask: 2 },
    { rowMask: 9, colMask: 4 },
    { rowMask: 14, colMask: 8 },
  ],
  expectedStates: [
    [0, 1, 0, 1],
    [2, 1, 2, 1],
    [6, 1, 2, 5],
    [6, 9, 10, 13],
  ],
});

const hard4Candidate = generateM00Candidate("hard-4", "catalog-hard-4-v1");
const hard4Stage = freezeFixture({
  ...hard4Candidate,
  id: "M00-CANDIDATE-4X4-v1",
  stageId: "hard-4",
  stageNumber: 4,
  label: "어려움 4×4",
  difficulty: "hard",
  title: "압축 비교 4×4",
});

const hard5Stage = freezeFixture({
  id: "M00-CANDIDATE-5X5-v1",
  stageId: "hard-5",
  stageNumber: 5,
  label: "어려움 5×5",
  difficulty: "hard",
  title: "압축 비교 5×5",
  profileId: "hard-5",
  structuralClass: "anti-sweep",
  size: 5,
  initialRows: [0, 0, 0, 0, 0],
  targetRows: [25, 19, 13, 30, 7],
  par: 3,
  canonicalPulses: [
    { rowMask: 23, colMask: 25 },
    { rowMask: 26, colMask: 10 },
    { rowMask: 28, colMask: 20 },
  ],
  expectedStates: [
    [25, 25, 25, 0, 25],
    [25, 19, 25, 10, 19],
    [25, 19, 13, 30, 7],
  ],
});

const hard6Stage = freezeFixture({
  id: "M00-CANDIDATE-6X6-v1",
  stageId: "hard-6",
  stageNumber: 6,
  label: "어려움 6×6",
  difficulty: "hard",
  title: "압축 비교 6×6",
  profileId: "hard-6",
  structuralClass: "anti-sweep",
  size: 6,
  initialRows: [0, 0, 0, 0, 0, 0],
  targetRows: [7, 25, 42, 7, 30, 45],
  par: 3,
  canonicalPulses: [
    { rowMask: 43, colMask: 25 },
    { rowMask: 29, colMask: 42 },
    { rowMask: 57, colMask: 52 },
  ],
  expectedStates: [
    [25, 25, 0, 25, 0, 25],
    [51, 25, 42, 51, 42, 25],
    [7, 25, 42, 7, 30, 45],
  ],
});

const backupFixture = freezeFixture({
  id: "M00-BACKUP-v1",
  stageId: "backup",
  stageNumber: null,
  label: "예비",
  difficulty: "normal",
  title: "회귀 신호",
  size: 4,
  initialRows: [0, 0, 0, 0],
  targetRows: [15, 6, 5, 10],
  par: 3,
  canonicalPulses: [
    { rowMask: 5, colMask: 9 },
    { rowMask: 11, colMask: 10 },
    { rowMask: 7, colMask: 12 },
  ],
  expectedStates: [
    [9, 0, 9, 0],
    [3, 10, 9, 10],
    [15, 6, 5, 10],
  ],
});

export const STAGES = Object.freeze([
  easyStage,
  normalStage,
  normal5Stage,
  hard4Stage,
  hard5Stage,
  hard6Stage,
]);
export const CONTROL_FIXTURES = Object.freeze([fullRankStage]);
export const REGRESSION_FIXTURES = Object.freeze([fullRankStage, backupFixture]);
export const FIXTURES = Object.freeze([...STAGES, ...REGRESSION_FIXTURES]);
export const STAGE_ALIASES = Object.freeze({
  "easy-4": "easy",
  "normal-4": "normal",
  hard: "full-rank",
});
const ROUTABLE_STAGES = Object.freeze([...STAGES, ...CONTROL_FIXTURES]);

export { normalizeSeed };

export function resolveStageId(stageId = "easy") {
  return Object.hasOwn(STAGE_ALIASES, stageId) ? STAGE_ALIASES[stageId] : stageId;
}

export function getFixture(id = "M00-MAIN-v1") {
  const fixture = FIXTURES.find((candidate) => candidate.id === id);
  if (!fixture) throw new RangeError(`Unknown fixture: ${id}`);
  return fixture;
}

export function getStage(stageId = "easy") {
  const resolvedStageId = resolveStageId(stageId);
  const stage = ROUTABLE_STAGES.find(
    (candidate) => candidate.stageId === resolvedStageId,
  );
  if (!stage) throw new RangeError(`Unknown stage: ${stageId}`);
  return stage;
}

export function getNextStage(stageId) {
  const resolvedStageId = resolveStageId(stageId);
  const index = STAGES.findIndex((candidate) => candidate.stageId === resolvedStageId);
  if (index < 0) {
    if (resolvedStageId === "full-rank") return getStage("hard-5");
    throw new RangeError(`Unknown stage: ${stageId}`);
  }
  return STAGES[(index + 1) % STAGES.length];
}

export function generateStageFixture(stageId, seed) {
  const stage = getStage(stageId);
  const generated = generateM00Candidate(stage.profileId, seed);
  return freezeFixture({
    ...stage,
    ...generated,
    id: `${stage.id}@${generated.seedKey}`,
    baseFixtureId: stage.id,
    stageId: stage.stageId,
    stageNumber: stage.stageNumber,
    label: stage.label,
    difficulty: stage.difficulty,
    title: stage.title,
  });
}
