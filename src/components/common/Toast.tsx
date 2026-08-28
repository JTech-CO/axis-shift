import type { ReactNode } from 'react';

import styles from './Toast.module.css';

export interface ToastProps {
  readonly children: ReactNode;
  readonly title?: string;
  readonly tone?: 'info' | 'success' | 'warning' | 'error';
}

export function Toast({ children, title, tone = 'info' }: ToastProps) {
  const urgent = tone === 'error';

  return (
    <section
      aria-atomic="true"
      aria-live={urgent ? 'assertive' : 'polite'}
      className={styles.toast}
      data-tone={tone}
      role={urgent ? 'alert' : 'status'}
    >
      {title ? <strong>{title}</strong> : null}
      <div>{children}</div>
    </section>
  );
}
