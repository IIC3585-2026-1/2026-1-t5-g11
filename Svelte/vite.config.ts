import { sveltekit } from '@sveltejs/kit/vite';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			allow: [fileURLToPath(new URL('..', import.meta.url))]
		}
	}
});
