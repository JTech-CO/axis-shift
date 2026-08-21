import assert from "node:assert/strict";

import { boardsEqual, composePulses } from "./core.mjs";
import { analyzeDifficulty } from "./difficulty.mjs";
import {
  CAMPAIGN_SIGNAL_COUNT,
  CAMPAIGN_SIGNALS,
  CAMPAIGN_SIGNALS_PER_STAGE,
  STAGES,
  getCampaignSignal,
  getNextCampaignSignal,
} from "./fixtures.mjs";

let assertions = 0;

function equal(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}

function same(actual, expected, message) {
  assert.strictEqual(actual, expected, message);
  assertions += 1;
}

function truthy(actual, message) {
  assert.ok(actual, message);
  assertions += 1;
}

function throws(action, message) {
  assert.throws(action, message);
  assertions += 1;
}

same(CAMPAIGN_SIGNALS_PER_STAGE, 3, "each stage exposes three fixed signals");
same(CAMPAIGN_SIGNAL_COUNT, 18, "campaign exposes eighteen fixed signals");
same(CAMPAIGN_SIGNALS.length, CAMPAIGN_SIGNAL_COUNT, "campaign count matches catalog");
truthy(Object.isFrozen(CAMPAIGN_SIGNALS), "campaign catalog is immutable");

const globalKeys = new Set();
for (const stage of STAGES) {
  const signals = CAMPAIGN_SIGNALS.filter(
    (candidate) => candidate.stageId === stage.stageId,
  );
  same(signals.length, CAMPAIGN_SIGNALS_PER_STAGE, `${stage.stageId}: signal count`);
  same(signals[0], stage, `${stage.stageId}: existing M00 fixture remains signal 1`);
  same(
    new Set(signals.map((signal) => signal.targetRows.join(","))).size,
    CAMPAIGN_SIGNALS_PER_STAGE,
    `${stage.stageId}: fixed targets are pairwise distinct`,
  );

  for (const [index, signal] of signals.entries()) {
    const signalNumber = index + 1;
    const expectedPosition =
      (stage.stageNumber - 1) * CAMPAIGN_SIGNALS_PER_STAGE + signalNumber;
    truthy(Object.isFrozen(signal), `${stage.stageId}/${signalNumber}: fixture immutable`);
    same(signal.campaignSignal, signalNumber, `${stage.stageId}/${signalNumber}: signal number`);
    same(
      signal.campaignPosition,
      expectedPosition,
      `${stage.stageId}/${signalNumber}: campaign position`,
    );
    same(
      signal.campaignCount,
      CAMPAIGN_SIGNAL_COUNT,
      `${stage.stageId}/${signalNumber}: campaign count`,
    );
    same(
      getCampaignSignal(stage.stageId, signalNumber),
      signal,
      `${stage.stageId}/${signalNumber}: deterministic lookup`,
    );
    same(
      signal.canonicalPulses.length,
      signal.par,
      `${stage.stageId}/${signalNumber}: canonical length equals Par`,
    );
    truthy(
      boardsEqual(
        composePulses(signal.initialRows, signal.size, signal.canonicalPulses),
        signal.targetRows,
        signal.size,
      ),
      `${stage.stageId}/${signalNumber}: canonical pulses reach target`,
    );

    const difficulty = analyzeDifficulty(signal);
    truthy(difficulty.parMatchesRank, `${stage.stageId}/${signalNumber}: Par equals rank`);
    if (signal.difficulty === "hard") {
      truthy(
        difficulty.hardCandidatePassed,
        `${stage.stageId}/${signalNumber}: Hard anti-sweep gate`,
      );
    }

    const key = `${signal.size}:${signal.initialRows.join(",")}:${signal.targetRows.join(",")}`;
    truthy(!globalKeys.has(key), `${stage.stageId}/${signalNumber}: campaign board pair unique`);
    globalKeys.add(key);

    const globalIndex = CAMPAIGN_SIGNALS.indexOf(signal);
    same(
      getNextCampaignSignal(stage.stageId, signalNumber),
      CAMPAIGN_SIGNALS[(globalIndex + 1) % CAMPAIGN_SIGNAL_COUNT],
      `${stage.stageId}/${signalNumber}: next signal follows catalog order`,
    );
  }
}

same(globalKeys.size, CAMPAIGN_SIGNAL_COUNT, "all campaign board pairs are unique");
same(
  getNextCampaignSignal("hard-6", 3),
  getCampaignSignal("easy", 1),
  "campaign wraps from signal 18 to signal 1",
);
throws(() => getCampaignSignal("easy", 0), "signal zero is rejected");
throws(() => getCampaignSignal("easy", 4), "signal four is rejected");
throws(() => getCampaignSignal("easy", 1.5), "fractional signal is rejected");
throws(() => getCampaignSignal("full-rank", 1), "control fixture is not a campaign stage");

console.log(
  `campaignSignals=${CAMPAIGN_SIGNAL_COUNT} signalsPerStage=${CAMPAIGN_SIGNALS_PER_STAGE} uniqueBoardPairs=${globalKeys.size} assertions=${assertions} failures=0`,
);
