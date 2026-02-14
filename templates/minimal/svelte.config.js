import { specraConfig } from 'specra/svelte-config';

const config = specraConfig({
	kit: {
		adapter: (await import('@sveltejs/adapter-auto')).default()
	}
});

export default config;
