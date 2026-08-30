import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { LAB_LEVELS } from '../../content';
import type { PuzzleBestRecord } from '../../domain';
import { ko } from '../../i18n';
import { LabPage } from './LabPage';

const firstLevel = LAB_LEVELS[0];
if (!firstLevel) throw new Error('Lab catalog requires at least one level.');

const completedRecord: PuzzleBestRecord = {
  bestElapsedMs: 2_400,
  bestGrade: 'S',
  bestPulseCount: firstLevel.optimalPulseCount,
  completed: true,
  firstCompletedAt: '2026-08-29T00:00:00.000Z',
  lastCompletedAt: '2026-08-29T00:00:00.000Z',
  puzzleId: firstLevel.id,
};

describe('LabPage', () => {
  it('renders four chapters and all 48 freely accessible levels', () => {
    render(
      <MemoryRouter>
        <LabPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText(new RegExp(`^${ko['lab.chapterLabel']}\\s\\d$`, 'u'))).toHaveLength(
      4,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(48);
    expect(screen.getAllByRole('link')).toHaveLength(48);
  });

  it('shows saved grade and progress while keeping the level replayable', () => {
    render(
      <MemoryRouter>
        <LabPage records={{ [firstLevel.id]: completedRecord }} />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(ko['lab.progressLabel'])).toHaveTextContent('1 / 48');
    const firstLink = screen.getByRole('link', {
      name: new RegExp(ko['lab.levelCompleted'], 'u'),
    });
    expect(firstLink).toHaveAttribute('href', `/lab/${firstLevel.id}`);
    expect(firstLink).toHaveTextContent('S');
  });
});
