import type { AxisToggleViewModel } from './types';
import styles from './AxisToggle.module.css';

export interface AxisToggleProps {
  readonly axis: 'column' | 'row';
  readonly item: AxisToggleViewModel;
  readonly onToggle: (index: number) => void;
}

export function AxisToggle({ axis, item, onToggle }: AxisToggleProps) {
  return (
    <button
      aria-label={item.accessibleLabel}
      aria-pressed={item.selected}
      className={styles.toggle}
      data-axis={axis}
      data-hinted={item.hinted ? 'true' : 'false'}
      data-selected={item.selected ? 'true' : 'false'}
      disabled={item.disabled}
      onClick={() => onToggle(item.index)}
      type="button"
    >
      <span aria-hidden="true" className={styles.node} />
      <span aria-hidden="true" className={styles.label}>
        {item.label}
      </span>
    </button>
  );
}
