import type { MouseEvent, PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface AppShellLabels {
  readonly brand: string;
  readonly daily: string;
  readonly home: string;
  readonly navigation: string;
  readonly skipToContent: string;
  readonly statusDaily: string;
  readonly statusHome: string;
  readonly statusRecovery: string;
}

function getRouteStatus(pathname: string, labels: AppShellLabels): string {
  if (pathname === '/') {
    return labels.statusHome;
  }

  if (pathname === '/daily') {
    return labels.statusDaily;
  }

  return labels.statusRecovery;
}

function focusMainContent(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document.getElementById('main-content')?.focus();
}

export function AppShell({ children, labels }: PropsWithChildren<{ labels: AppShellLabels }>) {
  const { pathname } = useLocation();

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content" onClick={focusMainContent}>
        {labels.skipToContent}
      </a>
      <header className="shell-header">
        <Link className="brand" to="/">
          {labels.brand}
        </Link>
        <nav aria-label={labels.navigation}>
          <ul className="shell-nav cluster">
            <li>
              <Link aria-current={pathname === '/' ? 'page' : undefined} to="/">
                {labels.home}
              </Link>
            </li>
            <li>
              <Link aria-current={pathname === '/daily' ? 'page' : undefined} to="/daily">
                {labels.daily}
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="shell-main" id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="route-status">
        <p aria-atomic="true" aria-live="polite" role="status">
          {getRouteStatus(pathname, labels)}
        </p>
      </footer>
    </div>
  );
}
