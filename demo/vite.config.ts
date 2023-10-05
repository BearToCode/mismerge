import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dynamicImport from 'vite-plugin-dynamic-import';

export default defineConfig({
	plugins: [
		sveltekit(),
		dynamicImport({
			filter(id) {
				if (id.includes('@speed-highlight/core')) return true;
			}
		})
	]
});
