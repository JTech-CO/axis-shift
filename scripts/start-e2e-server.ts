process.env.VITE_BASE_PATH = '/axis-shift/';

const { build, preview } = await import('vite');

await build();
const server = await preview({
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
});
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
  server.httpServer.once('close', resolve);
  server.httpServer.once('error', reject);
});
