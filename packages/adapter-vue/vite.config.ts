import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.includes('-')
				}
			}
		}),
		dts({
			include: ['src/lib/**/*']
		})
	],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/lib/index.ts'),
			formats: ['es']
		},
		rollupOptions: {
			output: {
				entryFileNames: 'index.js'
			},
			external: ['vue', '@mismerge/core', '@mismerge/core/web', '@mismerge/core/colors']
		},
		copyPublicDir: false
	}
});
