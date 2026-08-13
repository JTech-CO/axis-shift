import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ko } from '../i18n';
import { AppErrorBoundary } from './error-boundary';

function BrokenView(): never {
  throw new Error('intentional test error');
}

describe('AppErrorBoundary', () => {
  it('renders a localized recovery action', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      render(
        <AppErrorBoundary>
          <BrokenView />
        </AppErrorBoundary>,
      );

      expect(
        screen.getByRole('heading', { level: 1, name: ko['error.title'] }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: ko['error.reload'] })).toBeInTheDocument();
    } finally {
      consoleError.mockRestore();
    }
  });
});
