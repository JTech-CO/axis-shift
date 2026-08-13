import { render } from '@testing-library/react';

import { App } from '../app';

export function renderAppAt(hashPath: string) {
  window.history.replaceState(null, '', `/${hashPath}`);
  return render(<App />);
}
