import { STAGES, getFixture, getNextStage, getStage } from "./fixtures.mjs";
import {
  beginPulse,
  commitPulse,
  createSession,
  resetSession,
  toggleCol,
  toggleRow,
  undoSession,
} from "./session.mjs";

const ROW_LABELS = ["A", "B", "C", "D"];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function requiredElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element #${id}`);
  return element;
}

function requestedFixture() {
  const params = new URLSearchParams(window.location.search);
  const requestedStage = params.get("stage");
  if (requestedStage) {
    try {
      return getStage(requestedStage.toLowerCase());
    } catch {
      // Continue to the legacy fixture route before falling back to Easy.
    }
  }

  const value = params.get("fixture");
  if (!value || value.toLowerCase() === "main") return getStage("easy");
  if (value.toLowerCase() === "backup") return getFixture("M00-BACKUP-v1");

  try {
    return getStage(value.toLowerCase());
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
let pulseTimer = null;
let pendingStageId = null;

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
const selectionSummary = requiredElement("selection-summary");
const pulseButton = requiredElement("pulse-button");
const pulseCount = requiredElement("pulse-count");
const pulseStatus = requiredElement("pulse-status");
const undoButton = requiredElement("undo-button");
const resetButton = requiredElement("reset-button");
const resultPanel = requiredElement("result-panel");
const resultTitle = requiredElement("result-title");
const resultMoves = requiredElement("result-moves");
const nextStageButton = requiredElement("next-stage-button");
const resetDialog = requiredElement("reset-dialog");
const confirmReset = requiredElement("confirm-reset");
const stageDialog = requiredElement("stage-dialog");
const stageDialogTarget = requiredElement("stage-dialog-target");
const cancelStageChange = requiredElement("cancel-stage-change");
const confirmStageChange = requiredElement("confirm-stage-change");

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

function nextStage() {
  const current = activeStage();
  return current ? getNextStage(current.stageId) : getStage("easy");
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
  currentGrid.setAttribute("aria-label", `현재 신호. ${description}`);
  boardStatus.textContent = `${action}. 현재 신호는 ${description}. 목표와 다른 셀 ${remaining}개.`;
}

function createTargetGrid() {
  targetGrid.replaceChildren();
  targetGrid.dataset.rows = fixture.targetRows.join(",");
  targetGrid.setAttribute("aria-label", `목표 신호. ${targetDescription(fixture.targetRows)}`);

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
    session = kind === "row" ? toggleRow(session, index) : toggleCol(session, index);
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

const colButtons = Array.from({ length: fixture.size }, (_, index) =>
  createAxisButton("col", index, String(index + 1)),
);
const rowButtons = Array.from({ length: fixture.size }, (_, index) =>
  createAxisButton("row", index, ROW_LABELS[index]),
);
colRail.append(...colButtons);
rowRail.append(...rowButtons);

const boardCells = Array.from({ length: fixture.size }, (_, row) =>
  Array.from({ length: fixture.size }, (_, col) => {
    const cell = document.createElement("div");
    cell.className = "current-cell";
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

const stageButtons = STAGES.map(createStageButton);
stageButtonsContainer.append(...stageButtons);

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
  const next = nextStage();

  fixtureLabel.textContent = current
    ? `STAGE ${String(current.stageNumber).padStart(2, "0")} · ${current.label}`
    : `TEST · ${fixture.label}`;
  app.dataset.fixture = fixture.id;
  app.dataset.stage = fixture.stageId;
  goalChip.textContent = `PAR ${fixture.par}`;

  if (current) {
    stageCurrent.textContent = `${current.stageNumber}단계 · ${current.label} — ${current.title}`;
    stagePosition.textContent = `${current.stageNumber} / ${STAGES.length}`;
    stagePosition.setAttribute(
      "aria-label",
      `전체 ${STAGES.length}단계 중 ${current.stageNumber}단계`,
    );
    resultTitle.textContent = `${current.label} 패턴 일치`;
    nextStageButton.textContent =
      next.stageNumber === 1 ? "쉬움부터 다시 플레이" : `다음 단계 · ${next.label}`;
  } else {
    stageCurrent.textContent = `검증 fixture · ${fixture.label} — ${fixture.title}`;
    stagePosition.textContent = "TEST";
    stagePosition.setAttribute("aria-label", "회귀 검증 fixture");
    resultTitle.textContent = "패턴 일치";
    nextStageButton.textContent = "쉬움부터 플레이";
  }

  nextStageButton.dataset.stage = next.stageId;
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

      cell.dataset.on = String(on);
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
    session.phase === "solved";

  app.dataset.phase = session.phase;
  boardStage.dataset.phase = session.phase;
  currentGrid.dataset.rows = session.currentRows.join(",");
  currentGrid.setAttribute("aria-label", `현재 신호. ${targetDescription(session.currentRows)}`);
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

  const solved = session.phase === "solved";
  resultPanel.hidden = !solved;
  resultMoves.textContent = String(session.moves.length);
  nextStageButton.disabled = !solved;
}

function hasUnfinishedProgress() {
  return (
    session.phase !== "solved" &&
    (session.moves.length > 0 ||
      session.rowMask !== 0 ||
      session.colMask !== 0 ||
      session.pendingMove !== null)
  );
}

function replaceStageInUrl(stageId) {
  const url = new URL(window.location.href);
  url.searchParams.delete("fixture");
  url.searchParams.set("stage", stageId);
  window.history.replaceState({}, "", url);
}

function activateStage(stageId, { focus = "button" } = {}) {
  const nextFixture = getStage(stageId);
  if (
    nextFixture.size !== rowButtons.length ||
    nextFixture.size !== colButtons.length ||
    nextFixture.size !== boardCells.length
  ) {
    throw new RangeError("M00 stage transition requires a shared board size");
  }

  if (pulseTimer !== null) {
    window.clearTimeout(pulseTimer);
    pulseTimer = null;
  }

  fixture = nextFixture;
  session = createSession(fixture);
  pendingStageId = null;
  createTargetGrid();
  render();
  replaceStageInUrl(stageId);

  const startMessage = `${fixture.stageNumber}단계 ${fixture.label} 시작`;
  stageStatus.textContent = `${startMessage}. ${fixture.title}. 이동 기록과 선택이 초기화되었습니다.`;
  announceBoard(startMessage);

  window.requestAnimationFrame(() => {
    if (focus === "heading") {
      stageCurrent.focus();
      return;
    }
    stageButtons.find((button) => button.dataset.stage === stageId)?.focus();
  });
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

  const duration = prefersReducedMotion.matches ? 0 : 240;
  pulseTimer = window.setTimeout(() => {
    session = commitPulse(session);
    pulseTimer = null;
    render();
    announceBoard(session.phase === "solved" ? "PULSE 완료. 목표와 일치했습니다" : "PULSE 완료");
    if (session.phase === "solved") {
      window.requestAnimationFrame(() => resultTitle.focus());
    }
  }, duration);
});

undoButton.addEventListener("click", () => {
  session = undoSession(session);
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
  activateStage(nextStage().stageId, { focus: "heading" });
});

createTargetGrid();
render();
announceBoard("게임 시작");
