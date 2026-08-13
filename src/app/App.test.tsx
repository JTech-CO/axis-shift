import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ko } from '../i18n';
import { renderAppAt } from '../test/test-utils';

describe('application routes', () => {
  it('renders the home route', () => {
    renderAppAt('#/');

    expect(screen.getByRole('heading', { level: 1, name: ko['home.title'] })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: ko['app.nav.label'] })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ko['app.nav.home'] })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('status')).toHaveTextContent(ko['app.status.home']);
  });

  it('focuses main content without leaving the hash route', () => {
    renderAppAt('#/daily');

    fireEvent.click(screen.getByRole('link', { name: ko['app.skipToContent'] }));

    expect(screen.getByRole('main')).toHaveFocus();
    expect(window.location.hash).toBe('#/daily');
  });

  it('renders the daily route', () => {
    renderAppAt('#/daily');

    expect(screen.getByRole('heading', { level: 1, name: ko['daily.title'] })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ko['app.nav.daily'] })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('status')).toHaveTextContent(ko['app.status.daily']);
  });

  it('recovers from an unknown route', () => {
    renderAppAt('#/unknown');

    expect(
      screen.getByRole('heading', { level: 1, name: ko['recovery.title'] }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ko['recovery.backHome'] })).toHaveAttribute(
      'href',
      '#/',
    );
    expect(screen.getByRole('status')).toHaveTextContent(ko['app.status.recovery']);
  });
});
