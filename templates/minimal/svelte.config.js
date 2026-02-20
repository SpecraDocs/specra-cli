import { specraConfig } from 'specra/svelte-config';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';


const config = specraConfig({
	kit: {
		adapter: (await import('@sveltejs/adapter-auto')).default()
	},
	 vitePreprocess: { vitePreprocess }

});

export default config;
