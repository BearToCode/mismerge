///
/// Rollup configuration for the vanilla build which can be reused for
/// projects that don't use a framework like Svelte (i.e. Vue, React), or can be imported without the need of a bundler.
///
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import path from 'path';
import svelte from 'rollup-plugin-svelte';
import terser from '@rollup/plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import alias from '@rollup/plugin-alias';
import copy from 'rollup-plugin-copy';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const coreSourcePath = __dirname;
const coreLibPath = path.join(coreSourcePath, 'src/lib');

const isProduction = !process.env.ROLLUP_WATCH;

if (!isProduction) {
	throw new Error('This build is only for production');
}

const outputFolder = path.join(__dirname);

export default [
	{
		input: path.join(coreLibPath, 'index.ts'),
		output: [
			{
				file: path.join(outputFolder, '/vanilla.js'),
				format: 'es',
				sourcemap: true,
				inlineDynamicImports: true
			}
		],
		plugins: [
			alias({
				entries: [
					{
						find: '$lib',
						replacement: coreLibPath
					}
				]
			}),
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
			typescript({
				sourceMap: true,
				inlineSources: true,
				tsconfig: path.join(coreSourcePath, 'tsconfig.json'),
				include: [path.join(coreLibPath, '**/*')],
				// TODO: Add proper types for the bundle
				declaration: false
			}),
			getBabelOutputPlugin({
				presets: ['@babel/preset-env']
			}),
			copy({
				targets: [
					{
						src: path.join(coreSourcePath, '/dist/index.d.ts'),
						dest: outputFolder,
						rename: 'vanilla.d.ts'
					}
				]
			}),
			terser()
		]
	}
];
