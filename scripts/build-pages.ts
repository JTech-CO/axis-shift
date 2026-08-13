import { copyFile, lstat, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { build, type Plugin } from 'vite';

import { PROJECT_ROOT, projectPath } from './lib/project-files.ts';

export const PAGES_OUTPUT_ROOT = path.join(PROJECT_ROOT, 'pages-dist');

const PROTOTYPE_SOURCE_ROOT = path.join(PROJECT_ROOT, 'prototypes', 'rule-proof');
const PROTOTYPE_OUTPUT_ROOT = path.join(PAGES_OUTPUT_ROOT, 'prototypes', 'rule-proof');
const PROTOTYPE_RUNTIME_FILES = [
  'index.html',
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
  if (window.location.hash.startsWith('#/')) return;
  const target = new URL('./prototypes/rule-proof/', window.location.href);
  target.search = window.location.search;
  target.hash = window.location.hash;
  window.location.replace(target);
})();
`.trim();

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
    throw new Error('Pages artifact is missing the M00 compatibility bridge.');
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
    `pagesArtifact path=${projectPath(PAGES_OUTPUT_ROOT)} files=${summary.files} bytes=${summary.bytes} prototypeFiles=${PROTOTYPE_RUNTIME_FILES.length}`,
  );
  return summary;
}

const invokedScript = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedScript === fileURLToPath(import.meta.url)) {
  await buildPages();
}
