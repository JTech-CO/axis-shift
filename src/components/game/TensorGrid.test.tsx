import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GAME_UI_FIXTURES } from '../../test/fixtures/game-ui';
import { TensorGrid } from './TensorGrid';

describe('TensorGrid', () => {
  it('renders a labelled 6x6 grid with non-color preview semantics', () => {
    const model = GAME_UI_FIXTURES.preview.board;
    render(<TensorGrid model={model} />);

    expect(screen.getByRole('grid', { name: model.label })).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(36);
    expect(document.querySelectorAll('[data-preview="turn-on"]').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('[data-preview="turn-off"]').length).toBeGreaterThan(0);
    expect(screen.getByText(model.summary)).toBeInTheDocument();
  });

  it('uses unique summary relationships for repeated localized labels', () => {
    const model = GAME_UI_FIXTURES.preview.board;
    render(
      <>
        <TensorGrid model={model} />
        <TensorGrid model={model} />
      </>,
    );

    const summaryIds = screen
      .getAllByRole('grid', { name: model.label })
      .map((grid) => grid.getAttribute('aria-describedby'));
    expect(new Set(summaryIds).size).toBe(2);
    for (const summaryId of summaryIds) {
      expect(summaryId).not.toBeNull();
      expect(document.getElementById(summaryId ?? '')).toHaveTextContent(model.summary);
    }
  });
});
