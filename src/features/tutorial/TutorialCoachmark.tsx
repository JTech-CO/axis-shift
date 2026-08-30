import { Button } from '../../components/common';
import { t } from '../../i18n';
import type { TutorialStepViewModel } from './tutorial-policy';
import styles from './TutorialCoachmark.module.css';

export interface TutorialCoachmarkProps {
  readonly onAdvance: () => void;
  readonly onBack: () => void;
  readonly onSkip: () => void;
  readonly view: TutorialStepViewModel;
}

export function TutorialCoachmark({ onAdvance, onBack, onSkip, view }: TutorialCoachmarkProps) {
  return (
    <aside
      aria-label={t('tutorial.coachmarkLabel')}
      className={styles.coachmark}
      data-learning-goal={view.learningGoal}
      data-learning-goal-satisfied={view.learningGoalSatisfied ? 'true' : 'false'}
    >
      <div className={styles.copy}>
        <p className={styles.progress}>
          {t('tutorial.progressLabel')} {view.progressLabel}
        </p>
        <h2>{view.instruction}</h2>
        <p aria-live="polite" className={styles.state}>
          {view.learningGoalSatisfied ? t('tutorial.goalSatisfied') : t('tutorial.goalPending')}
        </p>
      </div>
      <div className={styles.actions}>
        <Button onClick={onBack} variant="quiet">
          {t('tutorial.action.back')}
        </Button>
        <Button onClick={onSkip} variant="quiet">
          {t('tutorial.action.skip')}
        </Button>
        {view.canAdvance ? (
          <Button onClick={onAdvance} variant="primary">
            {view.isLast ? t('tutorial.action.startLab') : t('tutorial.action.next')}
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
