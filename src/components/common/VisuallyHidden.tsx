import type { HTMLAttributes } from 'react';

import styles from './VisuallyHidden.module.css';

export function VisuallyHidden({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return <span className={classes} {...props} />;
}
