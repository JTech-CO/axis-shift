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
  label: "쉬움",
  difficulty: "easy",
  title: "기본 신호",
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
  label: "보통",
  difficulty: "normal",
  title: "교차 신호",
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

const hardStage = freezeFixture({
  id: "M00-HARD-v1",
  stageId: "hard",
  stageNumber: 3,
  label: "어려움",
  difficulty: "hard",
  title: "다층 신호",
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

export const STAGES = Object.freeze([easyStage, normalStage, hardStage]);
export const REGRESSION_FIXTURES = Object.freeze([backupFixture]);
export const FIXTURES = Object.freeze([...STAGES, ...REGRESSION_FIXTURES]);

export function getFixture(id = "M00-MAIN-v1") {
  const fixture = FIXTURES.find((candidate) => candidate.id === id);
  if (!fixture) throw new RangeError(`Unknown fixture: ${id}`);
  return fixture;
}

export function getStage(stageId = "easy") {
  const stage = STAGES.find((candidate) => candidate.stageId === stageId);
  if (!stage) throw new RangeError(`Unknown stage: ${stageId}`);
  return stage;
}

export function getNextStage(stageId) {
  const index = STAGES.findIndex((candidate) => candidate.stageId === stageId);
  if (index < 0) throw new RangeError(`Unknown stage: ${stageId}`);
  return STAGES[(index + 1) % STAGES.length];
}
