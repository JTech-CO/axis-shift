import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { PROJECT_ROOT, projectPath, walkFiles } from './lib/project-files.ts';

const EXCLUDED_DIRECTORIES = new Set([
  '.git',
  '.vite',
  'coverage',
  'dist',
  'node_modules',
  'outputs',
  'pages-dist',
  'playwright-report',
  'test-results',
]);
const BINARY_EXTENSIONS = new Set([
  '.avi',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.mov',
  '.mp3',
  '.mp4',
  '.pdf',
  '.png',
  '.ttf',
  '.wav',
  '.webm',
  '.webp',
  '.woff',
  '.woff2',
  '.zip',
]);

interface Finding {
  readonly file: string;
  readonly kind: string;
  readonly line?: number;
}

const tokenPatterns: readonly (readonly [string, RegExp])[] = [
  ['private-key', /-----BEGIN (?:EC |OPENSSH |PGP |RSA )?PRIVATE KEY-----/gu],
  ['github-token', /\bgh[pousr]_[A-Za-z0-9]{20,}\b/gu],
  ['openai-key', /\bsk-[A-Za-z0-9_-]{20,}\b/gu],
  ['aws-access-key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/gu],
  ['slack-token', /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/gu],
];
const secretAssignment =
  /(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password|private[_-]?key|secret|token)\s*[=:]\s*["']([^"'\r\n]{8,})["']/giu;

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

function isPlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === 'changeme' ||
    normalized === 'development' ||
    normalized === 'example' ||
    normalized === 'placeholder' ||
    normalized.startsWith('${') ||
    normalized.startsWith('<') ||
    normalized.startsWith('your-') ||
    normalized.startsWith('your_')
  );
}

async function main(): Promise<void> {
  const files = await walkFiles(PROJECT_ROOT, { excludedDirectoryNames: EXCLUDED_DIRECTORIES });
  const findings: Finding[] = [];
  let scannedFiles = 0;

  for (const filename of files) {
    const basename = path.basename(filename);
    if (basename.startsWith('.env') && basename !== '.env.example') {
      findings.push({ file: projectPath(filename), kind: 'real-env-file' });
    }
    if (BINARY_EXTENSIONS.has(path.extname(filename).toLowerCase())) continue;
    const metadata = await stat(filename);
    if (metadata.size > 5 * 1024 * 1024) continue;

    const source = await readFile(filename, 'utf8');
    if (source.includes('\0')) continue;
    scannedFiles += 1;

    for (const [kind, pattern] of tokenPatterns) {
      pattern.lastIndex = 0;
      for (const match of source.matchAll(pattern)) {
        findings.push({ file: projectPath(filename), kind, line: lineAt(source, match.index) });
      }
    }
    secretAssignment.lastIndex = 0;
    for (const match of source.matchAll(secretAssignment)) {
      const value = match[1];
      if (value !== undefined && !isPlaceholder(value)) {
        findings.push({
          file: projectPath(filename),
          kind: 'secret-like-assignment',
          line: lineAt(source, match.index),
        });
      }
    }
  }

  for (const finding of findings) {
    console.error(
      `secret: ${finding.file}${finding.line ? `:${finding.line}` : ''} ${finding.kind} (value redacted)`,
    );
  }
  console.log(`secretScan files=${scannedFiles} findings=${findings.length}`);
  if (findings.length > 0) process.exitCode = 1;
}

await main();
