import { Component, type ErrorInfo, type PropsWithChildren } from 'react';

import { t } from '../i18n';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <main className="error-page page stack" id="main-content">
          <section aria-labelledby="error-title" role="alert">
            <h1 id="error-title">{t('error.title')}</h1>
            <p>{t('error.description')}</p>
            <button type="button" onClick={() => window.location.reload()}>
              {t('error.reload')}
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
