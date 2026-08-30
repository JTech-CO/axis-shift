import { Link } from 'react-router-dom';

import { t } from '../../i18n';
import styles from './HomePage.module.css';

export interface HomeResumeSummary {
  readonly mode: 'lab' | 'tutorial';
  readonly puzzleId: string;
}

export interface HomePageProps {
  readonly labCompletedCount?: number;
  readonly resume?: HomeResumeSummary | null;
  readonly tutorialCompleted?: boolean;
}

function resumePath(resume: HomeResumeSummary): string {
  return resume.mode === 'tutorial' ? '/tutorial' : `/lab/${resume.puzzleId}`;
}

export function HomePage({
  labCompletedCount = 0,
  resume = null,
  tutorialCompleted = false,
}: HomePageProps) {
  return (
    <section aria-labelledby="home-title" className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{t('home.eyebrow')}</p>
          <h1 id="home-title">{t('home.title')}</h1>
          <p className={styles.heroDescription}>{t('home.description')}</p>
          <Link className={styles.primaryAction} to={tutorialCompleted ? '/lab' : '/tutorial'}>
            {tutorialCompleted ? t('home.primaryLab') : t('home.primaryTutorial')}
          </Link>
        </div>
        <div aria-hidden="true" className={styles.signalMark}>
          {Array.from({ length: 16 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
      </div>

      {resume ? (
        <aside className={styles.resume}>
          <div>
            <p className={styles.resumeLabel}>{t('home.resumeLabel')}</p>
            <p>{t('home.resumeDescription')}</p>
          </div>
          <Link className={styles.resumeAction} to={resumePath(resume)}>
            {t('home.resumeAction')}
          </Link>
        </aside>
      ) : null}

      <section aria-labelledby="home-modes-title">
        <h2 className="visually-hidden" id="home-modes-title">
          {t('home.modesLabel')}
        </h2>
        <div className={styles.modes}>
          <article className={styles.card}>
            <div>
              <p className={styles.cardEyebrow}>01 / {t('home.dailyEyebrow')}</p>
              <h2>{t('home.dailyTitle')}</h2>
              <p>{t('home.dailyDescription')}</p>
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.metric}>{t('home.dailyMetric')}</span>
              <Link className={styles.cardAction} to="/daily">
                {t('home.dailyAction')}
              </Link>
            </div>
          </article>

          <article className={styles.card}>
            <div>
              <p className={styles.cardEyebrow}>02 / {t('home.labEyebrow')}</p>
              <h2>{t('home.labTitle')}</h2>
              <p>{t('home.labDescription')}</p>
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.metric}>
                {t('home.labProgress')} {labCompletedCount} / 48
              </span>
              <Link className={styles.cardAction} to="/lab">
                {t('home.labAction')}
              </Link>
            </div>
          </article>

          <article aria-disabled="true" className={styles.card} data-disabled="true">
            <div>
              <p className={styles.cardEyebrow}>03 / {t('home.sprintEyebrow')}</p>
              <h2>{t('home.sprintTitle')}</h2>
              <p>{t('home.sprintDescription')}</p>
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.metric}>{t('home.sprintComingSoon')}</span>
            </div>
          </article>
        </div>
      </section>

      <div className={styles.secondaryLinks}>
        <Link to="/tutorial">{t('home.tutorialReplay')}</Link>
      </div>
    </section>
  );
}
