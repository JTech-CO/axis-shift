import styles from './Footer.module.css';

export interface FooterProps {
  readonly status: string;
}

export function Footer({ status }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <p aria-atomic="true" aria-live="polite" className={styles.status} role="status">
        {status}
      </p>
    </footer>
  );
}
