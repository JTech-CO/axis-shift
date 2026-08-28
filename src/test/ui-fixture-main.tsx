import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '../styles/reset.css';
import '../styles/tokens.css';
import '../styles/global.css';
import '../styles/utilities.css';
import { UiFixtureApp } from './ui-fixture-app';

document.documentElement.lang = 'ko';
document.title = 'AXIS//SHIFT — M05 UI Fixtures';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('UI fixture root is missing.');

createRoot(rootElement).render(
  <StrictMode>
    <UiFixtureApp />
  </StrictMode>,
);
