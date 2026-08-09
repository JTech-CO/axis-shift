const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.M00_BASE_URL || "http://127.0.0.1:4173/";
const screenshotPath =
  process.env.M00_SCREENSHOT ||
  path.resolve(
    __dirname,
    "../../AXIS_SHIFT_Harness_KR/evidence/M00/browser-smoke-stages-360x640.png",
  );

const STAGES = Object.freeze({
  easy: Object.freeze({
    label: "쉬움",
    targetRows: "11,6,13,6",
    pulses: Object.freeze([
      Object.freeze({ rowMask: 5, colMask: 13 }),
      Object.freeze({ rowMask: 11, colMask: 6 }),
    ]),
  }),
  normal: Object.freeze({
    label: "보통",
    targetRows: "5,9,6,3",
    pulses: Object.freeze([
      Object.freeze({ rowMask: 11, colMask: 9 }),
      Object.freeze({ rowMask: 12, colMask: 10 }),
      Object.freeze({ rowMask: 5, colMask: 12 }),
    ]),
  }),
  hard: Object.freeze({
    label: "어려움",
    targetRows: "6,9,10,13",
    pulses: Object.freeze([
      Object.freeze({ rowMask: 10, colMask: 1 }),
      Object.freeze({ rowMask: 5, colMask: 2 }),
      Object.freeze({ rowMask: 9, colMask: 4 }),
      Object.freeze({ rowMask: 14, colMask: 8 }),
    ]),
  }),
});

const BACKUP = Object.freeze({
  targetRows: "15,6,5,10",
  pulses: Object.freeze([
    Object.freeze({ rowMask: 5, colMask: 9 }),
    Object.freeze({ rowMask: 11, colMask: 10 }),
    Object.freeze({ rowMask: 7, colMask: 12 }),
  ]),
});

let assertionCount = 0;

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
  for (let index = 0; index < 4; index += 1) {
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
  const stage = STAGES[stageId];
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
    "0,0,0,0",
    context + ": initial board",
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
  check(
    (await page.locator("#fixture-label").textContent()).includes(stage.label),
    context + ": visible " + stage.label + " label",
  );
}

async function expectSolvedStage(page, stageId) {
  const stage = STAGES[stageId];
  equal(
    await page.locator("#current-grid").getAttribute("data-rows"),
    stage.targetRows,
    stage.label + ": target reached",
  );
  equal(
    await page.locator("#app").getAttribute("data-phase"),
    "solved",
    stage.label + ": solved",
  );
  equal(
    await page.locator("#move-count").textContent(),
    String(stage.pulses.length),
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
    String(stage.pulses.length),
    stage.label + ": result move count",
  );
}

async function advanceWithNextCta(page, fromStageId, toStageId) {
  const button = page.locator("#next-stage-button");
  equal(await button.isVisible(), true, fromStageId + ": next-stage CTA visible");
  check(
    (await button.textContent()).includes(STAGES[toStageId].label),
    fromStageId + ": CTA names " + STAGES[toStageId].label,
  );
  await activate(page, button);
  await waitForStage(page, toStageId);
  await page.waitForFunction(() => document.activeElement?.id === "stage-current");
  await expectCleanStage(page, toStageId, fromStageId + " -> " + toStageId);
}

async function currentInteractionSnapshot(page) {
  return page.evaluate(() => ({
    stage: document.querySelector("#app").dataset.stage,
    rows: document.querySelector("#current-grid").dataset.rows,
    moves: document.querySelector("#move-count").textContent,
    selectedAxes: [...document.querySelectorAll('.axis-button[aria-pressed="true"]')]
      .map((button) => button.dataset.axis + ":" + button.dataset.index)
      .sort(),
  }));
}

(async () => {
  const launchOptions = { headless: true };
  if (process.env.BROWSER_EXECUTABLE) {
    launchOptions.executablePath = process.env.BROWSER_EXECUTABLE;
  }

  const browser = await chromium.launch(launchOptions);
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
  equal(await page.locator(".stage-button").count(), 3, "three playable stages");
  check(
    await page.locator(".stage-button").evaluateAll((buttons) =>
      buttons.every((button) => button.tagName === "BUTTON" && button.type === "button"),
    ),
    "stage choices are three actual buttons",
  );
  equal(
    await page.locator("#stage-buttons").getAttribute("role"),
    "group",
    "stage buttons use a group",
  );
  await expectCleanStage(page, "easy", "initial load");
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
  await activate(page, rowA);
  equal(
    await page.locator("#pulse-button").isDisabled(),
    true,
    "row-only selection keeps PULSE disabled",
  );
  await activate(page, rowA);

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

  await activate(page, page.locator("#undo-button"));
  equal(
    await page.locator("#current-grid").getAttribute("data-rows"),
    "13,0,13,0",
    "Undo restores Easy P0",
  );
  equal(await page.locator("#move-count").textContent(), "1", "Undo restores move count");
  equal(await page.locator("#result-panel").isHidden(), true, "Undo leaves result");
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
    () => document.querySelector("#current-grid").dataset.rows === "0,0,0,0",
  );
  equal(await page.locator("#move-count").textContent(), "0", "Reset clears move count");
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

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await expectCleanStage(page, "easy", "canonical chain start");
  await solve(page, STAGES.easy.pulses);
  await expectSolvedStage(page, "easy");
  await advanceWithNextCta(page, "easy", "normal");

  await solve(page, STAGES.normal.pulses);
  await expectSolvedStage(page, "normal");
  await advanceWithNextCta(page, "normal", "hard");

  await solve(page, STAGES.hard.pulses);
  await expectSolvedStage(page, "hard");
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  await page.locator("#stage-current").scrollIntoViewIfNeeded();
  await page.screenshot({ path: screenshotPath, animations: "disabled" });
  check(
    fs.existsSync(screenshotPath) && fs.statSync(screenshotPath).size > 0,
    "stage screenshot written",
  );
  await advanceWithNextCta(page, "hard", "easy");
  equal(
    await page.locator("#result-panel").isHidden(),
    true,
    "Hard-to-Easy wrap leaves solved result",
  );

  await page.goto(new URL("?fixture=backup", baseUrl).href, {
    waitUntil: "networkidle",
  });
  equal(
    await page.locator("#fixture-label").textContent(),
    "TEST · 예비",
    "backup fixture route remains compatible",
  );
  await solve(page, BACKUP.pulses);
  equal(
    await page.locator("#current-grid").getAttribute("data-rows"),
    BACKUP.targetRows,
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
  equal(browserErrors.length, 0, "browser errors: " + browserErrors.join(" | "));

  await browser.close();
  console.log(
    "browserAssertions=" +
      assertionCount +
      " viewport=360x640 easyMoves=2 normalMoves=3 hardMoves=4 backupMoves=3" +
      " consoleErrors=0 screenshot=" +
      screenshotPath,
  );
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
