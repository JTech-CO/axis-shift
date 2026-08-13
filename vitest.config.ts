import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    coverage: {
      exclude: ['src/main.tsx', 'src/test/**', 'src/vite-env.d.ts'],
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
    },
    environment: 'jsdom',
    exclude: ['tests/e2e/**', 'tests/pages/**', 'node_modules/**', 'dist/**', 'pages-dist/**'],
    restoreMocks: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
