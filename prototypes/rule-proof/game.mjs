import {
  CAMPAIGN_SIGNAL_COUNT,
  CAMPAIGN_SIGNALS_PER_STAGE,
  STAGES,
  generateStageFixture,
  getCampaignSignal,
  getFixture,
  getNextCampaignSignal,
  getNextStage,
  getStage,
} from "./fixtures.mjs";
import { analyzeCompletedRun } from "./play-analysis.mjs";
import {
  beginPulse,
  commitPulse,
  createSession,
  resetSession,
  toggleCol,
  toggleRow,
  undoSession,
} from "./session.mjs";
import {
  completeStopwatch,
  createStopwatch,
  formatElapsedSeconds,
  formatStopwatch,
  pauseStopwatch,
  readStopwatch,
  resetStopwatch,
  startStopwatch,
} from "./stopwatch.mjs";

const ROW_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function requiredElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element #${id}`);
  return element;
}

function stageFixtureFromParams(stage, params) {
  const seed = params.get("seed");
  if (seed !== null) return generateStageFixture(stage.stageId, seed);
  if (stage.stageNumber === null) return stage;

  const requestedSignal = Number(params.get("signal") ?? 1);
  const signal =
    Number.isInteger(requestedSignal) &&
    requestedSignal >= 1 &&
    requestedSignal <= CAMPAIGN_SIGNALS_PER_STAGE
      ? requestedSignal
      : 1;
  return getCampaignSignal(stage.stageId, signal);
}

function requestedFixture() {
  const params = new URLSearchParams(window.location.search);
  const requestedStage = params.get("stage");
  if (requestedStage) {
    try {
      return stageFixtureFromParams(
        getStage(requestedStage.toLowerCase()),
        params,
      );
    } catch {
      // Continue to the legacy fixture route before falling back to Easy.
    }
  }

  const value = params.get("fixture");
  if (!value || value.toLowerCase() === "main") {
    return stageFixtureFromParams(getStage("easy"), params);
  }
  if (value.toLowerCase() === "backup") return getFixture("M00-BACKUP-v1");

  try {
    return stageFixtureFromParams(getStage(value.toLowerCase()), params);
  } catch {
    try {
      return getFixture(value);
    } catch {
      return getStage("easy");
    }
  }
}

let fixture = requestedFixture();
let session = createSession(fixture);
let stopwatch = createStopwatch();
let pulseTimer = null;
let stopwatchFrame = null;
let pendingStageId = null;
let fallbackSeedCounter = 0;
const secureSeedAvailable =
  typeof globalThis.crypto?.getRandomValues === "function";

const app = requiredElement("app");
const fixtureLabel = requiredElement("fixture-label");
const goalChip = requiredElement("goal-chip");
const stageCurrent = requiredElement("stage-current");
const stagePosition = requiredElement("stage-position");
const stageButtonsContainer = requiredElement("stage-buttons");
const stageStatus = requiredElement("stage-status");
const targetGrid = requiredElement("target-grid");
const currentGrid = requiredElement("current-grid");
const boardStatus = requiredElement("board-status");
const boardStage = requiredElement("board-stage");
const colRail = requiredElement("col-rail");
const rowRail = requiredElement("row-rail");
const moveCount = requiredElement("move-count");
const elapsedTime = requiredElement("elapsed-time");
const selectionSummary = requiredElement("selection-summary");
const pulseButton = requiredElement("pulse-button");
const pulseCount = requiredElement("pulse-count");
const pulseStatus = requiredElement("pulse-status");
const undoButton = requiredElement("undo-button");
const resetButton = requiredElement("reset-button");
const resultPanel = requiredElement("result-panel");
const resultTitle = requiredElement("result-title");
const resultMoves = requiredElement("result-moves");
const resultTime = requiredElement("result-time");
const resultGuidance = requiredElement("result-guidance");
const nextStageButton = requiredElement("next-stage-button");
const replayStageButton = requiredElement("replay-stage-button");
const newTargetButton = requiredElement("new-target-button");
const resetDialog = requiredElement("reset-dialog");
const confirmReset = requiredElement("confirm-reset");
const newTargetDialog = requiredElement("new-target-dialog");
const cancelNewTarget = requiredElement("cancel-new-target");
const confirmNewTarget = requiredElement("confirm-new-target");
const stageDialog = requiredElement("stage-dialog");
const stageDialogTarget = requiredElement("stage-dialog-target");
const cancelStageChange = requiredElement("cancel-stage-change");
const confirmStageChange = requiredElement("confirm-stage-change");

function nowMs() {
  return window.performance.now();
}

function cancelStopwatchFrame() {
  if (stopwatchFrame === null) return;
  window.cancelAnimationFrame(stopwatchFrame);
  stopwatchFrame = null;
}

function renderStopwatch(now = nowMs()) {
  const elapsedMs = readStopwatch(stopwatch, now);
  elapsedTime.textContent = formatStopwatch(elapsedMs);
  elapsedTime.dateTime =
    "PT" + (Math.floor(elapsedMs / 100) / 10).toFixed(1) + "S";
  resultTime.textContent = formatElapsedSeconds(elapsedMs);
  app.dataset.elapsedMs = String(Math.floor(elapsedMs));
  app.dataset.timerState =
    stopwatch.completedMs !== null
      ? "completed"
      : stopwatch.runningSince !== null
        ? "running"
        : stopwatch.hasStarted
          ? "paused"
          : "idle";
}

function queueStopwatchFrame() {
  if (
    stopwatchFrame !== null ||
    stopwatch.runningSince === null ||
    document.visibilityState === "hidden"
  ) {
    return;
  }
  stopwatchFrame = window.requestAnimationFrame(() => {
    stopwatchFrame = null;
    renderStopwatch();
    queueStopwatchFrame();
  });
}

function setStopwatch(nextStopwatch) {
  stopwatch = nextStopwatch;
  cancelStopwatchFrame();
  renderStopwatch();
  queueStopwatchFrame();
}

function startGameStopwatch() {
  if (stopwatch.hasStarted) return;
  const now = nowMs();
  let next = startStopwatch(stopwatch, now);
  if (document.visibilityState === "hidden") {
    next = pauseStopwatch(next, now);
  }
  setStopwatch(next);
}

function resumeGameStopwatch() {
  if (!stopwatch.hasStarted || session.phase === "solved") return;
  const now = nowMs();
  let next = startStopwatch(stopwatch, now);
  if (document.visibilityState === "hidden") {
    next = pauseStopwatch(next, now);
  }
  setStopwatch(next);
}

function completeGameStopwatch() {
  setStopwatch(completeStopwatch(stopwatch, nowMs()));
}

function resetGameStopwatch() {
  setStopwatch(resetStopwatch());
}

function isOn(rows, row, col) {
  return ((rows[row] >> col) & 1) === 1;
}

function countBits(mask) {
  let value = mask;
  let count = 0;
  while (value !== 0) {
    count += value & 1;
    value >>= 1;
  }
  return count;
}

function selectedLabels(mask, labels) {
  return labels.filter((_, index) => ((mask >> index) & 1) === 1);
}

function activeStage() {
  return STAGES.find((stage) => stage.stageId === fixture.stageId) ?? null;
}

function campaignSignal() {
  return Number.isInteger(fixture.campaignSignal) ? fixture.campaignSignal : null;
}

function generatedSeed() {
  if (campaignSignal() !== null) return null;
  return fixture.baseFixtureId === undefined ? null : fixture.seed;
}

function seedSource() {
  if (campaignSignal() !== null) return "campaign";
  const seed = generatedSeed();
  if (seed === null) return "catalog";
  return seed.startsWith("fallback-") ? "fallback" : "crypto";
}

function nextPlayableFixture() {
  const signal = campaignSignal();
  if (signal !== null) return getNextCampaignSignal(fixture.stageId, signal);
  try {
    return getCampaignSignal(getNextStage(fixture.stageId).stageId, 1);
  } catch {
    return getCampaignSignal("easy", 1);
  }
}

function targetDescription(rows) {
  return rows
    .map((row, rowIndex) => {
      const cells = Array.from({ length: fixture.size }, (_, col) =>
        isOn(rows, rowIndex, col) ? "켜짐" : "꺼짐",
      );
      return `${ROW_LABELS[rowIndex]}행 ${cells.join(", ")}`;
    })
    .join("; ");
}

function boardDifferenceCount(rows) {
  return rows.reduce(
    (count, row, index) => count + countBits(row ^ fixture.targetRows[index]),
    0,
  );
}

function announceBoard(action) {
  const description = targetDescription(session.currentRows);
  const remaining = boardDifferenceCount(session.currentRows);
  currentGrid.setAttribute(
    "aria-label",
    `현재 신호 ${fixture.size}행 ${fixture.size}열. ${description}`,
  );
  boardStatus.textContent = `${action}. 현재 신호는 ${description}. 목표와 다른 셀 ${remaining}개.`;
}

function createTargetGrid() {
  targetGrid.replaceChildren();
  targetGrid.dataset.rows = fixture.targetRows.join(",");
  targetGrid.dataset.initialRows = fixture.initialRows.join(",");
  targetGrid.dataset.seed = generatedSeed() ?? "";
  targetGrid.dataset.puzzleKey = generatedSeed() === null ? "" : fixture.puzzleKey;
  targetGrid.dataset.seedSource = seedSource();
  targetGrid.setAttribute(
    "aria-label",
    `목표 신호 ${fixture.size}행 ${fixture.size}열. ${targetDescription(fixture.targetRows)}`,
  );

  for (let row = 0; row < fixture.size; row += 1) {
    for (let col = 0; col < fixture.size; col += 1) {
      const cell = document.createElement("span");
      cell.className = "target-cell";
      cell.dataset.on = String(isOn(fixture.targetRows, row, col));
      cell.setAttribute("aria-hidden", "true");

      const signal = document.createElement("span");
      signal.className = "target-signal";
      cell.append(signal);
      targetGrid.append(cell);
    }
  }
}

function createAxisButton(kind, index, visibleLabel) {
  const button = document.createElement("button");
  button.className = "axis-button";
  button.type = "button";
  button.dataset.axis = kind;
  button.dataset.index = String(index);
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-controls", "current-grid");
  button.setAttribute("aria-label", `${kind === "row" ? "행" : "열"} ${visibleLabel} 선택`);

  const marker = document.createElement("span");
  marker.className = "axis-marker";
  marker.setAttribute("aria-hidden", "true");
  marker.textContent = "●";

  const label = document.createElement("span");
  label.className = "axis-label";
  label.textContent = visibleLabel;
  button.append(label, marker);

  button.addEventListener("click", () => {
    const nextSession =
      kind === "row" ? toggleRow(session, index) : toggleCol(session, index);
    if (
      nextSession !== session &&
      !stopwatch.hasStarted &&
      (nextSession.rowMask !== 0 || nextSession.colMask !== 0)
    ) {
      startGameStopwatch();
    }
    session = nextSession;
    render();
  });
  return button;
}

function createStageButton(stage) {
  const button = document.createElement("button");
  button.className = "stage-button";
  button.type = "button";
  button.dataset.stage = stage.stageId;
  button.dataset.active = "false";
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-controls", "target-grid current-grid");
  button.setAttribute(
    "aria-label",
    `${stage.stageNumber}단계 ${stage.label}, ${stage.title}`,
  );

  const number = document.createElement("span");
  number.className = "stage-number";
  number.setAttribute("aria-hidden", "true");
  number.textContent = String(stage.stageNumber).padStart(2, "0");

  const label = document.createElement("strong");
  label.textContent = stage.label;

  const marker = document.createElement("span");
  marker.className = "stage-marker";
  marker.setAttribute("aria-hidden", "true");
  marker.textContent = "현재";

  button.append(number, label, marker);
  button.addEventListener("click", () => requestStageChange(stage.stageId));
  return button;
}

let colButtons = [];
let rowButtons = [];
let boardCells = [];

const stageButtons = STAGES.map(createStageButton);
stageButtonsContainer.append(...stageButtons);

function rebuildBoard() {
  app.dataset.boardSize = String(fixture.size);
  app.style.setProperty("--board-size", String(fixture.size));
  boardStage.dataset.size = String(fixture.size);

  colRail.replaceChildren();
  rowRail.replaceChildren();
  currentGrid.replaceChildren();

  colButtons = Array.from({ length: fixture.size }, (_, index) =>
    createAxisButton("col", index, String(index + 1)),
  );
  rowButtons = Array.from({ length: fixture.size }, (_, index) =>
    createAxisButton("row", index, ROW_LABELS[index]),
  );
  colRail.append(...colButtons);
  rowRail.append(...rowButtons);

  boardCells = Array.from({ length: fixture.size }, (_, row) =>
    Array.from({ length: fixture.size }, (_, col) => {
      const cell = document.createElement("div");
      cell.className = "current-cell";
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      cell.style.setProperty("--cell-row", String(row));
      cell.style.setProperty("--cell-col", String(col));
      cell.setAttribute("aria-hidden", "true");

      const signal = document.createElement("span");
      signal.className = "current-signal";
      signal.setAttribute("aria-hidden", "true");

      const preview = document.createElement("span");
      preview.className = "preview-glyph";
      preview.setAttribute("aria-hidden", "true");

      cell.append(signal, preview);
      currentGrid.append(cell);
      return { cell, preview };
    }),
  );

  createTargetGrid();
}

function selectionMessage(rowMask, colMask) {
  const rows = selectedLabels(rowMask, ROW_LABELS);
  const cols = selectedLabels(
    colMask,
    Array.from({ length: fixture.size }, (_, index) => String(index + 1)),
  );
  if (rows.length === 0 && cols.length === 0) return "행과 열을 선택하세요";
  if (rows.length === 0) return `열 ${cols.join(", ")} · 행을 선택하세요`;
  if (cols.length === 0) return `행 ${rows.join(", ")} · 열을 선택하세요`;
  return `행 ${rows.join(", ")} × 열 ${cols.join(", ")}`;
}

function pulseMessage(rowMask, colMask) {
  if (session.phase === "solved") return "목표 신호와 일치했습니다. 보드가 잠겼습니다.";
  const intersections = countBits(rowMask) * countBits(colMask);
  if (session.phase === "pulsing") return `${intersections}개 교차점을 반전하는 중입니다.`;
  if (rowMask === 0 && colMask === 0) return "행과 열을 선택하세요.";
  if (rowMask === 0) return "행을 하나 이상 선택하세요.";
  if (colMask === 0) return "열을 하나 이상 선택하세요.";
  return `${countBits(rowMask)}개 행 × ${countBits(colMask)}개 열 · ${intersections}개 셀이 반전될 예정입니다.`;
}

function renderAxisButtons(buttons, mask) {
  buttons.forEach((button, index) => {
    const selected = ((mask >> index) & 1) === 1;
    button.dataset.selected = String(selected);
    button.setAttribute("aria-pressed", String(selected));
    button.disabled = session.phase === "pulsing" || session.phase === "solved";
  });
}

function renderStageMetadata() {
  const current = activeStage();
  const next = nextPlayableFixture();
  const signal = campaignSignal();
  const isCampaign = signal !== null;

  fixtureLabel.textContent = current
    ? isCampaign
      ? `SIGNAL ${String(fixture.campaignPosition).padStart(2, "0")} · ${current.label}`
      : `RANDOM · ${current.label}`
    : `TEST · ${fixture.label}`;
  app.dataset.fixture = fixture.id;
  app.dataset.stage = fixture.stageId;
  app.dataset.seed = generatedSeed() ?? "";
  app.dataset.puzzleKey = fixture.puzzleKey ?? "";
  app.dataset.generated = String(generatedSeed() !== null);
  app.dataset.seedSource = seedSource();
  app.dataset.campaignSignal = signal === null ? "" : String(signal);
  app.dataset.campaignPosition = isCampaign ? String(fixture.campaignPosition) : "";
  app.dataset.campaignCount = String(CAMPAIGN_SIGNAL_COUNT);
  app.dataset.runKind = isCampaign ? "campaign" : current ? "random" : "control";
  goalChip.textContent = `PAR ${fixture.par}`;

  if (current) {
    stageCurrent.textContent = isCampaign
      ? `${current.stageNumber}단계 · ${current.label} — ${current.title} · 신호 ${signal}/${CAMPAIGN_SIGNALS_PER_STAGE}`
      : `${current.stageNumber}단계 · ${current.label} — 랜덤 신호`;
    stagePosition.textContent = isCampaign
      ? `${fixture.campaignPosition} / ${CAMPAIGN_SIGNAL_COUNT}`
      : "∞ RANDOM";
    stagePosition.setAttribute(
      "aria-label",
      isCampaign
        ? `전체 ${CAMPAIGN_SIGNAL_COUNT}개 신호 중 ${fixture.campaignPosition}번째`
        : `${current.label} 랜덤 신호`,
    );
    resultTitle.textContent = `${current.label} 패턴 일치`;
    nextStageButton.textContent =
      next.stageId === fixture.stageId
        ? `다음 신호 · ${next.campaignSignal} / ${CAMPAIGN_SIGNALS_PER_STAGE}`
        : next.stageNumber === 1
          ? "처음 신호부터 다시 플레이"
          : `다음 단계 · ${next.label}`;
    replayStageButton.textContent = `${current.label} · 랜덤 신호`;
    replayStageButton.hidden = false;
  } else {
    stageCurrent.textContent = `검증 fixture · ${fixture.label} — ${fixture.title}`;
    stagePosition.textContent = "TEST";
    stagePosition.setAttribute("aria-label", "회귀 검증 fixture");
    resultTitle.textContent = "패턴 일치";
    nextStageButton.textContent = `${next.label}부터 플레이`;
    replayStageButton.textContent = "";
    replayStageButton.hidden = true;
  }

  nextStageButton.dataset.stage = next.stageId;
  nextStageButton.dataset.signal = String(next.campaignSignal ?? 1);
  newTargetButton.setAttribute(
    "aria-label",
    current ? `${current.label} 랜덤 목표 신호 생성` : "플레이 단계에서 랜덤 목표 신호 생성",
  );
}

function renderStageButtons() {
  stageButtons.forEach((button, index) => {
    const stage = STAGES[index];
    const selected = stage.stageId === fixture.stageId;
    button.dataset.active = String(selected);
    button.setAttribute("aria-pressed", String(selected));
    button.disabled = session.phase === "pulsing";
  });
}

function renderBoard(previewRowMask, previewColMask) {
  const previewActive =
    session.phase !== "solved" && previewRowMask !== 0 && previewColMask !== 0;

  for (let row = 0; row < fixture.size; row += 1) {
    for (let col = 0; col < fixture.size; col += 1) {
      const { cell, preview } = boardCells[row][col];
      const on = isOn(session.currentRows, row, col);
      const intersection =
        previewActive &&
        ((previewRowMask >> row) & 1) === 1 &&
        ((previewColMask >> col) & 1) === 1;
      const previewOn = intersection && !on;
      const previewOff = intersection && on;
      const rowSelected = ((previewRowMask >> row) & 1) === 1;
      const colSelected = ((previewColMask >> col) & 1) === 1;

      cell.dataset.on = String(on);
      cell.dataset.axisRow = String(rowSelected);
      cell.dataset.axisCol = String(colSelected);
      cell.dataset.intersection = String(intersection);
      cell.classList.toggle("preview-on", previewOn);
      cell.classList.toggle("preview-off", previewOff);
      cell.classList.toggle("is-solved", session.phase === "solved");
      preview.textContent = previewOn ? "+" : previewOff ? "−" : "";
    }
  }
}

function render() {
  const previewRowMask = session.pendingMove?.rowMask ?? session.rowMask;
  const previewColMask = session.pendingMove?.colMask ?? session.colMask;
  const rowCount = countBits(previewRowMask);
  const colCount = countBits(previewColMask);
  const intersections = rowCount * colCount;
  const pulseReady = session.phase === "ready" && rowCount > 0 && colCount > 0;
  const hasResettableState =
    session.moves.length > 0 ||
    session.rowMask !== 0 ||
    session.colMask !== 0 ||
    session.phase === "solved" ||
    stopwatch.hasStarted;

  app.dataset.phase = session.phase;
  boardStage.dataset.phase = session.phase;
  currentGrid.dataset.rows = session.currentRows.join(",");
  currentGrid.dataset.axisLinked = String(rowCount > 0 && colCount > 0);
  currentGrid.dataset.signalLock = String(session.phase === "solved");
  currentGrid.setAttribute(
    "aria-label",
    `현재 신호 ${fixture.size}행 ${fixture.size}열. ${targetDescription(session.currentRows)}`,
  );
  moveCount.textContent = String(session.moves.length);

  renderStageMetadata();
  renderStageButtons();
  renderAxisButtons(rowButtons, previewRowMask);
  renderAxisButtons(colButtons, previewColMask);
  renderBoard(previewRowMask, previewColMask);

  selectionSummary.textContent = selectionMessage(previewRowMask, previewColMask);
  pulseStatus.textContent = pulseMessage(previewRowMask, previewColMask);
  pulseButton.disabled = !pulseReady;
  pulseButton.dataset.active = String(pulseReady);
  pulseCount.textContent =
    session.phase === "solved"
      ? "COMPLETE"
      : session.phase === "pulsing"
        ? "TRANSMITTING"
        : pulseReady
          ? `${intersections} CELLS`
          : "LOCKED";

  undoButton.disabled = session.phase === "pulsing" || session.moves.length === 0;
  resetButton.disabled = session.phase === "pulsing" || !hasResettableState;

  const canGenerateTarget = activeStage() !== null;
  newTargetButton.disabled = session.phase === "pulsing" || !canGenerateTarget;
  newTargetButton.title = canGenerateTarget
    ? secureSeedAvailable
      ? ""
      : "비보안 로컬 seed로 새 목표를 생성합니다."
    : "플레이 단계에서 사용할 수 있습니다.";

  const solved = session.phase === "solved";
  const completedRun = solved
    ? analyzeCompletedRun(session.moves)
    : { kind: "none", shouldShowSweepGuidance: false };
  resultPanel.hidden = !solved;
  resultMoves.textContent = String(session.moves.length);
  resultGuidance.hidden = !solved || !completedRun.shouldShowSweepGuidance;
  resultGuidance.dataset.sweepKind = completedRun.kind;
  app.dataset.completionKind = completedRun.kind;
  nextStageButton.disabled = !solved;
  renderStopwatch();
}

function hasUnfinishedProgress() {
  return (
    session.phase !== "solved" &&
    (session.moves.length > 0 ||
      session.rowMask !== 0 ||
      session.colMask !== 0 ||
      session.pendingMove !== null ||
      stopwatch.hasStarted)
  );
}

function replaceRouteInUrl(nextFixture) {
  const url = new URL(window.location.href);
  url.searchParams.delete("fixture");
  url.searchParams.delete("seed");
  url.searchParams.delete("signal");
  url.searchParams.set("stage", nextFixture.stageId);
  if (Number.isInteger(nextFixture.campaignSignal)) {
    url.searchParams.set("signal", String(nextFixture.campaignSignal));
  } else if (nextFixture.baseFixtureId !== undefined) {
    url.searchParams.set("seed", nextFixture.seed);
  }
  window.history.replaceState({}, "", url);
}

function activateFixture(
  nextFixture,
  { focus = "button", startMessage = null } = {},
) {
  if (pulseTimer !== null) {
    window.clearTimeout(pulseTimer);
    pulseTimer = null;
  }

  fixture = nextFixture;
  session = createSession(fixture);
  pendingStageId = null;
  resetGameStopwatch();
  rebuildBoard();
  render();
  replaceRouteInUrl(fixture);

  const announcement =
    startMessage ?? `${fixture.stageNumber}단계 ${fixture.label} 시작`;
  stageStatus.textContent = `${announcement}. ${fixture.title}. 이동 기록과 선택, 시간이 초기화되었습니다.`;
  announceBoard(announcement);

  window.requestAnimationFrame(() => {
    if (focus === "heading") {
      stageCurrent.focus();
      return;
    }
    if (focus === "target") {
      newTargetButton.focus();
      return;
    }
    stageButtons
      .find((button) => button.dataset.stage === fixture.stageId)
      ?.focus();
  });
}

function activateStage(stageId, options = {}) {
  activateFixture(getCampaignSignal(stageId, 1), options);
}

function sameRows(leftRows, rightRows) {
  return (
    leftRows.length === rightRows.length &&
    leftRows.every((row, index) => row === rightRows[index])
  );
}

function createTargetSeed() {
  if (secureSeedAvailable) {
    const values = new Uint32Array(4);
    globalThis.crypto.getRandomValues(values);
    return (
      "crypto-" +
      Array.from(values, (value) =>
        value.toString(16).padStart(8, "0"),
      ).join("")
    );
  }

  fallbackSeedCounter += 1;
  const wallClock = Date.now().toString(36);
  const monotonicClock = Math.floor(nowMs() * 1000).toString(36);
  return `fallback-${wallClock}-${monotonicClock}-${fallbackSeedCounter.toString(36)}`;
}

function generateDifferentTargetFixture() {
  const stage = activeStage();
  if (!stage) throw new Error("New targets require a playable stage");

  for (let attempt = 0; attempt < 32; attempt += 1) {
    const nextFixture = generateStageFixture(stage.stageId, createTargetSeed());
    if (!sameRows(nextFixture.targetRows, fixture.targetRows)) {
      return nextFixture;
    }
  }
  throw new Error("Could not generate a different target");
}

function activateNewTarget(focus = "target") {
  try {
    const nextFixture = generateDifferentTargetFixture();
    activateFixture(nextFixture, {
      focus,
      startMessage: `${nextFixture.label} 새 목표 신호 시작`,
    });
  } catch {
    stageStatus.textContent =
      "새 목표 신호를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.";
    window.requestAnimationFrame(() => newTargetButton.focus());
  }
}

function requestNewTarget() {
  if (
    session.phase === "pulsing" ||
    activeStage() === null
  ) {
    return;
  }

  if (hasUnfinishedProgress()) {
    newTargetDialog.returnValue = "";
    newTargetDialog.showModal();
    return;
  }

  activateNewTarget();
}

function requestStageChange(stageId) {
  if (session.phase === "pulsing" || fixture.stageId === stageId) return;
  const requested = getStage(stageId);

  if (hasUnfinishedProgress()) {
    pendingStageId = stageId;
    stageDialogTarget.textContent = `${requested.stageNumber}단계 · ${requested.label}`;
    stageDialog.returnValue = "";
    stageDialog.showModal();
    return;
  }

  activateStage(stageId, { focus: "button" });
}

pulseButton.addEventListener("click", () => {
  const next = beginPulse(session);
  if (next === session) return;
  session = next;
  render();

  const duration = prefersReducedMotion.matches ? 0 : 360;
  pulseTimer = window.setTimeout(() => {
    session = commitPulse(session);
    pulseTimer = null;
    if (session.phase === "solved") {
      completeGameStopwatch();
    }
    render();
    announceBoard(session.phase === "solved" ? "PULSE 완료. 목표와 일치했습니다" : "PULSE 완료");
    if (session.phase === "solved") {
      window.requestAnimationFrame(() => resultTitle.focus());
    }
  }, duration);
});

undoButton.addEventListener("click", () => {
  const wasSolved = session.phase === "solved";
  session = undoSession(session);
  if (wasSolved && session.phase !== "solved") {
    resumeGameStopwatch();
  }
  render();
  announceBoard("Undo 완료");
});

resetButton.addEventListener("click", () => {
  resetDialog.showModal();
});

confirmReset.addEventListener("click", () => {
  if (pulseTimer !== null) {
    window.clearTimeout(pulseTimer);
    pulseTimer = null;
  }
  session = resetSession(session);
  resetGameStopwatch();
  render();
  announceBoard("Reset 완료");
  window.requestAnimationFrame(() => colButtons[0].focus());
});

cancelStageChange.addEventListener("click", () => {
  pendingStageId = null;
});

stageDialog.addEventListener("cancel", () => {
  pendingStageId = null;
});

confirmStageChange.addEventListener("click", (event) => {
  event.preventDefault();
  const stageId = pendingStageId;
  stageDialog.close("confirm");
  if (stageId) activateStage(stageId, { focus: "button" });
});

nextStageButton.addEventListener("click", () => {
  if (session.phase !== "solved") return;
  activateFixture(nextPlayableFixture(), { focus: "heading" });
});

replayStageButton.addEventListener("click", () => {
  if (session.phase !== "solved") return;
  activateNewTarget("heading");
});

newTargetButton.addEventListener("click", requestNewTarget);

cancelNewTarget.addEventListener("click", () => {
  window.requestAnimationFrame(() => newTargetButton.focus());
});

newTargetDialog.addEventListener("cancel", () => {
  window.requestAnimationFrame(() => newTargetButton.focus());
});

confirmNewTarget.addEventListener("click", (event) => {
  event.preventDefault();
  newTargetDialog.close("confirm");
  activateNewTarget();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    setStopwatch(pauseStopwatch(stopwatch, nowMs()));
    return;
  }

  if (
    stopwatch.hasStarted &&
    stopwatch.completedMs === null &&
    session.phase !== "solved"
  ) {
    resumeGameStopwatch();
    return;
  }
  renderStopwatch();
});

rebuildBoard();
render();

const initialSignalParam = new URLSearchParams(window.location.search).get("signal");
if (
  initialSignalParam !== null &&
  Number.isInteger(fixture.campaignSignal) &&
  initialSignalParam !== String(fixture.campaignSignal)
) {
  replaceRouteInUrl(fixture);
}

announceBoard("게임 시작");
