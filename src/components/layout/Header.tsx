import { Link } from 'react-router-dom';

import styles from './Header.module.css';

export interface HeaderProps {
  readonly brand: string;
  readonly daily: string;
  readonly gameplayContext?: string;
  readonly lab: string;
  readonly home: string;
  readonly navigation: string;
  readonly pathname: string;
  readonly tutorial: string;
}

export function Header({
  brand,
  daily,
  gameplayContext,
  home,
  lab,
  navigation,
  pathname,
  tutorial,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} to="/">
          <span aria-hidden="true" className={styles.mark}>
            //
          </span>
          {brand}
        </Link>
        {gameplayContext ? (
          <p className={styles.context}>{gameplayContext}</p>
        ) : (
          <nav aria-label={navigation}>
            <ul className={styles.navigation}>
              <li>
                <Link
                  aria-current={pathname === '/' ? 'page' : undefined}
                  className={styles.link}
                  to="/"
                >
                  {home}
                </Link>
              </li>
              <li>
                <Link
                  aria-current={pathname === '/tutorial' ? 'page' : undefined}
                  className={styles.link}
                  to="/tutorial"
                >
                  {tutorial}
                </Link>
              </li>
              <li>
                <Link
                  aria-current={
                    pathname === '/lab' || pathname.startsWith('/lab/') ? 'page' : undefined
                  }
                  className={styles.link}
                  to="/lab"
                >
                  {lab}
                </Link>
              </li>
              <li>
                <Link
                  aria-current={pathname === '/daily' ? 'page' : undefined}
                  className={styles.link}
                  to="/daily"
                >
                  {daily}
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
