import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PROJECT_ROOT, projectPath } from './lib/project-files.ts';

export const APP_OUTPUT_ROOT = path.join(PROJECT_ROOT, 'dist');

function assertSafeOutputRoot(): void {
  const resolvedOutput = path.resolve(APP_OUTPUT_ROOT);
  const resolvedProject = path.resolve(PROJECT_ROOT);
  const expectedOutput = path.join(resolvedProject, 'dist');

  if (
    resolvedOutput !== expectedOutput ||
    path.dirname(resolvedOutput) !== resolvedProject ||
    path.basename(resolvedOutput) !== 'dist'
  ) {
    throw new Error(`Refusing to clean unsafe app output path: ${projectPath(resolvedOutput)}`);
  }
}

export async function cleanBuildOutput(): Promise<void> {
  assertSafeOutputRoot();
  await rm(APP_OUTPUT_ROOT, { force: true, recursive: true });
}

const invokedScript = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedScript === fileURLToPath(import.meta.url)) {
  await cleanBuildOutput();
}
