import { useId, type CSSProperties } from 'react';

import { VisuallyHidden } from '../common';
import type { TensorGridViewModel } from './types';
import styles from './TensorGrid.module.css';

export interface TensorGridProps {
  readonly compact?: boolean;
  readonly model: TensorGridViewModel;
}

export function TensorGrid({ compact = false, model }: TensorGridProps) {
  const gridStyle = { '--grid-size': model.size } as CSSProperties;
  const summaryId = useId();

  return (
    <div className={styles.wrapper}>
      <VisuallyHidden id={summaryId}>{model.summary}</VisuallyHidden>
      <div
        aria-describedby={summaryId}
        aria-label={model.label}
        className={styles.grid}
        data-compact={compact ? 'true' : 'false'}
        data-grid-size={model.size}
        role="grid"
        style={gridStyle}
      >
        {Array.from({ length: model.size }, (_, rowIndex) => (
          <div aria-rowindex={rowIndex + 1} className={styles.row} key={rowIndex} role="row">
            {model.cells.slice(rowIndex * model.size, (rowIndex + 1) * model.size).map((cell) => (
              <div className={styles.slot} key={cell.id} role="presentation">
                <div
                  aria-label={cell.accessibleLabel}
                  aria-colindex={cell.columnIndex + 1}
                  className={styles.cell}
                  data-preview={cell.preview}
                  data-pulse={cell.pulseActive ? 'true' : 'false'}
                  data-state={cell.value === 1 ? 'on' : 'off'}
                  data-target={cell.targetValue === 1 ? 'on' : 'off'}
                  role="gridcell"
                >
                  <span aria-hidden="true" className={styles.signal} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
