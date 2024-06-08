import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import htmx from 'astro-htmx';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    htmx()
  ],
});
