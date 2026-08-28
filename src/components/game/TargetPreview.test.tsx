import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GAME_UI_FIXTURES } from '../../test/fixtures/game-ui';
import { TargetPreview } from './TargetPreview';

describe('TargetPreview', () => {
  it('uses unique heading relationships for repeated localized labels', () => {
    const model = GAME_UI_FIXTURES.preview.target;
    render(
      <>
        <TargetPreview label="목표" model={model} />
        <TargetPreview label="목표" model={model} />
      </>,
    );

    const headingIds = screen
      .getAllByRole('region', { name: '목표' })
      .map((region) => region.getAttribute('aria-labelledby'));
    expect(new Set(headingIds).size).toBe(2);
    for (const headingId of headingIds) {
      expect(headingId).not.toBeNull();
      expect(document.getElementById(headingId ?? '')).toHaveTextContent('목표');
    }
  });
});
