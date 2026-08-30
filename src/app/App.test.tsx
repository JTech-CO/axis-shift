import { fireEvent, screen, within } from '@testing-library/react';
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

  it('renders the first Tutorial step on its canonical query route', () => {
    renderAppAt('#/tutorial?step=1');

    expect(
      screen.getByRole('heading', { level: 1, name: ko['level.tutorial.01.title'] }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(ko['tutorial.coachmarkLabel'])).toBeInTheDocument();
    const shellHeader = screen.getByRole('link', { name: ko['app.brand.name'] }).closest('header');
    if (!shellHeader) throw new Error('The application shell header must contain the brand link.');
    const header = within(shellHeader);
    expect(header.queryByRole('navigation')).not.toBeInTheDocument();
    expect(header.getByText(ko['app.nav.tutorial'])).toBeInTheDocument();
    expect(header.getByRole('link', { name: ko['app.brand.name'] })).toHaveAttribute('href', '#/');
    expect(screen.getByText(ko['app.status.tutorial'])).toBeInTheDocument();
  });

  it('renders all 48 open Lab routes from the chapter index', () => {
    renderAppAt('#/lab');

    expect(screen.getByRole('heading', { level: 1, name: ko['lab.title'] })).toBeInTheDocument();
    expect(within(screen.getByRole('main')).getAllByRole('listitem')).toHaveLength(48);
    expect(screen.getByRole('link', { name: ko['app.nav.lab'] })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('status')).toHaveTextContent(ko['app.status.lab']);
  });

  it('recovers a non-allowlisted Lab level without starting a session', () => {
    renderAppAt('#/lab/not-a-level');

    expect(
      screen.getByRole('heading', { level: 1, name: ko['lab.error.unknownLevel.title'] }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: ko['lab.error.unknownLevel.back'] })).toHaveAttribute(
      'href',
      '#/lab',
    );
    expect(screen.getByRole('status')).toHaveTextContent(ko['app.status.labLevel']);
  });
});
