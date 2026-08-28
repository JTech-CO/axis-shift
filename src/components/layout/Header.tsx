import { Link } from 'react-router-dom';

import styles from './Header.module.css';

export interface HeaderProps {
  readonly brand: string;
  readonly daily: string;
  readonly home: string;
  readonly navigation: string;
  readonly pathname: string;
}

export function Header({ brand, daily, home, navigation, pathname }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} to="/">
          <span aria-hidden="true" className={styles.mark}>
            //
          </span>
          {brand}
        </Link>
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
                aria-current={pathname === '/daily' ? 'page' : undefined}
                className={styles.link}
                to="/daily"
              >
                {daily}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
