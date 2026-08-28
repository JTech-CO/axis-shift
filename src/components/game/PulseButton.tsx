import { Button } from '../common';
import styles from './PulseButton.module.css';

export interface PulseButtonProps {
  readonly affectedLabel: string;
  readonly disabled: boolean;
  readonly label: string;
  readonly locked: boolean;
  readonly statusLabel: string;
  readonly onPulse: () => void;
}

export function PulseButton({
  affectedLabel,
  disabled,
  label,
  locked,
  statusLabel,
  onPulse,
}: PulseButtonProps) {
  return (
    <Button
      aria-keyshortcuts="P Control+Enter Meta+Enter"
      className={styles.button}
      data-pulse-control="true"
      disabled={disabled || locked}
      fullWidth
      onClick={onPulse}
      variant="primary"
    >
      <span aria-hidden="true" className={styles.bracket}>
        [
      </span>
      <span className={styles.copy}>
        <strong>{label}</strong>
        <small>{statusLabel}</small>
      </span>
      <span aria-hidden="true" className={styles.bracket}>
        ]
      </span>
      <span className={styles.affected}>{affectedLabel}</span>
    </Button>
  );
}
