import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

import { Button } from './Button';
import styles from './Dialog.module.css';

export interface DialogProps {
  readonly cancelLabel: string;
  readonly children?: ReactNode;
  readonly confirmLabel?: string;
  readonly description?: string;
  readonly eyebrow?: string;
  readonly open: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly onConfirm?: () => void;
}

const focusableSelector =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  cancelLabel,
  children,
  confirmLabel,
  description,
  eyebrow,
  open,
  title,
  onClose,
  onConfirm,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      }
      cancelRef.current?.focus();
      return;
    }

    if (dialog.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
    restoreFocusRef.current?.focus();
  }, [open]);

  function trapFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)];
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={trapFocus}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h2 id={titleId}>{title}</h2>
        </header>
        {description ? <p id={descriptionId}>{description}</p> : null}
        {children}
        <footer className={styles.actions}>
          <Button ref={cancelRef} onClick={onClose} variant="quiet">
            {cancelLabel}
          </Button>
          {confirmLabel && onConfirm ? (
            <Button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              variant="danger"
            >
              {confirmLabel}
            </Button>
          ) : null}
        </footer>
      </div>
    </dialog>
  );
}
