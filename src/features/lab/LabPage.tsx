import { Link } from 'react-router-dom';

import type { PuzzleBestRecord } from '../../domain';
import { t, type MessageKey } from '../../i18n';
import { LAB_CHAPTERS, summarizeLabProgress } from './lab-catalog';
import styles from './LabPage.module.css';

export interface LabPageProps {
  readonly records?: Readonly<Record<string, PuzzleBestRecord>>;
}

export function LabPage({ records = {} }: LabPageProps) {
  const progress = summarizeLabProgress(records);

  return (
    <section aria-labelledby="lab-title" className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{t('lab.eyebrow')}</p>
          <h1 id="lab-title">{t('lab.title')}</h1>
          <p>{t('lab.description')}</p>
        </div>
        <p aria-label={t('lab.progressLabel')} className={styles.progress}>
          <strong>{progress.completedCount}</strong> / {progress.totalCount}
        </p>
      </header>

      <div className={styles.chapters}>
        {LAB_CHAPTERS.map((chapter, chapterIndex) => {
          const completedCount = chapter.levels.filter(
            (level) => records[level.id]?.completed,
          ).length;

          return (
            <section
              aria-labelledby={`lab-chapter-${chapter.id}`}
              className={styles.chapter}
              key={chapter.id}
            >
              <header className={styles.chapterHeader}>
                <div>
                  <p className={styles.chapterIndex}>
                    {t('lab.chapterLabel')} {chapterIndex + 1}
                  </p>
                  <h2 id={`lab-chapter-${chapter.id}`}>{t(chapter.titleKey as MessageKey)}</h2>
                  <p>{t(chapter.descriptionKey as MessageKey)}</p>
                </div>
                <span className={styles.chapterProgress}>
                  {completedCount} / {chapter.levels.length}
                </span>
              </header>

              <ol className={styles.levels}>
                {chapter.levels.map((level, levelIndex) => {
                  const record = records[level.id];
                  const completed = record?.completed === true;
                  return (
                    <li key={level.id}>
                      <Link
                        aria-label={`${t(level.titleKey as MessageKey)}, ${
                          completed ? t('lab.levelCompleted') : t('lab.levelOpen')
                        }`}
                        className={styles.level}
                        data-completed={completed ? 'true' : 'false'}
                        to={`/lab/${level.id}`}
                      >
                        <span className={styles.levelNumber}>
                          {String(levelIndex + 1).padStart(2, '0')}
                        </span>
                        <span className={styles.levelTitle}>{t(level.titleKey as MessageKey)}</span>
                        <span className={styles.levelMeta}>
                          {completed ? record.bestGrade : `${level.size}×${level.size}`}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </section>
  );
}
