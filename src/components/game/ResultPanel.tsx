import { useEffect, useId, useRef } from 'react';

import type { GameResultViewModel, GameUiLabels } from './types';
import styles from './ResultPanel.module.css';

export interface ResultPanelProps {
  readonly focusOnMount?: boolean;
  readonly labels: Pick<
    GameUiLabels,
    'resultAligned' | 'resultGrade' | 'resultPar' | 'resultPulse' | 'resultTime' | 'resultUndo'
  >;
  readonly result: GameResultViewModel;
}

export function ResultPanel({ focusOnMount = true, labels, result }: ResultPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus();
  }, [focusOnMount]);

  return (
    <section aria-labelledby={headingId} className={styles.panel}>
      <p className={styles.eyebrow}>{labels.resultAligned}</p>
      <div className={styles.header}>
        <h2 id={headingId} ref={headingRef} tabIndex={-1}>
          {result.heading}
        </h2>
        <strong aria-label={labels.resultGrade + ' ' + result.grade} className={styles.grade}>
          {result.grade}
        </strong>
      </div>
      <dl className={styles.metrics}>
        <div>
          <dt>{labels.resultPulse}</dt>
          <dd>
            {result.pulseCount} / {labels.resultPar} {result.optimalPulseCount}
          </dd>
        </div>
        <div>
          <dt>{labels.resultTime}</dt>
          <dd>{result.activeElapsedText}</dd>
        </div>
        <div>
          <dt>{labels.resultUndo}</dt>
          <dd>{result.undoCount}</dd>
        </div>
      </dl>
      <p className={styles.hintSummary}>{result.hintSummary}</p>
    </section>
  );
}
