import { defineConfig, mergeConfig } from 'vitest/config';

import baseConfig from './vitest.config.ts';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: [
        'src/domain/session/**/*.test.ts',
        'src/domain/scoring/**/*.test.ts',
        'src/services/clock/**/*.test.ts',
        'src/services/id/**/*.test.ts',
        'src/services/storage/**/*.test.ts',
      ],
      coverage: {
        include: [
          'src/domain/session/session.ts',
          'src/domain/session/session-reducer.ts',
          'src/domain/session/session-selectors.ts',
          'src/domain/scoring/grade.ts',
          'src/domain/scoring/best-record.ts',
          'src/services/clock/clock.ts',
          'src/services/id/id-generator.ts',
          'src/services/storage/schema.ts',
          'src/services/storage/migrations.ts',
          'src/services/storage/local-storage-adapter.ts',
          'src/services/storage/repository.ts',
        ],
        thresholds: {
          branches: 95,
          perFile: true,
        },
      },
    },
  }),
);
