import { defineConfig, mergeConfig } from 'vitest/config';

import baseConfig from './vitest.config.ts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        include: [
          'src/domain/board/board.ts',
          'src/domain/board/guards.ts',
          'src/domain/board/pulse.ts',
          'src/domain/algebra/factorization.ts',
          'src/domain/algebra/gf2-rank.ts',
        ],
        thresholds: {
          branches: 100,
          functions: 100,
          lines: 100,
          perFile: true,
          statements: 100,
        },
      },
    },
  }),
);
