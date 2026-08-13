import { createServer, type ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { buildPages, PAGES_OUTPUT_ROOT } from './build-pages.ts';

const host = '127.0.0.1';
const port = 4174;
const configuredBasePath = process.env.VITE_BASE_PATH?.trim() || '/axis-shift/';
const basePath = configuredBasePath.endsWith('/') ? configuredBasePath : `${configuredBasePath}/`;

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

function send(response: ServerResponse, status: number, body: string): void {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(body);
}

function resolveArtifactPath(requestUrl: string): string | undefined {
  const url = new URL(requestUrl, `http://${host}:${port}`);
  const decodedPathname = decodeURIComponent(url.pathname);
  if (!decodedPathname.startsWith(basePath)) return undefined;

  let relativePath = decodedPathname.slice(basePath.length);
  if (!relativePath || relativePath.endsWith('/')) relativePath += 'index.html';

  const candidate = path.resolve(PAGES_OUTPUT_ROOT, relativePath);
  const rootPrefix = `${path.resolve(PAGES_OUTPUT_ROOT)}${path.sep}`;
  if (candidate !== path.resolve(PAGES_OUTPUT_ROOT) && !candidate.startsWith(rootPrefix)) {
    return undefined;
  }
  return candidate;
}

async function serveFile(
  filename: string,
  method: string | undefined,
  response: ServerResponse,
): Promise<void> {
  let resolvedFilename = filename;
  const metadata = await stat(resolvedFilename);
  if (metadata.isDirectory()) resolvedFilename = path.join(resolvedFilename, 'index.html');

  const body = await readFile(resolvedFilename);
  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Length': body.byteLength,
    'Content-Type':
      contentTypes.get(path.extname(resolvedFilename).toLowerCase()) ?? 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(method === 'HEAD' ? undefined : body);
}

await buildPages();

const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    send(response, 405, 'Method not allowed');
    return;
  }

  try {
    const filename = resolveArtifactPath(request.url ?? '/');
    if (!filename) {
      send(response, 404, 'Not found');
      return;
    }
    void serveFile(filename, request.method, response).catch((error: unknown) => {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        send(response, 404, 'Not found');
        return;
      }
      console.error(error);
      send(response, 500, 'Internal server error');
    });
  } catch (error) {
    console.error(error);
    send(response, 400, 'Bad request');
  }
});

await new Promise<void>((resolve, reject) => {
  server.once('error', reject);
  server.listen(port, host, resolve);
});
console.log(`Pages artifact server: http://${host}:${port}${basePath}`);

let closing = false;
async function shutdown(exitCode: number): Promise<void> {
  if (closing) return;
  closing = true;
  process.exitCode = exitCode;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

process.once('SIGINT', () => void shutdown(130));
process.once('SIGTERM', () => void shutdown(143));

await new Promise<void>((resolve) => server.once('close', resolve));
