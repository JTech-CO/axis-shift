import { LAB_LEVELS, TUTORIAL_LEVELS } from '../../content';
import { isSolved, type GameSessionState } from '../../domain';
import { t, type Locale, type MessageKey } from '../../i18n';

export const TUTORIAL_STEP_COUNT = 6 as const;

export type TutorialStepId =
  | 'tutorial.select-row'
  | 'tutorial.select-column'
  | 'tutorial.preview-intersection'
  | 'tutorial.execute-pulse'
  | 'tutorial.select-multiple-axes'
  | 'tutorial.observe-echo';

export type TutorialLearningGoal =
  | 'row-selection'
  | 'column-selection'
  | 'intersection-preview'
  | 'accepted-pulse'
  | 'multi-axis-pulse'
  | 'echo-overlap';

export type TutorialLearningSelector = (state: GameSessionState) => boolean;

interface TutorialStepContract {
  readonly goal: TutorialLearningGoal;
  readonly instructionKey: MessageKey;
  readonly selector: TutorialLearningSelector;
}

export interface TutorialStepDefinition extends TutorialStepContract {
  readonly index: number;
  readonly level: (typeof TUTORIAL_LEVELS)[number];
  readonly stepId: TutorialStepId;
}

export type TutorialProgressEffect = 'unchanged' | 'acknowledge' | 'complete';
export type TutorialSessionPolicy = 'preserve' | 'clear' | 'new-attempt';

export interface TutorialNavigationTarget {
  readonly history: 'push';
  readonly kind: 'home' | 'tutorial-step' | 'lab-index' | 'first-lab';
  readonly levelId: string | null;
  readonly progressEffect: TutorialProgressEffect;
  readonly route: string;
  readonly sessionPolicy: TutorialSessionPolicy;
  readonly stepIndex: number | null;
  readonly writeLevelRecord: false;
}

export interface TutorialStepViewModel {
  readonly canAdvance: boolean;
  readonly index: number;
  readonly instruction: string;
  readonly instructionKey: MessageKey;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly learningGoal: TutorialLearningGoal;
  readonly learningGoalSatisfied: boolean;
  readonly levelId: string;
  readonly progressLabel: string;
  readonly solved: boolean;
  readonly stepId: TutorialStepId;
  readonly total: typeof TUTORIAL_STEP_COUNT;
}

function hasRowSelectionExperience(state: GameSessionState): boolean {
  return (
    state.session.selectedRowsMask !== 0 || state.session.moves.some((move) => move.rowMask !== 0)
  );
}

function hasColumnSelectionExperience(state: GameSessionState): boolean {
  return (
    state.session.selectedColsMask !== 0 || state.session.moves.some((move) => move.colMask !== 0)
  );
}

function hasIntersectionPreviewExperience(state: GameSessionState): boolean {
  return (
    (state.session.selectedRowsMask !== 0 && state.session.selectedColsMask !== 0) ||
    state.session.moves.some((move) => move.rowMask !== 0 && move.colMask !== 0)
  );
}

function hasAcceptedPulse(state: GameSessionState): boolean {
  return state.session.acceptedPulseActionIds.length > 0;
}

function populationCount(mask: number): number {
  let remaining = mask >>> 0;
  let count = 0;
  while (remaining !== 0) {
    remaining &= remaining - 1;
    count += 1;
  }
  return count;
}

function hasMultiAxisPulse(state: GameSessionState): boolean {
  return state.session.moves.some(
    (move) => populationCount(move.rowMask) >= 2 && populationCount(move.colMask) >= 2,
  );
}

function hasOverlappingMoveCell(state: GameSessionState): boolean {
  const { moves } = state.session;
  if (moves.length < 2) return false;

  for (let leftIndex = 0; leftIndex < moves.length - 1; leftIndex += 1) {
    const left = moves[leftIndex];
    if (!left) continue;
    for (let rightIndex = leftIndex + 1; rightIndex < moves.length; rightIndex += 1) {
      const right = moves[rightIndex];
      if (right && (left.rowMask & right.rowMask) !== 0 && (left.colMask & right.colMask) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function isCompletedTutorialState(state: GameSessionState): boolean {
  return (
    state.session.puzzleId === state.puzzle.id &&
    state.session.status === 'solved' &&
    state.session.completionEvent !== null &&
    isSolved(state.session.currentRows, state.puzzle.targetRows, state.puzzle.size)
  );
}

function hasEchoOverlap(state: GameSessionState): boolean {
  return isCompletedTutorialState(state) && hasOverlappingMoveCell(state);
}

const STEP_CONTRACTS = Object.freeze({
  'tutorial.select-row': Object.freeze({
    goal: 'row-selection',
    instructionKey: 'tutorial.step.selectRow',
    selector: hasRowSelectionExperience,
  }),
  'tutorial.select-column': Object.freeze({
    goal: 'column-selection',
    instructionKey: 'tutorial.step.selectColumn',
    selector: hasColumnSelectionExperience,
  }),
  'tutorial.preview-intersection': Object.freeze({
    goal: 'intersection-preview',
    instructionKey: 'tutorial.step.previewIntersection',
    selector: hasIntersectionPreviewExperience,
  }),
  'tutorial.execute-pulse': Object.freeze({
    goal: 'accepted-pulse',
    instructionKey: 'tutorial.step.executePulse',
    selector: hasAcceptedPulse,
  }),
  'tutorial.select-multiple-axes': Object.freeze({
    goal: 'multi-axis-pulse',
    instructionKey: 'tutorial.step.selectMultipleAxes',
    selector: hasMultiAxisPulse,
  }),
  'tutorial.observe-echo': Object.freeze({
    goal: 'echo-overlap',
    instructionKey: 'tutorial.step.observeEcho',
    selector: hasEchoOverlap,
  }),
} satisfies Readonly<Record<TutorialStepId, TutorialStepContract>>);

export const TUTORIAL_LEARNING_SELECTORS: Readonly<
  Record<TutorialStepId, TutorialLearningSelector>
> = Object.freeze(
  Object.fromEntries(
    Object.entries(STEP_CONTRACTS).map(([stepId, contract]) => [stepId, contract.selector]),
  ) as Record<TutorialStepId, TutorialLearningSelector>,
);

function stepIdForLevel(level: (typeof TUTORIAL_LEVELS)[number]): TutorialStepId {
  const stepIds = level.tutorialStepIds;
  const stepId = stepIds?.[0];
  if (
    stepIds?.length !== 1 ||
    typeof stepId !== 'string' ||
    !Object.hasOwn(STEP_CONTRACTS, stepId)
  ) {
    throw new Error(`${level.id} must declare one supported Tutorial step ID.`);
  }
  return stepId as TutorialStepId;
}

if (TUTORIAL_LEVELS.length !== TUTORIAL_STEP_COUNT) {
  throw new Error(`Tutorial requires exactly ${String(TUTORIAL_STEP_COUNT)} levels.`);
}

export const TUTORIAL_STEPS: readonly TutorialStepDefinition[] = Object.freeze(
  TUTORIAL_LEVELS.map((level, index) => {
    const stepId = stepIdForLevel(level);
    const contract = STEP_CONTRACTS[stepId];
    return Object.freeze({ ...contract, index, level, stepId });
  }),
);

const TUTORIAL_STEPS_BY_LEVEL_ID = new Map(
  TUTORIAL_STEPS.map((step) => [step.level.id, step] as const),
);
if (TUTORIAL_STEPS_BY_LEVEL_ID.size !== TUTORIAL_STEP_COUNT) {
  throw new Error('Tutorial level IDs must be unique.');
}

const firstLabLevel = (() => {
  const level = LAB_LEVELS[0];
  if (!level) throw new Error('Tutorial completion requires a first Lab level.');
  return level;
})();

export const TUTORIAL_BROWSER_HISTORY_POLICY = 'allow' as const;

export const TUTORIAL_SKIP_TARGET: TutorialNavigationTarget = Object.freeze({
  history: 'push',
  kind: 'lab-index',
  levelId: null,
  progressEffect: 'acknowledge',
  route: '/lab',
  sessionPolicy: 'clear',
  stepIndex: null,
  writeLevelRecord: false,
});

export function tutorialStepAt(index: number): TutorialStepDefinition | undefined {
  return Number.isInteger(index) ? TUTORIAL_STEPS[index] : undefined;
}

export function tutorialStepForLevelId(levelId: string): TutorialStepDefinition | undefined {
  return TUTORIAL_STEPS_BY_LEVEL_ID.get(levelId);
}

function stepForState(state: GameSessionState): TutorialStepDefinition | undefined {
  if (state.session.puzzleId !== state.puzzle.id) return undefined;
  return tutorialStepForLevelId(state.puzzle.id);
}

export function selectTutorialLearningGoalSatisfied(state: GameSessionState): boolean {
  const step = stepForState(state);
  return step?.selector(state) ?? false;
}

export function selectTutorialSolved(state: GameSessionState): boolean {
  return stepForState(state) !== undefined && isCompletedTutorialState(state);
}

export function selectCanAdvanceTutorial(state: GameSessionState): boolean {
  return selectTutorialSolved(state) && selectTutorialLearningGoalSatisfied(state);
}

export function selectTutorialProgressEffect(state: GameSessionState): TutorialProgressEffect {
  const step = stepForState(state);
  return step?.index === TUTORIAL_STEP_COUNT - 1 && selectCanAdvanceTutorial(state)
    ? 'complete'
    : 'unchanged';
}

export function tutorialBackTarget(levelId: string): TutorialNavigationTarget | undefined {
  const step = tutorialStepForLevelId(levelId);
  if (!step) return undefined;
  if (step.index === 0) {
    return Object.freeze({
      history: 'push',
      kind: 'home',
      levelId: null,
      progressEffect: 'unchanged',
      route: '/',
      sessionPolicy: 'preserve',
      stepIndex: null,
      writeLevelRecord: false,
    });
  }

  const previous = tutorialStepAt(step.index - 1);
  if (!previous) throw new Error('Tutorial previous-step policy is inconsistent.');
  return Object.freeze({
    history: 'push',
    kind: 'tutorial-step',
    levelId: previous.level.id,
    progressEffect: 'unchanged',
    route: '/tutorial',
    sessionPolicy: 'new-attempt',
    stepIndex: previous.index,
    writeLevelRecord: false,
  });
}

export function selectTutorialAdvanceTarget(
  state: GameSessionState,
): TutorialNavigationTarget | undefined {
  const step = stepForState(state);
  if (!step || !selectCanAdvanceTutorial(state)) return undefined;

  const next = tutorialStepAt(step.index + 1);
  if (next) {
    return Object.freeze({
      history: 'push',
      kind: 'tutorial-step',
      levelId: next.level.id,
      progressEffect: 'unchanged',
      route: '/tutorial',
      sessionPolicy: 'new-attempt',
      stepIndex: next.index,
      writeLevelRecord: false,
    });
  }

  return Object.freeze({
    history: 'push',
    kind: 'first-lab',
    levelId: firstLabLevel.id,
    progressEffect: 'complete',
    route: `/lab/${firstLabLevel.id}`,
    sessionPolicy: 'new-attempt',
    stepIndex: null,
    writeLevelRecord: false,
  });
}

export function createTutorialStepViewModel(
  state: GameSessionState,
  locale: Locale,
): TutorialStepViewModel | undefined {
  const step = stepForState(state);
  if (!step) return undefined;
  const learningGoalSatisfied = step.selector(state);
  const solved = isCompletedTutorialState(state);
  return Object.freeze({
    canAdvance: solved && learningGoalSatisfied,
    index: step.index,
    instruction: t(step.instructionKey, locale),
    instructionKey: step.instructionKey,
    isFirst: step.index === 0,
    isLast: step.index === TUTORIAL_STEP_COUNT - 1,
    learningGoal: step.goal,
    learningGoalSatisfied,
    levelId: step.level.id,
    progressLabel: `${String(step.index + 1)} / ${String(TUTORIAL_STEP_COUNT)}`,
    solved,
    stepId: step.stepId,
    total: TUTORIAL_STEP_COUNT,
  });
}
