import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { Button } from './Button';
import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children'
> {
  readonly 'aria-label': string;
  readonly icon: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, icon, ...props },
  ref,
) {
  const classes = [styles.iconButton, className].filter(Boolean).join(' ');

  return (
    <Button ref={ref} className={classes} variant="quiet" {...props}>
      <span aria-hidden="true" className={styles.icon}>
        {icon}
      </span>
    </Button>
  );
});
