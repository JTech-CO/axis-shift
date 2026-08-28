import type { GameStatusViewModel } from './types';
import styles from './StatusStrip.module.css';

export interface StatusStripProps {
  readonly status: GameStatusViewModel;
}

export function StatusStrip({ status }: StatusStripProps) {
  return (
    <section
      aria-atomic="true"
      aria-live={status.tone === 'error' ? 'assertive' : 'polite'}
      className={styles.strip}
      data-tone={status.tone}
      role={status.tone === 'error' ? 'alert' : 'status'}
    >
      <span aria-hidden="true" className={styles.marker}>
        ×
      </span>
      <div>
        <p className={styles.eyebrow}>{status.eyebrow}</p>
        <p className={styles.message}>{status.message}</p>
        {status.detail ? <p className={styles.detail}>{status.detail}</p> : null}
      </div>
    </section>
  );
}
