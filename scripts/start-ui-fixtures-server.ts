process.env.VITE_BASE_PATH = '/axis-shift/';

const { createServer } = await import('vite');

const server = await createServer({
  server: {
    host: '127.0.0.1',
    port: 4174,
    strictPort: true,
  },
});

await server.listen();
server.printUrls();

let closing = false;
async function shutdown(exitCode: number): Promise<void> {
  if (closing) return;
  closing = true;
  process.exitCode = exitCode;
  await server.close();
}

process.once('SIGINT', () => void shutdown(130));
process.once('SIGTERM', () => void shutdown(143));

await new Promise<void>((resolve, reject) => {
  server.httpServer?.once('close', resolve);
  server.httpServer?.once('error', reject);
});
