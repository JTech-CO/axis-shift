import { t } from '../../i18n';

export function HomePage() {
  return (
    <section aria-labelledby="home-title" className="page stack">
      <h1 id="home-title">{t('home.title')}</h1>
      <p>{t('home.description')}</p>
    </section>
  );
}
