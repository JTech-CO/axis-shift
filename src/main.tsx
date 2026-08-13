import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';
import { DEFAULT_LOCALE, t } from './i18n';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/global.css';
import './styles/utilities.css';

document.documentElement.lang = DEFAULT_LOCALE;
document.title = t('app.meta.title');

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
