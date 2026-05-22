import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import devEmailPreview from './scripts/vite-plugin-dev-email-preview.mjs';

export default defineConfig({
  site: 'https://discovery.electriccitizen.com',
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  vite: {
    plugins: [devEmailPreview()],
  },
});
