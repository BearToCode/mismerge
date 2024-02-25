/**
 * @fileoverview
 * Rollup configuration for the vanilla build which can be reused for
 * projects that don't use a framework like Svelte (i.e. Vue, React), or can be imported without the need of a bundler.
 */

import resolve from '@rollup/plugin-node-resolve';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import path from 'path';
import svelte from 'rollup-plugin-svelte';
import terser from '@rollup/plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const coreSourcePath = path.join(__dirname);
const coreLibPath = path.join(coreSourcePath, 'dist');

const isProduction = !process.env.ROLLUP_WATCH;

if (!isProduction) {
	throw new Error('This build is only for production');
}

const outputFolder = path.join(__dirname, 'dist');

export default [
	{
		input: path.join(coreLibPath, 'index.js'),
		output: [
			{
				file: path.join(outputFolder, '/web.js'),
				format: 'es',
				sourcemap: true,
				inlineDynamicImports: true
			}
		],
		plugins: [
			svelte({
				preprocess: sveltePreprocess(),
				compilerOptions: {
					customElement: true
				}
			}),
			resolve({
				browser: true,
				exportConditions: ['svelte']
			}),
			getBabelOutputPlugin({
				presets: ['@babel/preset-env']
			}),
			terser()
		]
	}
];
