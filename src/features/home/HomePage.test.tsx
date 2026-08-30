import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ko } from '../../i18n';
import { HomePage } from './HomePage';

function renderHome(props: React.ComponentProps<typeof HomePage> = {}) {
  return render(
    <MemoryRouter>
      <HomePage {...props} />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('makes Tutorial the first-run primary action and exposes all mode skeletons', () => {
    renderHome();

    expect(screen.getByRole('link', { name: ko['home.primaryTutorial'] })).toHaveAttribute(
      'href',
      '/tutorial',
    );
    expect(screen.getByRole('heading', { name: ko['home.dailyTitle'] })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: ko['home.labTitle'] })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: ko['home.sprintTitle'] })).toBeInTheDocument();
  });

  it('switches the primary action to Lab after Tutorial acknowledgement', () => {
    renderHome({ labCompletedCount: 7, tutorialCompleted: true });

    expect(screen.getAllByRole('link', { name: ko['home.primaryLab'] })[0]).toHaveAttribute(
      'href',
      '/lab',
    );
    expect(screen.getByText(/7 \/ 48/u)).toBeInTheDocument();
  });

  it('shows a valid resumable destination without hiding Tutorial replay', () => {
    renderHome({
      resume: { mode: 'lab', puzzleId: 'lab-01-pulse-04' },
      tutorialCompleted: true,
    });

    expect(screen.getByRole('link', { name: ko['home.resumeAction'] })).toHaveAttribute(
      'href',
      '/lab/lab-01-pulse-04',
    );
    expect(screen.getByRole('link', { name: ko['home.tutorialReplay'] })).toHaveAttribute(
      'href',
      '/tutorial',
    );
  });
});
