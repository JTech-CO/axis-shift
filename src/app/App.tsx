import { AppShell } from '../components/layout';
import { t } from '../i18n';
import { AppErrorBoundary } from './error-boundary';
import { AppProviders } from './providers';
import { AppRouter } from './router';

export function App() {
  const shellLabels = {
    brand: t('app.brand.name'),
    daily: t('app.nav.daily'),
    home: t('app.nav.home'),
    navigation: t('app.nav.label'),
    skipToContent: t('app.skipToContent'),
    statusDaily: t('app.status.daily'),
    statusHome: t('app.status.home'),
    statusRecovery: t('app.status.recovery'),
  };

  return (
    <AppErrorBoundary>
      <AppProviders>
        <AppShell labels={shellLabels}>
          <AppRouter />
        </AppShell>
      </AppProviders>
    </AppErrorBoundary>
  );
}
