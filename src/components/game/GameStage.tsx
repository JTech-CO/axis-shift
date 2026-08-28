import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import { Button, Dialog, Toast } from '../common';
import { AxisToggle } from './AxisToggle';
import { HintPanel } from './HintPanel';
import { PulseButton } from './PulseButton';
import { ResultPanel } from './ResultPanel';
import { StatusStrip } from './StatusStrip';
import { TargetPreview } from './TargetPreview';
import { TensorGrid } from './TensorGrid';
import type { GameUiCallbacks, GameUiViewModel } from './types';
import styles from './GameStage.module.css';

export interface GameStageProps {
  readonly callbacks: GameUiCallbacks;
  readonly view: GameUiViewModel;
}

function hasVisibleModal(): boolean {
  return Array.from(
    document.querySelectorAll('dialog[open], [role="dialog"][aria-modal="true"]'),
  ).some((element) => {
    if (element.closest('[hidden], [aria-hidden="true"]')) return false;
    if (!(element instanceof HTMLElement)) return true;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return (
    target.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'SELECT' ||
    tagName === 'TEXTAREA'
  );
}

export function GameStage({ callbacks, view }: GameStageProps) {
  const [resetState, setResetState] = useState(() => ({
    open: false,
    puzzleId: view.puzzleId,
  }));
  if (resetState.puzzleId !== view.puzzleId) {
    setResetState({ open: false, puzzleId: view.puzzleId });
  }
  const resetOpen = resetState.open;
  const pulseLatchRef = useRef(false);
  const pulseVisualCompleteRef = useRef(callbacks.onPulseVisualComplete);
  const previousPhaseRef = useRef(view.phase);
  const gridStyle = { '--grid-size': view.board.size } as CSSProperties;
  const titleId = useId();

  useEffect(() => {
    pulseVisualCompleteRef.current = callbacks.onPulseVisualComplete;
  }, [callbacks.onPulseVisualComplete]);

  useEffect(() => {
    pulseLatchRef.current = false;
  }, [view.puzzleId]);

  useEffect(() => {
    if (view.phase === 'pulsing') pulseLatchRef.current = true;
    if (previousPhaseRef.current === 'pulsing' && view.phase !== 'pulsing') {
      pulseLatchRef.current = false;
    }
    previousPhaseRef.current = view.phase;
  }, [view.phase]);

  const requestPulse = useCallback(() => {
    if (pulseLatchRef.current || !view.controls.pulseEnabled || view.controls.pulseLocked) {
      return;
    }
    pulseLatchRef.current = true;
    callbacks.onPulse();
  }, [callbacks, view.controls.pulseEnabled, view.controls.pulseLocked]);

  useEffect(() => {
    const token = view.pulseToken;
    if (view.phase !== 'pulsing' || !token) return;

    const reduced =
      document.documentElement.dataset.motion === 'reduced' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(
      () => pulseVisualCompleteRef.current(token),
      reduced ? 80 : 450,
    );
    return () => window.clearTimeout(timer);
  }, [view.phase, view.pulseToken]);

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      if (event.repeat || isEditableTarget(event.target)) return;
      const key = event.key.toLowerCase();

      if (key === 'escape' && resetOpen) {
        event.preventDefault();
        setResetState({ open: false, puzzleId: view.puzzleId });
        return;
      }
      if (hasVisibleModal()) return;

      const plainKey = !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
      const commandEnter =
        event.key === 'Enter' &&
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !event.shiftKey;
      const shiftOnly = event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey;

      if ((key === 'p' && plainKey) || commandEnter) {
        event.preventDefault();
        requestPulse();
      } else if (key === 'z' && plainKey && view.controls.undoEnabled) {
        event.preventDefault();
        callbacks.onUndo();
      } else if (key === 'h' && plainKey && view.controls.hintEnabled) {
        event.preventDefault();
        callbacks.onHint();
      } else if (key === 'r' && shiftOnly && view.controls.resetEnabled) {
        event.preventDefault();
        setResetState({ open: true, puzzleId: view.puzzleId });
      }
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [callbacks, requestPulse, resetOpen, view.controls, view.puzzleId]);

  function suppressButtonShortcutDuplication(event: ReactKeyboardEvent<HTMLElement>) {
    if (
      event.currentTarget instanceof HTMLButtonElement &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      return;
    }
  }

  return (
    <article
      aria-labelledby={titleId}
      className={styles.stage}
      data-game-stage="true"
      data-phase={view.phase}
      onKeyDown={suppressButtonShortcutDuplication}
    >
      <header className={styles.stageHeader}>
        <div>
          <p className={styles.eyebrow}>{view.eyebrow}</p>
          <h1 id={titleId}>{view.title}</h1>
        </div>
        <span className={styles.puzzleId}>{view.puzzleId}</span>
      </header>

      <div className={styles.workspace}>
        <TargetPreview label={view.labels.target} model={view.target} />

        <section
          aria-label={view.board.label}
          className={styles.boardPanel}
          data-board-panel="true"
        >
          <div
            aria-label={view.labels.columnAxis}
            className={styles.columnRail}
            role="group"
            style={gridStyle}
          >
            {view.columns.map((item) => (
              <div className={styles.axisSlot} key={item.index}>
                <AxisToggle axis="column" item={item} onToggle={callbacks.onToggleColumn} />
              </div>
            ))}
          </div>

          <div className={styles.matrix}>
            <div
              aria-label={view.labels.rowAxis}
              className={styles.rowRail}
              role="group"
              style={gridStyle}
            >
              {view.rows.map((item) => (
                <div className={styles.axisSlot} key={item.index}>
                  <AxisToggle axis="row" item={item} onToggle={callbacks.onToggleRow} />
                </div>
              ))}
            </div>
            <div className={styles.board} data-tensor-board="true">
              <TensorGrid model={view.board} />
            </div>
          </div>
        </section>

        <div className={styles.bottomAction} data-bottom-action="true">
          <PulseButton
            affectedLabel={view.controls.affectedCellsLabel}
            disabled={!view.controls.pulseEnabled}
            label={view.labels.pulse}
            locked={view.controls.pulseLocked}
            onPulse={requestPulse}
            statusLabel={view.controls.pulseStatusLabel}
          />
        </div>

        <aside className={styles.side} data-game-side="true">
          <StatusStrip status={view.status} />
          {view.controls.disabledReason ? (
            <Toast tone={view.phase === 'error' ? 'error' : 'warning'}>
              {view.controls.disabledReason}
            </Toast>
          ) : null}
          {view.error ? (
            <section className={styles.errorPanel}>
              <h2>{view.error.heading}</h2>
              <p>{view.error.description}</p>
              <Button onClick={callbacks.onRecover} variant="primary">
                {view.error.recoverLabel}
              </Button>
            </section>
          ) : (
            <>
              <Button
                aria-keyshortcuts="Z"
                disabled={!view.controls.undoEnabled}
                fullWidth
                onClick={callbacks.onUndo}
                variant="secondary"
              >
                ↶ {view.labels.undo}
              </Button>
              <HintPanel
                description={view.labels.hintDescription}
                disabled={!view.controls.hintEnabled}
                heading={view.labels.hintHeading}
                label={view.labels.hint}
                onHint={callbacks.onHint}
              />
              <Button
                aria-keyshortcuts="Shift+R"
                disabled={!view.controls.resetEnabled}
                fullWidth
                onClick={() => setResetState({ open: true, puzzleId: view.puzzleId })}
                variant="secondary"
              >
                ↻ {view.labels.reset}
              </Button>
              {view.result ? <ResultPanel labels={view.labels} result={view.result} /> : null}
            </>
          )}
        </aside>
      </div>

      <Dialog
        cancelLabel={view.labels.cancel}
        confirmLabel={view.labels.confirmReset}
        description={view.labels.resetDescription}
        eyebrow={view.eyebrow}
        onClose={() => setResetState({ open: false, puzzleId: view.puzzleId })}
        onConfirm={callbacks.onResetConfirmed}
        open={resetOpen}
        title={view.labels.resetHeading}
      />
    </article>
  );
}
