export type GameUiPhase =
  'idle' | 'selected' | 'preview' | 'pulsing' | 'paused' | 'solved' | 'error' | 'disabled';

export type CellPreview = 'none' | 'turn-on' | 'turn-off';

export interface AxisToggleViewModel {
  readonly accessibleLabel: string;
  readonly disabled: boolean;
  readonly hinted?: boolean;
  readonly index: number;
  readonly label: string;
  readonly selected: boolean;
}

export interface TensorCellViewModel {
  readonly accessibleLabel: string;
  readonly columnIndex: number;
  readonly id: string;
  readonly preview: CellPreview;
  readonly pulseActive: boolean;
  readonly rowIndex: number;
  readonly targetValue: 0 | 1;
  readonly value: 0 | 1;
}

export interface TensorGridViewModel {
  readonly cells: readonly TensorCellViewModel[];
  readonly label: string;
  readonly size: number;
  readonly summary: string;
}

export interface GameControlsViewModel {
  readonly affectedCellCount: number;
  readonly affectedCellsLabel: string;
  readonly axesEnabled: boolean;
  readonly disabledReason?: string;
  readonly hintEnabled: boolean;
  readonly pulseEnabled: boolean;
  readonly pulseLocked: boolean;
  readonly pulseStatusLabel: string;
  readonly resetEnabled: boolean;
  readonly undoEnabled: boolean;
}

export interface GameStatusViewModel {
  readonly detail?: string;
  readonly eyebrow: string;
  readonly message: string;
  readonly tone: 'neutral' | 'ready' | 'active' | 'success' | 'error';
}

export interface GameResultViewModel {
  readonly activeElapsedText: string;
  readonly grade: 'S' | 'A' | 'B' | 'C';
  readonly heading: string;
  readonly hintSummary: string;
  readonly optimalPulseCount: number;
  readonly pulseCount: number;
  readonly undoCount: number;
}

export interface GameErrorViewModel {
  readonly description: string;
  readonly heading: string;
  readonly recoverLabel: string;
}

export interface GameUiLabels {
  readonly cancel: string;
  readonly columnAxis: string;
  readonly confirmReset: string;
  readonly hint: string;
  readonly hintDescription: string;
  readonly hintHeading: string;
  readonly pulse: string;
  readonly pulseBlocked: string;
  readonly pulseReady: string;
  readonly reset: string;
  readonly resetDescription: string;
  readonly resetHeading: string;
  readonly resultAligned: string;
  readonly resultGrade: string;
  readonly resultPar: string;
  readonly resultPulse: string;
  readonly resultTime: string;
  readonly resultUndo: string;
  readonly rowAxis: string;
  readonly target: string;
  readonly undo: string;
}

export interface GameUiViewModel {
  readonly board: TensorGridViewModel;
  readonly columns: readonly AxisToggleViewModel[];
  readonly controls: GameControlsViewModel;
  readonly error?: GameErrorViewModel;
  readonly eyebrow: string;
  readonly labels: GameUiLabels;
  readonly phase: GameUiPhase;
  readonly pulseToken?: string;
  readonly puzzleId: string;
  readonly result?: GameResultViewModel;
  readonly rows: readonly AxisToggleViewModel[];
  readonly status: GameStatusViewModel;
  readonly target: TensorGridViewModel;
  readonly title: string;
}

export interface GameUiCallbacks {
  readonly onHint: () => void;
  readonly onPulse: () => void;
  readonly onPulseVisualComplete: (token: string) => void;
  readonly onRecover: () => void;
  readonly onResetConfirmed: () => void;
  readonly onToggleColumn: (index: number) => void;
  readonly onToggleRow: (index: number) => void;
  readonly onUndo: () => void;
}
