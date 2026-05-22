// Vite plugin: spins up a tiny HTTP sidecar (port 4327) during `astro dev`
// that accepts rendered emails from the worker and writes them to
// .dev-emails/ as .eml files. The worker can't write to disk itself
// (workerd runtime, even in dev), so this Node-side sidecar is the
// shortest path to "double-click the file to view in your mail client".
//
// Only active in dev — `configureServer` is the dev-only Vite hook;
// `apply: 'serve'` is belt-and-braces so the plugin is a no-op during
// `astro build`.

import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const PORT = 4327;

export default function devEmailPreview() {
  return {
    name: 'discovery-dev-email-preview',
    apply: 'serve',
    configureServer() {
      const dir = resolve(process.cwd(), '.dev-emails');
      const server = createServer(async (req, res) => {
        if (req.method !== 'POST' || req.url !== '/write') {
          res.writeHead(404).end();
          return;
        }
        try {
          let body = '';
          for await (const chunk of req) body += chunk;
          const { kind, recipients, eml } = JSON.parse(body);
          await mkdir(dir, { recursive: true });
          const ts = new Date().toISOString().replace(/[:.]/g, '-');
          const safeTo = String(recipients?.[0] ?? 'unknown')
            .replace(/[^a-z0-9.@_-]+/gi, '_');
          const file = resolve(dir, `${ts}-${kind}-${safeTo}.eml`);
          await writeFile(file, eml, 'utf8');
          res.writeHead(200, { 'content-type': 'text/plain' }).end(file);
        } catch (err) {
          console.error('[dev-email-preview] write failed:', err);
          res.writeHead(500).end(String(err));
        }
      });
      server.on('error', (err) => {
        // EADDRINUSE typically means a prior dev session is still alive on
        // this port. Don't crash — just log and let the worker's fetch fail.
        console.error(`[dev-email-preview] sidecar on :${PORT} failed:`, err.message);
      });
      server.listen(PORT, '127.0.0.1', () => {
        console.log(`[dev-email-preview] sidecar listening on http://127.0.0.1:${PORT}`);
      });
    },
  };
}
