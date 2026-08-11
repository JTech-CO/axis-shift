const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const baseUrl = process.env.M00_BASE_URL || "http://127.0.0.1:4173/";
const screenshotPath =
  process.env.M00_SCREENSHOT ||
  path.resolve(
    __dirname,
    "../../AXIS_SHIFT_Harness_KR/evidence/M00/browser-smoke-stages-360x640.png",
  );

const STAGE_IDS = Object.freeze([
  "easy",
  "normal",
  "normal-5",
  "hard-4",
  "hard-5",
  "hard-6",
]);
let STAGES;
let BACKUP;
let FULL_RANK;

let assertionCount = 0;
let browser;

function check(value, message) {
  assert.ok(value, message);
  assertionCount += 1;
}

function equal(actual, expected, message) {
  assert.strictEqual(actual, expected, message);
  assertionCount += 1;
}

function deepEqual(actual, expected, message) {
  assert.deepStrictEqual(actual, expected, message);
  assertionCount += 1;
}

async function activate(page, locator) {
  await locator.focus();
  await page.keyboard.press("Enter");
}

async function selectMask(page, axis, mask) {
  const axisCount = await page.locator('.axis-button[data-axis="' + axis + '"]').count();
  for (let index = 0; index < axisCount; index += 1) {
    if (((mask >> index) & 1) === 1) {
      await activate(
        page,
        page.locator(
          '.axis-button[data-axis="' + axis + '"][data-index="' + index + '"]',
        ),
      );
    }
  }
}

async function pulse(page, expectedMoves) {
  const button = page.locator("#pulse-button");
  equal(await button.isEnabled(), true, "PULSE " + expectedMoves + " must be enabled");
  await activate(page, button);
  await page.waitForFunction(
    (moves) =>
      Number(document.querySelector("#move-count").textContent) === moves &&
      document.querySelector("#app").dataset.phase !== "pulsing",
    expectedMoves,
  );
}

async function solve(page, pulses) {
  for (let index = 0; index < pulses.length; index += 1) {
    await selectMask(page, "col", pulses[index].colMask);
    await selectMask(page, "row", pulses[index].rowMask);
    await pulse(page, index + 1);
  }
}

function stageButton(page, stageId) {
  return page.locator('.stage-button[data-stage="' + stageId + '"]');
}

async function waitForStage(page, stageId) {
  await page.waitForFunction(
    (expectedStage) =>
      document.querySelector("#app")?.dataset.stage === expectedStage &&
      !document.querySelector("#stage-dialog")?.open,
    stageId,
  );
}

async function expectCleanStage(page, stageId, context) {
  const stage = STAGES.get(stageId);
  equal(
    await page.locator("#app").getAttribute("data-stage"),
    stageId,
    context + ": app stage",
  );
  equal(
    await stageButton(page, stageId).getAttribute("aria-pressed"),
    "true",
    context + ": active stage button",
  );
  equal(
    await page.locator('.stage-button[aria-pressed="true"]').count(),
    1,
    context + ": exactly one active stage",
  );
  equal(
    await page.locator("#current-grid").getAttribute("data-rows"),
    stage.initialRows.join(","),
    context + ": initial board",
  );
  equal(
    await page.locator("#target-grid").getAttribute("data-initial-rows"),
    stage.initialRows.join(","),
    context + ": initial board validation surface",
  );
  equal(
    await page.locator("#target-grid").getAttribute("data-rows"),
    stage.targetRows.join(","),
    context + ": target validation surface",
  );
  equal(
    await page.locator("#app").getAttribute("data-board-size"),
    String(stage.size),
    context + ": app board size",
  );
  equal(
    await page.locator("#board-stage").getAttribute("data-size"),
    String(stage.size),
    context + ": board stage size",
  );
  equal(
    await page.locator('.axis-button[data-axis="col"]').count(),
    stage.size,
    context + ": column controls rebuilt",
  );
  equal(
    await page.locator('.axis-button[data-axis="row"]').count(),
    stage.size,
    context + ": row controls rebuilt",
  );
  equal(
    await page.locator(".current-cell").count(),
    stage.size * stage.size,
    context + ": current cells rebuilt",
  );
  equal(
    await page.locator(".target-cell").count(),
    stage.size * stage.size,
    context + ": target cells rebuilt",
  );
  const sizeLabel = stage.size + "행 " + stage.size + "열";
  check(
    (await page.locator("#target-grid").getAttribute("aria-label")).includes(sizeLabel),
    context + ": target accessible name includes board size",
  );
  check(
    (await page.locator("#current-grid").getAttribute("aria-label")).includes(sizeLabel),
    context + ": current accessible name includes board size",
  );
  equal(
    await page.locator('.axis-button[data-axis="row"] .axis-label').last().textContent(),
    String.fromCharCode(64 + stage.size),
    context + ": final row label",
  );
  equal(
    await page.locator("#move-count").textContent(),
    "0",
    context + ": move count reset",
  );
  equal(
    await page.locator('.axis-button[aria-pressed="true"]').count(),
    0,
    context + ": selection reset",
  );
  equal(
    await page.locator("#undo-button").isDisabled(),
    true,
    context + ": history isolated",
  );
  equal(
    await page.locator("#elapsed-time").textContent(),
    "00:00.0",
    context + ": timer reset",
  );
  equal(
    await page.locator("#app").getAttribute("data-timer-state"),
    "idle",
    context + ": timer idle",
  );
  equal(
    await page.locator("#app").getAttribute("data-generated"),
    "false",
    context + ": catalog target is not a generated route",
  );
  equal(
    await page.locator("#app").getAttribute("data-seed"),
    "",
    context + ": catalog target has no route seed",
  );
  equal(
    await page.locator("#app").getAttribute("data-seed-source"),
    "catalog",
    context + ": catalog seed source is explicit",
  );
  check(
    (await page.locator("#fixture-label").textContent()).includes(stage.label),
    context + ": visible " + stage.label + " label",
  );
  const mobileMetrics = await page.evaluate(() => {
    const sizes = [...document.querySelectorAll(".axis-button")].map((button) => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    const stageSizes = [...document.querySelectorAll(".stage-button")].map((button) => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    const board = document.querySelector("#board-stage").getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      boardLeft: board.left,
      boardRight: board.right,
      minimumAxisWidth: Math.min(...sizes.map((size) => size.width)),
      minimumAxisHeight: Math.min(...sizes.map((size) => size.height)),
      minimumStageWidth: Math.min(...stageSizes.map((size) => size.width)),
      minimumStageHeight: Math.min(...stageSizes.map((size) => size.height)),
    };
  });
  check(
    mobileMetrics.scrollWidth <= mobileMetrics.viewportWidth,
    context + ": no horizontal overflow",
  );
  check(
    mobileMetrics.boardLeft >= -0.5 && mobileMetrics.boardRight <= mobileMetrics.viewportWidth + 0.5,
    context + ": board stays inside viewport",
  );
  check(
    mobileMetrics.minimumAxisWidth >= 44 && mobileMetrics.minimumAxisHeight >= 44,
    context + ": axis targets stay at least 44px",
  );
  check(
    mobileMetrics.minimumStageWidth >= 44 && mobileMetrics.minimumStageHeight >= 44,
    context + ": stage targets stay at least 44px",
  );
}

async function expectSolvedStage(page, stageId) {
  const stage = STAGES.get(stageId);
  equal(
    await page.locator("#current-grid").getAttribute("data-rows"),
    stage.targetRows.join(","),
    stage.label + ": target reached",
  );
  equal(
    await page.locator("#app").getAttribute("data-phase"),
    "solved",
    stage.label + ": solved",
  );
  equal(
    await page.locator("#move-count").textContent(),
    String(stage.canonicalPulses.length),
    stage.label + ": canonical move count",
  );
  equal(
    await page.locator("#result-panel").isVisible(),
    true,
    stage.label + ": result visible",
  );
  await page.waitForFunction(() => document.activeElement?.id === "result-title");
  equal(
    await page.locator("#result-moves").textContent(),
    String(stage.canonicalPulses.length),
    stage.label + ": result move count",
  );
  equal(
    await page.locator("#result-guidance").isHidden(),
    true,
    stage.label + ": canonical solve does not trigger sweep guidance",
  );
  equal(
    await page.locator("#app").getAttribute("data-completion-kind"),
    "none",
    stage.label + ": canonical solve is classified as non-sweep",
  );
  equal(
    await page.locator("#app").getAttribute("data-timer-state"),
    "completed",
    stage.label + ": solve freezes timer",
  );
  check(
    /^\d+\.\d초$/.test(await page.locator("#result-time").textContent()),
    stage.label + ": result time uses tenths of a second",
  );
  const completedMs = Number(
    await page.locator("#app").getAttribute("data-elapsed-ms"),
  );
  await page.waitForTimeout(140);
  equal(
    Number(await page.locator("#app").getAttribute("data-elapsed-ms")),
    completedMs,
    stage.label + ": completed timer remains frozen",
  );
}

function columnSweepPulses(stage) {
  const moves = [];
  for (let col = 0; col < stage.size; col += 1) {
    let rowMask = 0;
    for (let row = 0; row < stage.size; row += 1) {
      const difference = stage.initialRows[row] ^ stage.targetRows[row];
      if (((difference >> col) & 1) === 1) rowMask |= 1 << row;
    }
    if (rowMask !== 0) moves.push({ rowMask, colMask: 1 << col });
  }
  return moves;
}

async function advanceWithNextCta(page, fromStageId, toStageId) {
  const button = page.locator("#next-stage-button");
  equal(await button.isVisible(), true, fromStageId + ": next-stage CTA visible");
  const buttonText = await button.textContent();
  if (STAGES.get(toStageId).stageNumber === 1) {
    check(buttonText.includes("다시 플레이"), fromStageId + ": CTA names catalog replay");
  } else {
    check(
      buttonText.includes(STAGES.get(toStageId).label),
      fromStageId + ": CTA names " + STAGES.get(toStageId).label,
    );
  }
  await activate(page, button);
  await waitForStage(page, toStageId);
  await page.waitForFunction(() => document.activeElement?.id === "stage-current");
  equal(
    new URL(page.url()).searchParams.get("stage"),
    toStageId,
    fromStageId + ": URL advances to " + toStageId,
  );
  await expectCleanStage(page, toStageId, fromStageId + " -> " + toStageId);
}

async function currentInteractionSnapshot(page) {
  return page.evaluate(() => ({
    stage: document.querySelector("#app").dataset.stage,
    seed: document.querySelector("#app").dataset.seed,
    puzzleKey: document.querySelector("#app").dataset.puzzleKey,
    targetRows: document.querySelector("#target-grid").dataset.rows,
    rows: document.querySelector("#current-grid").dataset.rows,
    moves: document.querySelector("#move-count").textContent,
    timerState: document.querySelector("#app").dataset.timerState,
    selectedAxes: [...document.querySelectorAll('.axis-button[aria-pressed="true"]')]
      .map((button) => button.dataset.axis + ":" + button.dataset.index)
      .sort(),
  }));
}

async function expectGeneratedFixture(page, expected, context) {
  equal(
    await page.locator("#app").getAttribute("data-stage"),
    expected.stageId,
    context + ": generated stage",
  );
  equal(
    await page.locator("#app").getAttribute("data-generated"),
    "true",
    context + ": generated marker",
  );
  equal(
    await page.locator("#app").getAttribute("data-seed"),
    expected.seed,
    context + ": normalized seed surface",
  );
  check(
    ["crypto", "fallback"].includes(
      await page.locator("#app").getAttribute("data-seed-source"),
    ),
    context + ": seed source surface",
  );
  equal(
    await page.locator("#app").getAttribute("data-puzzle-key"),
    expected.puzzleKey,
    context + ": puzzle key surface",
  );
  equal(
    await page.locator("#target-grid").getAttribute("data-rows"),
    expected.targetRows.join(","),
    context + ": generated target",
  );
  equal(
    await page.locator("#target-grid").getAttribute("data-initial-rows"),
    expected.initialRows.join(","),
    context + ": generated initial rows surface",
  );
  equal(
    await page.locator("#current-grid").getAttribute("data-rows"),
    expected.initialRows.join(","),
    context + ": generated initial board",
  );
  equal(
    new URL(page.url()).searchParams.get("seed"),
    expected.seed,
    context + ": URL seed",
  );
  equal(await page.locator("#move-count").textContent(), "0", context + ": fresh history");
  equal(await page.locator("#elapsed-time").textContent(), "00:00.0", context + ": fresh timer");
  equal(
    await page.locator("#app").getAttribute("data-timer-state"),
    "idle",
    context + ": timer idle",
  );
}

(async () => {
  const fixtureModule = await import(
    pathToFileURL(path.resolve(__dirname, "fixtures.mjs")).href
  );
  deepEqual(
    fixtureModule.STAGES.map((stage) => stage.stageId),
    STAGE_IDS,
    "six-stage order",
  );
  deepEqual(
    fixtureModule.STAGES.map((stage) => stage.size),
    [4, 4, 5, 4, 5, 6],
    "mixed board sizes",
  );
  deepEqual(
    fixtureModule.STAGES.map((stage) => stage.par),
    [2, 3, 3, 2, 3, 3],
    "canonical stage move counts",
  );
  STAGES = new Map(
    fixtureModule.STAGES.map((stage) => [stage.stageId, stage]),
  );
  BACKUP = fixtureModule.getFixture("M00-BACKUP-v1");
  FULL_RANK = fixtureModule.getStage("hard");
  equal(fixtureModule.getStage("hard").stageId, "full-rank", "legacy hard alias");
  equal(FULL_RANK.difficulty, "control", "Full Rank is a hidden control");
  equal(STAGES.get("hard-4").difficulty, "hard", "4x4 is reclassified Hard");
  equal(STAGES.get("hard-5").difficulty, "hard", "5x5 is playable Hard");
  equal(STAGES.get("hard-6").difficulty, "hard", "6x6 is playable Hard");
  check(
    STAGES.get("hard-4").initialRows.some((row) => row !== 0),
    "Hard 4x4 catalog starts from deterministic nonzero noise",
  );

  const launchOptions = { headless: true };
  if (process.env.BROWSER_EXECUTABLE) {
    launchOptions.executablePath = process.env.BROWSER_EXECUTABLE;
  }

  browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    viewport: { width: 360, height: 640 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push("pageerror: " + error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push("console: " + message.text());
    }
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  equal(await page.title(), "AXIS//SHIFT — Rule Proof", "document title");
  equal(await page.locator(".stage-button").count(), 6, "six playable stages");
  check(
    await page.locator(".stage-button").evaluateAll((buttons) =>
      buttons.every((button) => button.tagName === "BUTTON" && button.type === "button"),
    ),
    "stage choices are six actual buttons",
  );
  equal(
    await page.locator("#stage-buttons").getAttribute("role"),
    "group",
    "stage buttons use a group",
  );
  equal(
    await stageButton(page, "full-rank").count(),
    0,
    "Full Rank control is not a playable stage button",
  );
  await expectCleanStage(page, "easy", "initial load");
  equal(
    await page.locator("#stage-position").textContent(),
    "1 / 6",
    "initial stage position exposes six-stage catalog",
  );
  equal(
    await page.locator("#stage-position").getAttribute("aria-label"),
    "전체 6단계 중 1단계",
    "initial stage position accessible name exposes six stages",
  );
  equal(
    await page.locator(".briefing p").count(),
    1,
    "briefing uses one two-sentence paragraph",
  );
  equal(
    ((await page.locator(".briefing p").textContent()).match(/\./g) || []).length,
    2,
    "briefing has exactly two sentences",
  );
  equal(await page.locator("#pulse-button").isDisabled(), true, "PULSE starts disabled");
  equal(await page.locator(".current-cell").count(), 16, "board has 16 decorative cells");
  equal(await page.locator(".current-cell[tabindex]").count(), 0, "cells are not tab stops");
  equal(
    await page.locator("#current-grid").getAttribute("role"),
    "img",
    "current board uses summary image",
  );

  const mobileMetrics = await page.evaluate(() => {
    const visibleButtons = [...document.querySelectorAll("button")].filter((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const buttonSizes = visibleButtons.map((button) => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    const stageSizes = [...document.querySelectorAll(".stage-button")].map((button) => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      shellWidth: document.querySelector(".shell").getBoundingClientRect().width,
      minimumWidth: Math.min(...buttonSizes.map((size) => size.width)),
      minimumHeight: Math.min(...buttonSizes.map((size) => size.height)),
      stageSizes,
    };
  });
  check(mobileMetrics.scrollWidth <= mobileMetrics.viewportWidth, "360px has no horizontal scroll");
  check(mobileMetrics.shellWidth <= 328.5, "360px shell stays within 328px");
  check(mobileMetrics.minimumWidth >= 44, "visible controls are at least 44px wide");
  check(mobileMetrics.minimumHeight >= 44, "visible controls are at least 44px high");
  check(
    mobileMetrics.stageSizes.every((size) => size.width >= 44 && size.height >= 44),
    "all stage buttons are at least 44px square",
  );

  await page.evaluate(() => {
    document.body.tabIndex = -1;
    document.body.focus();
    document.body.removeAttribute("tabindex");
  });
  await page.keyboard.press("Tab");
  equal(
    await page.evaluate(() => document.activeElement?.getAttribute("href")),
    "#controls",
    "skip link is the first keyboard stop",
  );
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => window.location.hash === "#controls");
  const focusOrder = [];
  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press("Tab");
    focusOrder.push(
      await page.evaluate(() => {
        const element = document.activeElement;
        return element?.dataset.axis
          ? element.dataset.axis + ":" + element.dataset.index
          : element?.id;
      }),
    );
  }
  deepEqual(
    focusOrder,
    ["col:0", "col:1", "col:2", "col:3", "row:0", "row:1", "row:2", "row:3"],
    "skip link lands before the existing column-then-row order",
  );

  const rowA = page.locator('.axis-button[data-axis="row"][data-index="0"]');
  equal(
    await page.locator("#app").getAttribute("data-timer-state"),
    "idle",
    "timer waits for first axis selection",
  );
  await activate(page, rowA);
  await page.waitForTimeout(160);
  equal(
    await page.locator("#app").getAttribute("data-timer-state"),
    "running",
    "first axis selection starts timer",
  );
  const firstSelectionElapsed = Number(
    await page.locator("#app").getAttribute("data-elapsed-ms"),
  );
  check(firstSelectionElapsed >= 100, "running timer advances in tenths");
  equal(
    await page.locator("#pulse-button").isDisabled(),
    true,
    "row-only selection keeps PULSE disabled",
  );
  await activate(page, rowA);
  await page.waitForTimeout(130);
  check(
    Number(await page.locator("#app").getAttribute("data-elapsed-ms")) >
      firstSelectionElapsed,
    "timer continues after deselecting every axis",
  );

  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  equal(
    await page.locator("#app").getAttribute("data-timer-state"),
    "paused",
    "hidden document pauses timer",
  );
  const hiddenElapsed = Number(
    await page.locator("#app").getAttribute("data-elapsed-ms"),
  );
  await page.waitForTimeout(170);
  equal(
    Number(await page.locator("#app").getAttribute("data-elapsed-ms")),
    hiddenElapsed,
    "hidden time is excluded",
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(130);
  equal(
    await page.locator("#app").getAttribute("data-timer-state"),
    "running",
    "visible document resumes timer",
  );
  check(
    Number(await page.locator("#app").getAttribute("data-elapsed-ms")) >
      hiddenElapsed,
    "timer advances again after visibility resumes",
  );

  await selectMask(page, "col", 13);
  await selectMask(page, "row", 5);
  equal(
    await page.locator('.axis-button[aria-pressed="true"]').count(),
    5,
    "five selected axes exposed",
  );
  equal(
    await page.locator(".current-cell.preview-on").count(),
    6,
    "first preview shows six ON changes",
  );
  equal(
    await page.locator(".current-cell.preview-off").count(),
    0,
    "first preview has no OFF changes",
  );
  equal(await page.locator("#pulse-count").textContent(), "6 CELLS", "intersection count");
  await pulse(page, 1);
  equal(
    await page.locator("#current-grid").getAttribute("data-rows"),
    "13,0,13,0",
    "Easy first golden state",
  );
  equal(
    await page.locator('.axis-button[aria-pressed="true"]').count(),
    0,
    "selection clears after PULSE",
  );
  equal(
    await page.locator(".current-cell.preview-on,.current-cell.preview-off").count(),
    0,
    "preview clears",
  );

  await selectMask(page, "col", 6);
  await selectMask(page, "row", 11);
  equal(
    await page.locator(".current-cell.preview-on").count(),
    5,
    "second preview shows five ON changes",
  );
  equal(
    await page.locator(".current-cell.preview-off").count(),
    1,
    "second preview shows one OFF change",
  );
  equal(
    await page.locator(".current-cell.preview-off .preview-glyph").textContent(),
    "−",
    "OFF preview has a non-color minus glyph",
  );
  await pulse(page, 2);
  await expectSolvedStage(page, "easy");
  equal(
    await page.locator('.axis-button:not([disabled])').count(),
    0,
    "axis controls lock after solve",
  );
  check(
    (await page.locator("#board-status").textContent()).includes("목표와 다른 셀 0개"),
    "live status reports exact match",
  );

  const solvedElapsed = Number(
    await page.locator("#app").getAttribute("data-elapsed-ms"),
  );
  await activate(page, page.locator("#undo-button"));
  await page.waitForTimeout(140);
  equal(
    await page.locator("#current-grid").getAttribute("data-rows"),
    "13,0,13,0",
    "Undo restores Easy P0",
  );
  equal(await page.locator("#move-count").textContent(), "1", "Undo restores move count");
  equal(await page.locator("#result-panel").isHidden(), true, "Undo leaves result");
  equal(
    await page.locator("#app").getAttribute("data-timer-state"),
    "running",
    "Undo from solved resumes timer",
  );
  check(
    Number(await page.locator("#app").getAttribute("data-elapsed-ms")) >
      solvedElapsed,
    "resumed timer advances after Undo",
  );
  check(
    (await page.locator("#board-status").textContent()).startsWith("Undo 완료"),
    "Undo is announced",
  );

  await activate(page, page.locator("#reset-button"));
  equal(
    await page.locator("#reset-dialog").evaluate((dialog) => dialog.open),
    true,
    "Reset asks for confirmation",
  );
  await page.keyboard.press("Escape");
  equal(
    await page.locator("#reset-dialog").evaluate((dialog) => dialog.open),
    false,
    "Escape cancels reset",
  );
  equal(
    await page.locator("#current-grid").getAttribute("data-rows"),
    "13,0,13,0",
    "cancel preserves board",
  );
  await activate(page, page.locator("#reset-button"));
  await activate(page, page.locator("#confirm-reset"));
  await page.waitForFunction(
    (expectedRows) =>
      document.querySelector("#current-grid").dataset.rows === expectedRows,
    STAGES.get("easy").initialRows.join(","),
  );
  equal(await page.locator("#move-count").textContent(), "0", "Reset clears move count");
  equal(await page.locator("#elapsed-time").textContent(), "00:00.0", "Reset clears timer");
  equal(
    await page.locator("#app").getAttribute("data-timer-state"),
    "idle",
    "Reset returns timer to idle",
  );
  await page.waitForFunction(
    () =>
      document.activeElement?.dataset.axis === "col" &&
      document.activeElement?.dataset.index === "0",
  );
  check(
    (await page.locator("#board-status").textContent()).startsWith("Reset 완료"),
    "Reset is announced",
  );

  await selectMask(page, "col", 1);
  await selectMask(page, "row", 1);
  await page.locator("#pulse-button").evaluate((button) => {
    button.click();
    button.click();
  });
  await page.waitForFunction(
    () =>
      document.querySelector("#move-count").textContent === "1" &&
      document.querySelector("#app").dataset.phase === "ready",
  );
  equal(
    await page.locator("#current-grid").getAttribute("data-rows"),
    "1,0,0,0",
    "rapid duplicate commits once",
  );

  await selectMask(page, "col", 2);
  const beforeStageCancel = await currentInteractionSnapshot(page);
  const normalButton = stageButton(page, "normal");
  await activate(page, normalButton);
  equal(
    await page.locator("#stage-dialog").evaluate((dialog) => dialog.open),
    true,
    "progress opens stage dialog",
  );
  equal(
    await page.locator("#app").getAttribute("data-stage"),
    "easy",
    "dialog does not switch immediately",
  );
  await activate(page, page.locator("#cancel-stage-change"));
  await page.waitForFunction(() => !document.querySelector("#stage-dialog").open);
  deepEqual(
    await currentInteractionSnapshot(page),
    beforeStageCancel,
    "cancel preserves board, history, and selection",
  );
  await page.waitForFunction(
    () => document.activeElement?.matches('.stage-button[data-stage="normal"]'),
  );
  equal(
    await page.evaluate(() => document.activeElement?.dataset.stage),
    "normal",
    "cancel restores trigger focus",
  );

  await activate(page, normalButton);
  await activate(page, page.locator("#confirm-stage-change"));
  await waitForStage(page, "normal");
  await page.waitForFunction(
    () => document.activeElement?.matches('.stage-button[data-stage="normal"]'),
  );
  await expectCleanStage(page, "normal", "confirmed stage change");

  const stableSeed = "smoke-stable-seed";
  const stableFixture = fixtureModule.generateStageFixture("normal", stableSeed);
  await page.goto(
    new URL("?stage=normal&seed=" + encodeURIComponent(stableSeed), baseUrl).href,
    { waitUntil: "networkidle" },
  );
  await expectGeneratedFixture(page, stableFixture, "stable seed first load");
  const stableSnapshot = await currentInteractionSnapshot(page);
  await page.reload({ waitUntil: "networkidle" });
  await expectGeneratedFixture(page, stableFixture, "stable seed reload");
  deepEqual(
    await currentInteractionSnapshot(page),
    stableSnapshot,
    "same stage and seed reproduce the same puzzle",
  );

  const stableTargetRows = stableFixture.targetRows.join(",");
  await activate(page, page.locator("#new-target-button"));
  await page.waitForFunction(
    (previousSeed) =>
      document.querySelector("#app").dataset.seed !== previousSeed &&
      !document.querySelector("#new-target-dialog").open,
    stableFixture.seed,
  );
  const cleanSeed = new URL(page.url()).searchParams.get("seed");
  const cleanFixture = fixtureModule.generateStageFixture("normal", cleanSeed);
  await expectGeneratedFixture(page, cleanFixture, "clean new target");
  check(
    cleanFixture.targetRows.join(",") !== stableTargetRows,
    "clean new target differs from the immediately previous target",
  );
  await page.reload({ waitUntil: "networkidle" });
  await expectGeneratedFixture(page, cleanFixture, "clean target seed reload");

  await activate(
    page,
    page.locator('.axis-button[data-axis="row"][data-index="0"]'),
  );
  await page.waitForTimeout(120);
  const beforeNewTargetCancel = await currentInteractionSnapshot(page);
  await activate(page, page.locator("#new-target-button"));
  equal(
    await page.locator("#new-target-dialog").evaluate((dialog) => dialog.open),
    true,
    "progress opens new-target confirmation",
  );
  await activate(page, page.locator("#cancel-new-target"));
  await page.waitForFunction(() => !document.querySelector("#new-target-dialog").open);
  deepEqual(
    await currentInteractionSnapshot(page),
    beforeNewTargetCancel,
    "new-target cancel preserves target, board, history, selection, and timer state",
  );
  await page.waitForFunction(
    () => document.activeElement?.id === "new-target-button",
  );

  await activate(page, page.locator("#new-target-button"));
  await activate(page, page.locator("#confirm-new-target"));
  await page.waitForFunction(
    (previousSeed) =>
      document.querySelector("#app").dataset.seed !== previousSeed &&
      !document.querySelector("#new-target-dialog").open,
    cleanFixture.seed,
  );
  const confirmedSeed = new URL(page.url()).searchParams.get("seed");
  const confirmedFixture = fixtureModule.generateStageFixture(
    "normal",
    confirmedSeed,
  );
  await expectGeneratedFixture(page, confirmedFixture, "confirmed new target");
  check(
    confirmedFixture.targetRows.join(",") !== cleanFixture.targetRows.join(","),
    "confirmed new target differs from the immediately previous target",
  );
  await page.waitForFunction(
    () => document.activeElement?.id === "new-target-button",
  );

  await solve(page, confirmedFixture.canonicalPulses);
  equal(
    await page.locator("#current-grid").getAttribute("data-rows"),
    confirmedFixture.targetRows.join(","),
    "generated target solves from generated initial board",
  );
  equal(
    await page.locator("#app").getAttribute("data-phase"),
    "solved",
    "generated target reaches solved phase",
  );
  await page.waitForFunction(() => document.activeElement?.id === "result-title");
  const solvedGeneratedSeed = confirmedFixture.seed;
  const solvedGeneratedTarget = confirmedFixture.targetRows.join(",");
  await activate(page, page.locator("#new-target-button"));
  await page.waitForFunction(
    (previousSeed) =>
      document.querySelector("#app").dataset.seed !== previousSeed &&
      !document.querySelector("#new-target-dialog").open,
    solvedGeneratedSeed,
  );
  const solvedReplacementSeed = new URL(page.url()).searchParams.get("seed");
  const solvedReplacement = fixtureModule.generateStageFixture(
    "normal",
    solvedReplacementSeed,
  );
  await expectGeneratedFixture(page, solvedReplacement, "solved new target");
  check(
    solvedReplacement.targetRows.join(",") !== solvedGeneratedTarget,
    "solved new target differs without a confirmation dialog",
  );
  equal(
    await page.locator("#result-panel").isHidden(),
    true,
    "solved new target clears result panel",
  );

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const sweepMoves = columnSweepPulses(STAGES.get("easy"));
  check(sweepMoves.length >= 2, "synthetic column sweep has multiple moves");
  await solve(page, sweepMoves);
  equal(
    await page.locator("#current-grid").getAttribute("data-rows"),
    STAGES.get("easy").targetRows.join(","),
    "synthetic column sweep reaches target",
  );
  equal(
    await page.locator("#result-guidance").isVisible(),
    true,
    "synthetic column sweep shows guidance",
  );
  equal(
    await page.locator("#result-guidance").getAttribute("data-sweep-kind"),
    "column",
    "synthetic column sweep is classified as column",
  );
  equal(
    await page.locator("#app").getAttribute("data-completion-kind"),
    "column",
    "column sweep classification is exposed on app",
  );

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await expectCleanStage(page, "easy", "canonical chain start");
  await solve(page, STAGES.get("easy").canonicalPulses);
  await expectSolvedStage(page, "easy");
  await advanceWithNextCta(page, "easy", "normal");

  await solve(page, STAGES.get("normal").canonicalPulses);
  await expectSolvedStage(page, "normal");
  await advanceWithNextCta(page, "normal", "normal-5");

  await solve(page, STAGES.get("normal-5").canonicalPulses);
  await expectSolvedStage(page, "normal-5");
  await advanceWithNextCta(page, "normal-5", "hard-4");

  await solve(page, STAGES.get("hard-4").canonicalPulses);
  await expectSolvedStage(page, "hard-4");
  await advanceWithNextCta(page, "hard-4", "hard-5");

  await solve(page, STAGES.get("hard-5").canonicalPulses);
  await expectSolvedStage(page, "hard-5");
  await advanceWithNextCta(page, "hard-5", "hard-6");

  await solve(page, STAGES.get("hard-6").canonicalPulses);
  await expectSolvedStage(page, "hard-6");
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await page.locator("#stage-current").scrollIntoViewIfNeeded();
  await page.screenshot({ path: screenshotPath, animations: "disabled" });
  check(
    fs.existsSync(screenshotPath) && fs.statSync(screenshotPath).size > 0,
    "stage screenshot written",
  );
  await advanceWithNextCta(page, "hard-6", "easy");
  equal(
    await page.locator("#result-panel").isHidden(),
    true,
    "6x6-to-Easy wrap leaves solved result",
  );

  await page.goto(new URL("?stage=hard", baseUrl).href, { waitUntil: "networkidle" });
  equal(
    await page.locator("#app").getAttribute("data-stage"),
    "full-rank",
    "legacy hard alias resolves to Full Rank control",
  );
  equal(
    await page.locator("#current-grid").getAttribute("data-rows"),
    FULL_RANK.initialRows.join(","),
    "Full Rank control uses fixture initial board",
  );
  equal(
    await page.locator("#target-grid").getAttribute("data-rows"),
    FULL_RANK.targetRows.join(","),
    "Full Rank control target remains addressable",
  );
  equal(
    await page.locator('.stage-button[aria-pressed="true"]').count(),
    0,
    "hidden Full Rank control does not select a playable stage button",
  );
  equal(
    await page.locator("#new-target-button").isDisabled(),
    true,
    "hidden Full Rank control cannot generate catalog targets",
  );
  equal(
    await page.locator("#app").getAttribute("data-timer-state"),
    "idle",
    "Full Rank control timer starts idle",
  );
  equal(
    new URL(page.url()).searchParams.get("stage"),
    "hard",
    "legacy hard query remains addressable",
  );
  check(
    (await page.locator("#stage-current").textContent()).includes(FULL_RANK.title),
    "legacy hard route identifies the Full Rank control",
  );

  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(new URL("?stage=hard-6", baseUrl).href, { waitUntil: "networkidle" });
  await expectCleanStage(page, "hard-6", "320px 6x6 route");
  await page.setViewportSize({ width: 360, height: 640 });

  await page.goto(new URL("?fixture=backup", baseUrl).href, {
    waitUntil: "networkidle",
  });
  equal(
    await page.locator("#fixture-label").textContent(),
    "TEST · 예비",
    "backup fixture route remains compatible",
  );
  await solve(page, BACKUP.canonicalPulses);
  equal(
    await page.locator("#current-grid").getAttribute("data-rows"),
    BACKUP.targetRows.join(","),
    "backup target reached",
  );
  equal(
    await page.locator("#app").getAttribute("data-phase"),
    "solved",
    "backup solved in three moves",
  );

  await page.setViewportSize({ width: 960, height: 900 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const desktopMetrics = await page.evaluate(() => {
    const target = document.querySelector(".target-card").getBoundingClientRect();
    const consolePanel = document.querySelector(".console").getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      targetLeft: target.left,
      consoleLeft: consolePanel.left,
    };
  });
  check(
    desktopMetrics.scrollWidth <= desktopMetrics.viewportWidth,
    "desktop has no horizontal scroll",
  );
  check(
    desktopMetrics.targetLeft < desktopMetrics.consoleLeft,
    "desktop uses two-column layout",
  );

  const fallbackContext = await browser.newContext({
    viewport: { width: 360, height: 640 },
    reducedMotion: "reduce",
  });
  await fallbackContext.addInitScript(() => {
    Object.defineProperty(globalThis.crypto, "getRandomValues", {
      configurable: true,
      value: undefined,
    });
  });
  const fallbackPage = await fallbackContext.newPage();
  fallbackPage.on("pageerror", (error) =>
    browserErrors.push("fallback pageerror: " + error.message),
  );
  fallbackPage.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push("fallback console: " + message.text());
    }
  });
  await fallbackPage.goto(baseUrl, { waitUntil: "networkidle" });
  equal(
    await fallbackPage.locator("#new-target-button").isEnabled(),
    true,
    "new target remains available without crypto.getRandomValues",
  );
  const fallbackPreviousTarget = await fallbackPage
    .locator("#target-grid")
    .getAttribute("data-rows");
  await activate(fallbackPage, fallbackPage.locator("#new-target-button"));
  await fallbackPage.waitForFunction(
    () => document.querySelector("#app").dataset.seedSource === "fallback",
  );
  const fallbackSeed = new URL(fallbackPage.url()).searchParams.get("seed");
  check(
    fallbackSeed.startsWith("fallback-"),
    "fallback seed is explicit in the URL",
  );
  const fallbackTarget = await fallbackPage
    .locator("#target-grid")
    .getAttribute("data-rows");
  check(
    fallbackTarget !== fallbackPreviousTarget,
    "fallback seed generates a different target",
  );
  const fallbackPuzzleKey = await fallbackPage
    .locator("#app")
    .getAttribute("data-puzzle-key");
  const fallbackInitialRows = await fallbackPage
    .locator("#target-grid")
    .getAttribute("data-initial-rows");
  await fallbackPage.reload({ waitUntil: "networkidle" });
  equal(
    await fallbackPage.locator("#app").getAttribute("data-seed-source"),
    "fallback",
    "fallback source survives reload",
  );
  equal(
    await fallbackPage.locator("#target-grid").getAttribute("data-rows"),
    fallbackTarget,
    "fallback target reproduces from URL seed",
  );
  equal(
    await fallbackPage.locator("#target-grid").getAttribute("data-initial-rows"),
    fallbackInitialRows,
    "fallback initial board reproduces from URL seed",
  );
  equal(
    await fallbackPage.locator("#app").getAttribute("data-puzzle-key"),
    fallbackPuzzleKey,
    "fallback puzzle key reproduces from URL seed",
  );
  await fallbackContext.close();

  equal(browserErrors.length, 0, "browser errors: " + browserErrors.join(" | "));

  await browser.close();
  console.log(
    "browserAssertions=" +
      assertionCount +
      " viewport=320/360/960 easyMoves=2 normal4Moves=3 normal5Moves=3" +
      " hard4Moves=2 hard5Moves=3 hard6Moves=3 backupMoves=3" +
      " timer=visibility-safe newTarget=crypto+fallback sweepGuidance=column" +
      " consoleErrors=0 screenshot=" +
      screenshotPath,
  );
})().catch(async (error) => {
  if (browser) await browser.close();
  console.error(error.stack || error);
  process.exitCode = 1;
});
