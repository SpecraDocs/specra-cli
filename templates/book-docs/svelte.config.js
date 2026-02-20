import { specraConfig } from 'specra/svelte-config';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = specraConfig({
  vitePreprocess: { vitePreprocess }
});

export default config;
