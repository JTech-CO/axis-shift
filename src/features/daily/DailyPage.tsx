import { t } from '../../i18n';

export function DailyPage() {
  return (
    <section aria-labelledby="daily-title" className="page stack">
      <h1 id="daily-title">{t('daily.title')}</h1>
      <p>{t('daily.description')}</p>
    </section>
  );
}
