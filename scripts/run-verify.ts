import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const requiredScripts = [
  'dev',
  'lint',
  'format:check',
  'typecheck',
  'test',
  'test:coverage',
  'test:coverage:domain',
  'test:math:exhaustive',
  'validate:levels',
  'audit:daily',
  'build',
  'build:pages',
  'test:e2e',
  'test:pages',
  'test:a11y',
  'verify',
] as const;

const scripts = [
  'lint',
  'format:check',
  'typecheck',
  'test',
  'check:boundaries',
  'validate:levels',
  'audit:daily',
  'audit:secrets',
  'build',
  'build:pages',
] as const;

function runNpmScript(script: string): void {
  console.log(`\n[verify] npm run ${script}`);
  const npmCli = process.env.npm_execpath;
  const executable = npmCli ? process.execPath : process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const arguments_ = npmCli ? [npmCli, 'run', script] : ['run', script];
  const result = spawnSync(executable, arguments_, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    console.error(`[verify] ${script} failed with exit ${String(result.status ?? 1)}`);
    process.exit(result.status ?? 1);
  }
}

const packageJson = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
) as {
  scripts?: Record<string, unknown>;
};
const missingScripts = requiredScripts.filter(
  (script) => typeof packageJson.scripts?.[script] !== 'string',
);
console.log(
  `[verify] scriptContract required=${requiredScripts.length} missing=${missingScripts.length}`,
);
if (missingScripts.length > 0) {
  throw new Error(`Missing required npm scripts: ${missingScripts.join(', ')}`);
}

for (const script of scripts) runNpmScript(script);
console.log(`\n[verify] passed steps=${scripts.length}`);
