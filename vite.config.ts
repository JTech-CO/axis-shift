import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export function normalizeBasePath(rawBasePath: string | undefined): string {
  const value = rawBasePath?.trim() || '/';

  if (value.includes('\\')) {
    throw new Error('VITE_BASE_PATH must use forward slashes.');
  }

  if (!value.startsWith('/') || value.includes('?') || value.includes('#')) {
    throw new Error('VITE_BASE_PATH must be an absolute URL path without query or hash.');
  }

  const normalized = value.replace(/\/{2,}/g, '/');
  const segments = normalized.split('/');
  if (segments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error('VITE_BASE_PATH cannot contain dot segments.');
  }

  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

export default defineConfig(({ mode }) => {
  const fileEnvironment = loadEnv(mode, process.cwd(), 'VITE_');
  const basePath = process.env.VITE_BASE_PATH ?? fileEnvironment.VITE_BASE_PATH;

  return {
    base: normalizeBasePath(basePath),
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});
