import { Link } from 'react-router-dom';

import { t } from '../../i18n';

export function RecoveryPage() {
  return (
    <section aria-labelledby="recovery-title" className="page stack">
      <h1 id="recovery-title">{t('recovery.title')}</h1>
      <p>{t('recovery.description')}</p>
      <p>
        <Link to="/">{t('recovery.backHome')}</Link>
      </p>
    </section>
  );
}
