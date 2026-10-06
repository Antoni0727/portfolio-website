// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Change this once the real domain is live
  site: 'https://tonyjedits.com',
  integrations: [sitemap({ filter: (page) => !page.includes('/dev/') })],
  build: {
    // Keep CSS in files (not inline) so the Content-Security-Policy can stay strict
    inlineStylesheets: 'never',
  },
  vite: {
    build: { assetsInlineLimit: 0 },
  },
  devToolbar: { enabled: false },
});
