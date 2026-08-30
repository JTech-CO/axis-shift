import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import { Button, Toast } from '../components/common';
import {
  GameSessionScreen,
  type GameSessionController,
  type GameSessionRuntime,
} from '../features/game-session';
import { HomePage, RecoveryPage, type HomeResumeSummary } from '../features/home';
import { getLabLevel, getNextLabLevel, LabPage } from '../features/lab';
import {
  createTutorialStepViewModel,
  selectTutorialAdvanceTarget,
  TUTORIAL_SKIP_TARGET,
  TUTORIAL_STEPS,
  tutorialBackTarget,
  tutorialStepAt,
  tutorialStepForLevelId,
  TutorialCoachmark,
} from '../features/tutorial';
import { t } from '../i18n';
import { DEFAULT_PROGRESS, type PersistedAppState } from '../services/storage';
import { createGameSessionCopy } from './game-copy';
import { getAppGameSessionRuntime } from './runtime';
import styles from './ProductRoutes.module.css';

const GAME_COPY = createGameSessionCopy();

function safeAppState(runtime: GameSessionRuntime): PersistedAppState {
  try {
    return runtime.loadAppState();
  } catch {
    return { ...DEFAULT_PROGRESS, resumableSession: null };
  }
}

function resumeSummary(state: PersistedAppState): HomeResumeSummary | null {
  const session = state.resumableSession;
  if (!session) return null;
  if (tutorialStepForLevelId(session.puzzleId))
    return { mode: 'tutorial', puzzleId: session.puzzleId };
  if (getLabLevel(session.puzzleId)) return { mode: 'lab', puzzleId: session.puzzleId };
  return null;
}

export function ProductHomeRoute() {
  const state = safeAppState(getAppGameSessionRuntime());
  const labCompletedCount = Object.values(state.labRecords).filter(
    (record) => record.completed,
  ).length;
  return (
    <HomePage
      labCompletedCount={labCompletedCount}
      resume={resumeSummary(state)}
      tutorialCompleted={state.tutorialCompleted}
    />
  );
}

export function LabIndexRoute() {
  const state = safeAppState(getAppGameSessionRuntime());
  return <LabPage records={state.labRecords} />;
}

function PersistenceWarning({ controller }: { readonly controller: GameSessionController }) {
  if (controller.persistenceWarning === null) return null;
  return (
    <aside className={styles.warning} role="alert">
      <Toast tone="warning">{t('persistence.warning.description')}</Toast>
      <Button onClick={controller.retryPersistence} variant="secondary">
        {t('persistence.warning.retry')}
      </Button>
    </aside>
  );
}

function LabResultActions({
  controller,
  onReplay,
}: {
  readonly controller: GameSessionController;
  readonly onReplay: () => void;
}) {
  const navigate = useNavigate();
  const next = getNextLabLevel(controller.state.puzzle.id);
  if (controller.state.session.status !== 'solved') return null;
  const transition = (route: string): void => {
    if (controller.clearSessionForTransition()) navigate(route);
  };

  return (
    <nav aria-label={t('result.eyebrow')} className={styles.resultActions}>
      <Link
        onClick={(event) => {
          if (!controller.clearSessionForTransition()) event.preventDefault();
        }}
        to="/lab"
      >
        {t('result.action.backToLab')}
      </Link>
      <Button
        onClick={() => {
          if (controller.clearSessionForTransition()) onReplay();
        }}
        variant="secondary"
      >
        {t('result.action.replay')}
      </Button>
      {next ? (
        <Button onClick={() => transition(`/lab/${next.id}`)} variant="primary">
          {t('result.action.nextLevel')}
        </Button>
      ) : null}
    </nav>
  );
}

export function LabLevelRoute() {
  const { levelId = '' } = useParams();
  const puzzle = getLabLevel(levelId);
  const runtime = getAppGameSessionRuntime();
  const [attempt, setAttempt] = useState(0);

  if (!puzzle) {
    return (
      <section aria-labelledby="lab-error-title" className={styles.unknown}>
        <h1 id="lab-error-title">{t('lab.error.unknownLevel.title')}</h1>
        <p>{t('lab.error.unknownLevel.description')}</p>
        <Link to="/lab">{t('lab.error.unknownLevel.back')}</Link>
      </section>
    );
  }

  const replay = (): void => {
    setAttempt((value) => value + 1);
  };

  return (
    <section aria-label={t('game.eyebrow.lab')} className={styles.gameRoute}>
      <GameSessionScreen
        copy={GAME_COPY}
        puzzle={puzzle}
        runtime={runtime}
        screenKey={String(attempt)}
      >
        {(controller) => (
          <>
            <PersistenceWarning controller={controller} />
            <LabResultActions controller={controller} onReplay={replay} />
          </>
        )}
      </GameSessionScreen>
    </section>
  );
}

function requestedTutorialIndex(search: string): number | undefined {
  const raw = new URLSearchParams(search).get('step');
  if (!raw || !/^\d+$/u.test(raw)) return undefined;
  const index = Number(raw) - 1;
  return tutorialStepAt(index) ? index : undefined;
}

function resumableTutorialIndex(runtime: GameSessionRuntime): number {
  const session = safeAppState(runtime).resumableSession;
  return session ? (tutorialStepForLevelId(session.puzzleId)?.index ?? 0) : 0;
}

function TutorialAttempt({
  runtime,
  stepIndex,
}: {
  readonly runtime: GameSessionRuntime;
  readonly stepIndex: number;
}) {
  const navigate = useNavigate();
  const step = tutorialStepAt(stepIndex);
  const [navigationWarning, setNavigationWarning] = useState(false);

  if (!step) return <RecoveryPage />;

  const goBack = (controller: GameSessionController): void => {
    const target = tutorialBackTarget(step.level.id);
    if (!target) return;
    if (target.sessionPolicy === 'new-attempt' && !controller.clearSessionForTransition()) {
      return;
    }
    navigate(
      target.kind === 'tutorial-step' && target.stepIndex !== null
        ? `/tutorial?step=${String(target.stepIndex + 1)}`
        : target.route,
    );
  };

  const skip = (controller: GameSessionController): void => {
    const current = safeAppState(runtime);
    const progressSaved = (() => {
      try {
        return runtime.repository.saveProgress({
          dailyRecords: current.dailyRecords,
          labRecords: current.labRecords,
          schemaVersion: 1,
          sprintBest: current.sprintBest,
          tutorialCompleted: true,
        });
      } catch {
        return false;
      }
    })();
    if (!progressSaved) {
      setNavigationWarning(true);
      return;
    }
    setNavigationWarning(false);
    if (!controller.clearSessionForTransition()) return;
    navigate(TUTORIAL_SKIP_TARGET.route);
  };

  const advance = (controller: GameSessionController): void => {
    const target = selectTutorialAdvanceTarget(controller.state);
    if (!target) return;
    if (target.sessionPolicy === 'new-attempt' && !controller.clearSessionForTransition()) {
      return;
    }
    navigate(
      target.kind === 'tutorial-step' && target.stepIndex !== null
        ? `/tutorial?step=${String(target.stepIndex + 1)}`
        : target.route,
    );
  };

  return (
    <section
      aria-label={t('tutorial.title')}
      className={`${styles.gameRoute} ${styles.tutorialRoute}`}
    >
      <GameSessionScreen
        before={(controller) => {
          const view = createTutorialStepViewModel(controller.state, 'ko');
          return view ? (
            <>
              <TutorialCoachmark
                onAdvance={() => advance(controller)}
                onBack={() => goBack(controller)}
                onSkip={() => skip(controller)}
                view={view}
              />
              {navigationWarning ? (
                <aside className={styles.warning} role="alert">
                  <Toast tone="warning">{t('persistence.warning.description')}</Toast>
                </aside>
              ) : null}
            </>
          ) : (
            <RecoveryPage />
          );
        }}
        completeTutorialOnSolve={stepIndex === TUTORIAL_STEPS.length - 1}
        copy={GAME_COPY}
        puzzle={step.level}
        runtime={runtime}
      >
        {(controller) => <PersistenceWarning controller={controller} />}
      </GameSessionScreen>
    </section>
  );
}

export function TutorialRoute() {
  const location = useLocation();
  const runtime = getAppGameSessionRuntime();
  const requestedIndex = requestedTutorialIndex(location.search);
  const stepIndex = requestedIndex ?? resumableTutorialIndex(runtime);
  const step = tutorialStepAt(stepIndex);

  if (requestedIndex === undefined && step) {
    return <Navigate replace to={`/tutorial?step=${String(stepIndex + 1)}`} />;
  }

  if (!step) return <RecoveryPage />;

  return <TutorialAttempt key={step.level.id} runtime={runtime} stepIndex={stepIndex} />;
}
