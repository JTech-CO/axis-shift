import { copyFile, lstat, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build, type Plugin } from 'vite';

import { PROJECT_ROOT, projectPath } from './lib/project-files.ts';

export const PAGES_OUTPUT_ROOT = path.join(PROJECT_ROOT, 'pages-dist');

const PROTOTYPE_SOURCE_ROOT = path.join(PROJECT_ROOT, 'prototypes', 'rule-proof');
const PROTOTYPE_OUTPUT_ROOT = path.join(PAGES_OUTPUT_ROOT, 'prototypes', 'rule-proof');
const PROTOTYPE_SOURCE_INDEX = path.join(PROTOTYPE_SOURCE_ROOT, 'index.html');
const PROTOTYPE_LEGACY_FILENAME = 'legacy.html';
const PROTOTYPE_RUNTIME_FILES = [
  'styles.css',
  'game.mjs',
  'core.mjs',
  'difficulty.mjs',
  'fixtures.mjs',
  'm00-seeded-generator.mjs',
  'play-analysis.mjs',
  'session.mjs',
  'stopwatch.mjs',
] as const;

const PAGES_BRIDGE_SCRIPT = `
(() => {
  const { hash, search } = window.location;
  if (!search && hash.startsWith('#/')) return;

  const target = search || hash
    ? new URL('./prototypes/rule-proof/', window.location.href)
    : new URL('./', window.location.href);
  target.search = search;
  target.hash = search || hash ? hash : '#/';
  window.location.replace(target);
})();
`.trim();

const PROTOTYPE_BRIDGE_SCRIPT = `
(() => {
  const { hash, search } = window.location;
  if (search || (hash && !hash.startsWith('#/'))) {
    const legacyTarget = new URL('./${PROTOTYPE_LEGACY_FILENAME}', window.location.href);
    legacyTarget.search = search;
    legacyTarget.hash = hash;
    window.location.replace(legacyTarget);
    return;
  }

  const productTarget = new URL('../../', window.location.href);
  productTarget.hash = hash || '#/';
  window.location.replace(productTarget);
})();
`.trim();

const PROTOTYPE_BRIDGE_DOCUMENT = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AXIS//SHIFT — Redirecting</title>
    <link rel="icon" href="data:," />
    <script data-axis-shift-prototype-bridge>${PROTOTYPE_BRIDGE_SCRIPT}</script>
  </head>
  <body>
    <noscript><a href="../../#/">AXIS//SHIFT 플레이 화면으로 이동</a></noscript>
  </body>
</html>
`;
function pagesBridgePlugin(): Plugin {
  return {
    name: 'axis-shift-pages-compatibility-bridge',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { 'data-axis-shift-pages-bridge': '' },
          children: PAGES_BRIDGE_SCRIPT,
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

function assertSafeOutputRoot(): void {
  const resolvedOutput = path.resolve(PAGES_OUTPUT_ROOT);
  const expectedOutput = path.join(path.resolve(PROJECT_ROOT), 'pages-dist');

  if (
    resolvedOutput !== expectedOutput ||
    path.dirname(resolvedOutput) !== path.resolve(PROJECT_ROOT) ||
    path.basename(resolvedOutput) !== 'pages-dist'
  ) {
    throw new Error(`Refusing to clean unsafe Pages output path: ${resolvedOutput}`);
  }
}

async function copyPrototypeRuntime(): Promise<void> {
  await mkdir(PROTOTYPE_OUTPUT_ROOT, { recursive: true });
  for (const filename of PROTOTYPE_RUNTIME_FILES) {
    await copyFile(
      path.join(PROTOTYPE_SOURCE_ROOT, filename),
      path.join(PROTOTYPE_OUTPUT_ROOT, filename),
    );
  }
  await copyFile(
    PROTOTYPE_SOURCE_INDEX,
    path.join(PROTOTYPE_OUTPUT_ROOT, PROTOTYPE_LEGACY_FILENAME),
  );
  await writeFile(
    path.join(PROTOTYPE_OUTPUT_ROOT, 'index.html'),
    PROTOTYPE_BRIDGE_DOCUMENT,
    'utf8',
  );
}

interface ArtifactSummary {
  readonly bytes: number;
  readonly files: number;
}

async function inspectArtifact(root: string): Promise<ArtifactSummary> {
  let bytes = 0;
  let files = 0;
  const directories = [root];

  while (directories.length > 0) {
    const directory = directories.pop();
    if (!directory) continue;
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      const metadata = await lstat(absolutePath);
      if (metadata.isSymbolicLink()) {
        throw new Error(`Pages artifact cannot contain symlinks: ${projectPath(absolutePath)}`);
      }
      if (metadata.isDirectory()) {
        directories.push(absolutePath);
      } else if (metadata.isFile()) {
        if (metadata.nlink > 1) {
          throw new Error(`Pages artifact cannot contain hard links: ${projectPath(absolutePath)}`);
        }
        files += 1;
        bytes += metadata.size;
      }
    }
  }

  return { bytes, files };
}

async function validateArtifact(): Promise<ArtifactSummary> {
  const requiredFiles = [
    path.join(PAGES_OUTPUT_ROOT, 'index.html'),
    path.join(PAGES_OUTPUT_ROOT, '.nojekyll'),
    path.join(PROTOTYPE_OUTPUT_ROOT, 'index.html'),
    path.join(PROTOTYPE_OUTPUT_ROOT, PROTOTYPE_LEGACY_FILENAME),
    ...PROTOTYPE_RUNTIME_FILES.map((filename) => path.join(PROTOTYPE_OUTPUT_ROOT, filename)),
  ];

  for (const filename of requiredFiles) {
    const metadata = await lstat(filename);
    if (!metadata.isFile()) {
      throw new Error(`Required Pages artifact entry is not a file: ${projectPath(filename)}`);
    }
  }

  const indexSource = await readFile(path.join(PAGES_OUTPUT_ROOT, 'index.html'), 'utf8');
  if (!indexSource.includes('data-axis-shift-pages-bridge')) {
    throw new Error('Pages artifact is missing the root compatibility bridge.');
  }

  const prototypeIndexSource = await readFile(
    path.join(PROTOTYPE_OUTPUT_ROOT, 'index.html'),
    'utf8',
  );
  if (!prototypeIndexSource.includes('data-axis-shift-prototype-bridge')) {
    throw new Error('Pages artifact is missing the submitted URL compatibility bridge.');
  }

  const legacySource = await readFile(
    path.join(PROTOTYPE_OUTPUT_ROOT, PROTOTYPE_LEGACY_FILENAME),
    'utf8',
  );
  if (!legacySource.includes('id="app"') || !legacySource.includes('./game.mjs')) {
    throw new Error('Pages artifact is missing the playable legacy H00 document.');
  }

  return inspectArtifact(PAGES_OUTPUT_ROOT);
}

export async function buildPages(): Promise<ArtifactSummary> {
  assertSafeOutputRoot();
  await rm(PAGES_OUTPUT_ROOT, { force: true, recursive: true });

  if (!process.env.VITE_BASE_PATH?.trim()) {
    process.env.VITE_BASE_PATH = '/axis-shift/';
  }

  await build({
    root: PROJECT_ROOT,
    configFile: path.join(PROJECT_ROOT, 'vite.config.ts'),
    plugins: [pagesBridgePlugin()],
    build: {
      emptyOutDir: false,
      outDir: PAGES_OUTPUT_ROOT,
    },
  });

  await copyPrototypeRuntime();
  await writeFile(path.join(PAGES_OUTPUT_ROOT, '.nojekyll'), '', 'utf8');

  const summary = await validateArtifact();
  console.log(
    `pagesArtifact path=${projectPath(PAGES_OUTPUT_ROOT)} files=${summary.files} bytes=${summary.bytes} prototypeFiles=${PROTOTYPE_RUNTIME_FILES.length + 2}`,
  );
  return summary;
}

const invokedScript = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedScript === fileURLToPath(import.meta.url)) {
  await buildPages();
}
