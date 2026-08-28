import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Button } from './Button';
import { IconButton } from './IconButton';
import { Toast } from './Toast';

describe('common controls', () => {
  it('keeps Button native and forwards its ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} variant="primary">
        실행
      </Button>,
    );

    expect(screen.getByRole('button', { name: '실행' })).toHaveAttribute('type', 'button');
    expect(ref.current).toBe(screen.getByRole('button', { name: '실행' }));
  });

  it('requires an accessible IconButton name', () => {
    render(<IconButton aria-label="설정" icon={<span>⚙</span>} />);

    expect(screen.getByRole('button', { name: '설정' })).toBeInTheDocument();
    expect(screen.getByText('⚙').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('uses status and alert semantics by toast tone', () => {
    const { rerender } = render(<Toast>저장됨</Toast>);
    expect(screen.getByRole('status')).toHaveTextContent('저장됨');

    rerender(<Toast tone="error">저장 실패</Toast>);
    expect(screen.getByRole('alert')).toHaveTextContent('저장 실패');
  });
});
