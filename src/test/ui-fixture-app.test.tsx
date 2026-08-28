import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UiFixtureApp } from './ui-fixture-app';

describe('UiFixtureApp', () => {
  it('cycles the theme button from dark to light to system without navigation', () => {
    window.history.replaceState(null, '', '/tests/ui-fixtures/?fixture=preview');
    render(<UiFixtureApp />);

    const originalHref = window.location.href;
    const theme = screen.getByRole('button', { name: 'Theme: dark; next: light' });
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    fireEvent.click(theme);
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(theme).toHaveAccessibleName('Theme: light; next: system');

    fireEvent.click(theme);
    expect(document.documentElement).toHaveAttribute('data-theme', 'system');
    expect(theme).toHaveAccessibleName('Theme: system; next: dark');

    fireEvent.click(theme);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(theme).toHaveAccessibleName('Theme: dark; next: light');
    expect(screen.queryByText(/high-contrast/i)).not.toBeInTheDocument();
    expect(window.location.href).toBe(originalHref);
  });

  it('toggles the motion button between system and reduced', () => {
    window.history.replaceState(null, '', '/tests/ui-fixtures/?fixture=preview');
    render(<UiFixtureApp />);

    const motion = screen.getByRole('button', { name: 'Motion: system; next: reduced' });
    expect(motion).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement).toHaveAttribute('data-motion', 'system');

    fireEvent.click(motion);
    expect(document.documentElement).toHaveAttribute('data-motion', 'reduced');
    expect(motion).toHaveAttribute('aria-pressed', 'true');
    expect(motion).toHaveAccessibleName('Motion: reduced; next: system');

    fireEvent.click(motion);
    expect(document.documentElement).toHaveAttribute('data-motion', 'system');
    expect(motion).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders the complete state gallery', () => {
    window.history.replaceState(null, '', '/tests/ui-fixtures/?gallery=1');
    render(<UiFixtureApp />);

    expect(screen.getAllByText(/STATE \//)).toHaveLength(8);
    expect(document.querySelectorAll('[data-game-stage="true"]')).toHaveLength(8);
  });
});
