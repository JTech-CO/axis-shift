import { useId } from 'react';

import { TensorGrid } from './TensorGrid';
import type { TensorGridViewModel } from './types';
import styles from './TargetPreview.module.css';

export interface TargetPreviewProps {
  readonly label: string;
  readonly model: TensorGridViewModel;
}

export function TargetPreview({ label, model }: TargetPreviewProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={styles.panel} data-target-preview="true">
      <div className={styles.header}>
        <span aria-hidden="true" className={styles.glyph}>
          ◇
        </span>
        <h2 className={styles.heading} id={headingId}>
          {label}
        </h2>
      </div>
      <div className={styles.preview} data-target-grid="true">
        <TensorGrid compact model={model} />
      </div>
      <p className={styles.caption}>{model.summary}</p>
    </section>
  );
}
