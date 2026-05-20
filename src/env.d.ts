/// <reference types="astro/client" />

// Cloudflare bindings. Read at runtime via `import { env } from 'cloudflare:workers'`.
// Astro 6 removed the `Astro.locals.runtime.env` accessor; this global Env
// interface is what the cloudflare:workers module types against.
declare global {
  interface Env {
    DB: D1Database;
    ASSETS: Fetcher;
    SESSION?: KVNamespace;
    IMAGES?: unknown;
  }
}

export {};
