import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button';
import { Dialog } from './Dialog';

function DialogHarness({ onConfirm = vi.fn() }: { readonly onConfirm?: () => void }) {
  const onClose = vi.fn();
  return (
    <>
      <Button>열기 기준점</Button>
      <Dialog
        cancelLabel="취소"
        confirmLabel="초기화"
        description="기록이 지워집니다."
        onClose={onClose}
        onConfirm={onConfirm}
        open
        title="초기화할까요?"
      />
    </>
  );
}

describe('Dialog', () => {
  it('moves focus inside and traps Tab at both ends', async () => {
    render(<DialogHarness />);
    const cancel = screen.getByRole('button', { name: '취소' });
    const confirm = screen.getByRole('button', { name: '초기화' });

    await waitFor(() => expect(cancel).toHaveFocus());
    confirm.focus();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab' });
    expect(cancel).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab', shiftKey: true });
    expect(confirm).toHaveFocus();
  });

  it('confirms through one explicit action', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<DialogHarness onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: '초기화' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
