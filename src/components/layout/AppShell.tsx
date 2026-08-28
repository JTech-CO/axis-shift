import type { MouseEvent, PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';

import { Footer } from './Footer';
import { Header } from './Header';
import styles from './AppShell.module.css';

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
  if (pathname === '/') return labels.statusHome;
  if (pathname === '/daily') return labels.statusDaily;
  return labels.statusRecovery;
}

function focusMainContent(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  document.getElementById('main-content')?.focus();
}

export function AppShell({ children, labels }: PropsWithChildren<{ labels: AppShellLabels }>) {
  const { pathname } = useLocation();

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content" onClick={focusMainContent}>
        {labels.skipToContent}
      </a>
      <Header
        brand={labels.brand}
        daily={labels.daily}
        home={labels.home}
        navigation={labels.navigation}
        pathname={pathname}
      />
      <main className={styles.main} id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer status={getRouteStatus(pathname, labels)} />
    </div>
  );
}
