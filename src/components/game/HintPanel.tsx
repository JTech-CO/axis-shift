import { Button } from '../common';
import styles from './HintPanel.module.css';

export interface HintPanelProps {
  readonly description: string;
  readonly disabled: boolean;
  readonly heading: string;
  readonly label: string;
  readonly onHint: () => void;
}

export function HintPanel({ description, disabled, heading, label, onHint }: HintPanelProps) {
  return (
    <section className={styles.panel}>
      <div>
        <p className={styles.heading}>{heading}</p>
        <p className={styles.description}>{description}</p>
      </div>
      <Button aria-keyshortcuts="H" disabled={disabled} onClick={onHint} variant="secondary">
        <span aria-hidden="true">?</span>
        {label}
      </Button>
    </section>
  );
}
