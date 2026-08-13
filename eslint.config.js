import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function toPosix(value) {
  return value.replaceAll('\\', '/');
}

function featureNameFromPath(value) {
  return /\/src\/features\/([^/]+)(?:\/|$)/u.exec(toPosix(value))?.[1];
}

function importedFeatureName(filename, source) {
  const aliasMatch = /^@\/features\/([^/]+)(?:\/|$)/u.exec(source);
  if (aliasMatch) {
    return aliasMatch[1];
  }

  if (!source.startsWith('.')) {
    return undefined;
  }

  return featureNameFromPath(path.resolve(path.dirname(filename), source));
}

const noCrossFeatureImports = {
  meta: {
    docs: { description: 'Disallow imports between feature modules.' },
    messages: {
      crossFeature:
        'Feature "{{from}}" cannot import feature "{{to}}". Compose in app or game-session.',
    },
    schema: [],
    type: 'problem',
  },
  create(context) {
    const filename = context.filename ?? context.getFilename();
    const currentFeature = featureNameFromPath(filename);

    return {
      ImportDeclaration(node) {
        if (!currentFeature || typeof node.source.value !== 'string') {
          return;
        }

        const importedFeature = importedFeatureName(filename, node.source.value);
        if (importedFeature && importedFeature !== currentFeature) {
          context.report({
            data: { from: currentFeature, to: importedFeature },
            messageId: 'crossFeature',
            node,
          });
        }
      },
    };
  },
};

const restrictedDomainImports = [
  'react',
  'react-dom',
  'react-dom/*',
  'react-router-dom',
  '@/app',
  '@/app/*',
  '@/components',
  '@/components/*',
  '@/content',
  '@/content/*',
  '@/features',
  '@/features/*',
  '@/i18n',
  '@/i18n/*',
  '@/services',
  '@/services/*',
];
const restrictedBrowserServiceGlobals = [
  'XMLHttpRequest',
  'fetch',
  'localStorage',
  'navigator',
  'sessionStorage',
];

export default tseslint.config(
  {
    ignores: [
      'AXIS_SHIFT_Harness_KR/**',
      'coverage/**',
      'dist/**',
      'docs/**',
      'node_modules/**',
      'outputs/**',
      'pages-dist/**',
      'playwright-report/**',
      'prototypes/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: {
      'axis-shift': { rules: { 'no-cross-feature-imports': noCrossFeatureImports } },
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      'axis-shift/no-cross-feature-imports': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...[
          'Date',
          'XMLHttpRequest',
          'crypto',
          'document',
          'fetch',
          'localStorage',
          'navigator',
          'performance',
          'sessionStorage',
          'setTimeout',
          'window',
        ].map((name) => ({ message: `${name} is not allowed in the pure domain layer.`, name })),
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: restrictedDomainImports,
              message: 'The domain layer may only depend on its own pure modules.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          message: 'Math.random() is forbidden in deterministic domain code.',
          selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
        },
      ],
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/services', '@/services/*'],
              message: 'Presentational components receive service results through props.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...restrictedBrowserServiceGlobals.map((name) => ({
          message: `${name} must be accessed through a service adapter.`,
          name,
        })),
      ],
    },
  },
  {
    files: ['scripts/**/*.ts', '*.config.{js,ts}', 'tests/**/*.ts'],
    languageOptions: { globals: globals.node },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
);

void projectRoot;
