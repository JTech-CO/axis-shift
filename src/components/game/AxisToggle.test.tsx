import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AxisToggle } from './AxisToggle';

describe('AxisToggle', () => {
  it('exposes selected state without relying on color', () => {
    const onToggle = vi.fn();
    render(
      <AxisToggle
        axis="row"
        item={{
          accessibleLabel: '행 A 선택됨',
          disabled: false,
          index: 0,
          label: 'A',
          selected: true,
        }}
        onToggle={onToggle}
      />,
    );

    const button = screen.getByRole('button', { name: '행 A 선택됨' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('data-selected', 'true');

    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledWith(0);
  });
});
