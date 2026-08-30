import { describe, expect, it } from 'vitest';

import { LAB_LEVELS, TUTORIAL_LEVELS } from '../../content';
import {
  createGameSessionState,
  gameSessionReducer,
  type EncodedPulse,
  type GameSessionState,
} from '../../domain';
import {
  createTutorialStepViewModel,
  selectCanAdvanceTutorial,
  selectTutorialAdvanceTarget,
  selectTutorialLearningGoalSatisfied,
  selectTutorialProgressEffect,
  selectTutorialSolved,
  TUTORIAL_BROWSER_HISTORY_POLICY,
  TUTORIAL_LEARNING_SELECTORS,
  TUTORIAL_SKIP_TARGET,
  TUTORIAL_STEP_COUNT,
  TUTORIAL_STEPS,
  tutorialBackTarget,
  tutorialStepAt,
  tutorialStepForLevelId,
} from './tutorial-policy';

function stateAt(index: number): GameSessionState {
  const level = TUTORIAL_LEVELS[index];
  if (!level) throw new Error(`Missing Tutorial level ${String(index)}.`);
  return createGameSessionState(level, `tutorial-attempt-${String(index)}`);
}

function selectMask(
  state: GameSessionState,
  axis: 'column' | 'row',
  mask: number,
  nowEpochMs: number,
): GameSessionState {
  let selected = state;
  for (let index = 0; index < state.puzzle.size; index += 1) {
    if ((mask & (1 << index)) === 0) continue;
    selected = gameSessionReducer(selected, {
      type: axis === 'row' ? 'TOGGLE_ROW' : 'TOGGLE_COL',
      index,
      nowEpochMs,
    });
  }
  return selected;
}

function commitPulse(
  state: GameSessionState,
  pulse: EncodedPulse,
  actionId: string,
  nowEpochMs: number,
): GameSessionState {
  const selectedRows = selectMask(state, 'row', pulse.rowMask, nowEpochMs);
  const selectedAxes = selectMask(selectedRows, 'column', pulse.colMask, nowEpochMs);
  return gameSessionReducer(selectedAxes, { actionId, nowEpochMs, type: 'PULSE_COMMIT' });
}

function finishPulse(state: GameSessionState, actionId: string): GameSessionState {
  return gameSessionReducer(state, { actionId, type: 'PULSE_ANIMATION_FINISHED' });
}

function solveAt(index: number): GameSessionState {
  const initial = stateAt(index);
  const solution = initial.puzzle.canonicalSolution;
  if (!solution) throw new Error(`${initial.puzzle.id} has no canonical solution.`);

  return solution.reduce((state, pulse, pulseIndex) => {
    const actionId = `solve-${String(index)}-${String(pulseIndex)}`;
    return finishPulse(commitPulse(state, pulse, actionId, 100 + pulseIndex), actionId);
  }, initial);
}

function replaceSession(
  state: GameSessionState,
  session: Partial<GameSessionState['session']>,
): GameSessionState {
  return { ...state, session: { ...state.session, ...session } };
}

describe('Tutorial data order and policy', () => {
  it('derives exactly six frozen steps from the approved content order', () => {
    expect(TUTORIAL_STEP_COUNT).toBe(6);
    expect(TUTORIAL_STEPS.map((step) => step.level)).toEqual(TUTORIAL_LEVELS);
    expect(TUTORIAL_STEPS.map((step) => step.index)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(TUTORIAL_STEPS.map((step) => step.stepId)).toEqual([
      'tutorial.select-row',
      'tutorial.select-column',
      'tutorial.preview-intersection',
      'tutorial.execute-pulse',
      'tutorial.select-multiple-axes',
      'tutorial.observe-echo',
    ]);
    expect(Object.isFrozen(TUTORIAL_STEPS)).toBe(true);
    expect(TUTORIAL_STEPS.every(Object.isFrozen)).toBe(true);
    expect(Object.keys(TUTORIAL_LEARNING_SELECTORS)).toHaveLength(6);
    expect(tutorialStepAt(6)).toBeUndefined();
    expect(tutorialStepAt(1.5)).toBeUndefined();
    expect(tutorialStepForLevelId('unknown')).toBeUndefined();
  });

  it('acknowledges Skip without writing an unresolved level record', () => {
    expect(TUTORIAL_SKIP_TARGET).toEqual({
      history: 'push',
      kind: 'lab-index',
      levelId: null,
      progressEffect: 'acknowledge',
      route: '/lab',
      sessionPolicy: 'clear',
      stepIndex: null,
      writeLevelRecord: false,
    });
    expect(TUTORIAL_BROWSER_HISTORY_POLICY).toBe('allow');
    expect(Object.isFrozen(TUTORIAL_SKIP_TARGET)).toBe(true);
  });

  it('sends Back from step one home and other steps to a fresh previous attempt', () => {
    expect(tutorialBackTarget(TUTORIAL_LEVELS[0]?.id ?? '')).toMatchObject({
      kind: 'home',
      route: '/',
      sessionPolicy: 'preserve',
    });
    for (let index = 1; index < TUTORIAL_STEP_COUNT; index += 1) {
      const current = TUTORIAL_LEVELS[index];
      const previous = TUTORIAL_LEVELS[index - 1];
      expect(tutorialBackTarget(current?.id ?? '')).toMatchObject({
        history: 'push',
        kind: 'tutorial-step',
        levelId: previous?.id,
        progressEffect: 'unchanged',
        route: '/tutorial',
        sessionPolicy: 'new-attempt',
        stepIndex: index - 1,
        writeLevelRecord: false,
      });
    }
    expect(tutorialBackTarget('not-a-tutorial')).toBeUndefined();
  });
});

describe('Tutorial learning selectors', () => {
  it('requires row-selection experience from a current selection or accepted move', () => {
    const initial = stateAt(0);
    expect(selectTutorialLearningGoalSatisfied(initial)).toBe(false);
    const selected = selectMask(initial, 'row', 0b010, 10);
    expect(selectTutorialLearningGoalSatisfied(selected)).toBe(true);
    expect(selectTutorialLearningGoalSatisfied(solveAt(0))).toBe(true);
  });

  it('requires column-selection experience from a current selection or accepted move', () => {
    const initial = stateAt(1);
    expect(selectTutorialLearningGoalSatisfied(initial)).toBe(false);
    const selected = selectMask(initial, 'column', 0b010, 10);
    expect(selectTutorialLearningGoalSatisfied(selected)).toBe(true);
    expect(selectTutorialLearningGoalSatisfied(solveAt(1))).toBe(true);
  });

  it('requires both axes at once for preview, while an accepted move preserves proof', () => {
    const initial = stateAt(2);
    const rowsOnly = selectMask(initial, 'row', 0b001, 10);
    const columnsOnly = selectMask(initial, 'column', 0b010, 10);
    expect(selectTutorialLearningGoalSatisfied(rowsOnly)).toBe(false);
    expect(selectTutorialLearningGoalSatisfied(columnsOnly)).toBe(false);
    expect(selectTutorialLearningGoalSatisfied(selectMask(rowsOnly, 'column', 0b010, 10))).toBe(
      true,
    );
    expect(selectTutorialLearningGoalSatisfied(solveAt(2))).toBe(true);
  });

  it('uses the append-only accepted ledger for PULSE experience even after Undo', () => {
    const initial = stateAt(3);
    expect(selectTutorialLearningGoalSatisfied(initial)).toBe(false);
    const committed = commitPulse(initial, { colMask: 1, rowMask: 1 }, 'non-solve', 10);
    expect(selectTutorialLearningGoalSatisfied(committed)).toBe(true);
    const selecting = finishPulse(committed, 'non-solve');
    const undone = gameSessionReducer(selecting, { nowEpochMs: 20, type: 'UNDO' });
    expect(undone.session.moves).toHaveLength(0);
    expect(undone.session.acceptedPulseActionIds).toEqual(['non-solve']);
    expect(selectTutorialLearningGoalSatisfied(undone)).toBe(true);
  });

  it('requires one accepted move with at least two rows and two columns', () => {
    const initial = stateAt(4);
    const oneColumn = commitPulse(initial, { colMask: 0b0001, rowMask: 0b0011 }, 'narrow', 10);
    expect(selectTutorialLearningGoalSatisfied(oneColumn)).toBe(false);
    const multiAxis = commitPulse(initial, { colMask: 0b0101, rowMask: 0b0011 }, 'wide', 10);
    expect(selectTutorialLearningGoalSatisfied(multiAxis)).toBe(true);
  });

  it('requires a solved two-move attempt whose outer products share a cell', () => {
    const solved = solveAt(5);
    expect(solved.session.moves).toHaveLength(2);
    expect(selectTutorialLearningGoalSatisfied(solved)).toBe(true);

    const unsolved = replaceSession(solved, {
      completionEvent: null,
      status: 'selecting',
    });
    expect(selectTutorialLearningGoalSatisfied(unsolved)).toBe(false);

    const [firstMove, secondMove] = solved.session.moves;
    if (!firstMove || !secondMove) throw new Error('Echo fixture requires two moves.');
    const disjoint = replaceSession(solved, {
      moves: [
        { ...firstMove, colMask: 0b0001, rowMask: 0b0001 },
        { ...secondMove, colMask: 0b0010, rowMask: 0b0010 },
      ],
    });
    expect(selectTutorialLearningGoalSatisfied(disjoint)).toBe(false);

    const oneMove = replaceSession(solved, {
      moves: [firstMove],
    });
    expect(selectTutorialLearningGoalSatisfied(oneMove)).toBe(false);
  });
});

describe('Tutorial advancement and view model', () => {
  it('never advances before both the learning selector and solved state are satisfied', () => {
    for (let index = 0; index < TUTORIAL_STEP_COUNT; index += 1) {
      const initial = stateAt(index);
      expect(selectTutorialSolved(initial)).toBe(false);
      expect(selectCanAdvanceTutorial(initial)).toBe(false);
      expect(selectTutorialAdvanceTarget(initial)).toBeUndefined();
      expect(selectTutorialProgressEffect(initial)).toBe('unchanged');
    }

    const rowExperience = selectMask(stateAt(0), 'row', 1, 10);
    expect(selectTutorialLearningGoalSatisfied(rowExperience)).toBe(true);
    expect(selectCanAdvanceTutorial(rowExperience)).toBe(false);
    expect(selectTutorialAdvanceTarget(rowExperience)).toBeUndefined();
  });

  it('advances every canonical solved step in data order and ends at the first Lab CTA', () => {
    for (let index = 0; index < TUTORIAL_STEP_COUNT; index += 1) {
      const solved = solveAt(index);
      expect(selectTutorialSolved(solved), solved.puzzle.id).toBe(true);
      expect(selectTutorialLearningGoalSatisfied(solved), solved.puzzle.id).toBe(true);
      expect(selectCanAdvanceTutorial(solved), solved.puzzle.id).toBe(true);

      if (index < TUTORIAL_STEP_COUNT - 1) {
        const next = TUTORIAL_LEVELS[index + 1];
        expect(selectTutorialAdvanceTarget(solved)).toMatchObject({
          kind: 'tutorial-step',
          levelId: next?.id,
          progressEffect: 'unchanged',
          route: '/tutorial',
          sessionPolicy: 'new-attempt',
          stepIndex: index + 1,
        });
        expect(selectTutorialProgressEffect(solved)).toBe('unchanged');
      } else {
        expect(selectTutorialAdvanceTarget(solved)).toMatchObject({
          kind: 'first-lab',
          levelId: LAB_LEVELS[0]?.id,
          progressEffect: 'complete',
          route: `/lab/${LAB_LEVELS[0]?.id ?? ''}`,
          sessionPolicy: 'new-attempt',
        });
        expect(selectTutorialProgressEffect(solved)).toBe('complete');
      }
    }
  });

  it('builds localized, progress-aware view models and rejects non-Tutorial state', () => {
    const initial = stateAt(0);
    const ko = createTutorialStepViewModel(initial, 'ko');
    const en = createTutorialStepViewModel(initial, 'en');
    expect(ko).toMatchObject({
      canAdvance: false,
      index: 0,
      instructionKey: 'tutorial.step.selectRow',
      isFirst: true,
      isLast: false,
      learningGoal: 'row-selection',
      learningGoalSatisfied: false,
      levelId: TUTORIAL_LEVELS[0]?.id,
      progressLabel: '1 / 6',
      solved: false,
      stepId: 'tutorial.select-row',
      total: 6,
    });
    expect(ko?.instruction).not.toBe(en?.instruction);
    expect(Object.isFrozen(ko)).toBe(true);

    const lab = LAB_LEVELS[0];
    if (!lab) throw new Error('Missing first Lab level.');
    expect(createTutorialStepViewModel(createGameSessionState(lab, 'lab'), 'ko')).toBeUndefined();
  });
});
