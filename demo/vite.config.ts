import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const resolveFromDemo = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url));
const coreLibRoot = resolveFromDemo('../packages/core/src/lib');
const coreLibImportRoot = `/@fs${coreLibRoot}`;

function resolveCoreLibImport(source: string) {
	const importPath = source.slice('$lib/'.length);
	const basePath = `${coreLibRoot}/${importPath}`;
	const candidates = [
		basePath,
		`${basePath}.ts`,
		`${basePath}.js`,
		`${basePath}.svelte`,
		`${basePath}.css`,
		`${basePath}/index.ts`,
		`${basePath}/index.js`,
		`${basePath}/index.svelte`
	];

	return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

const coreSourceResolver = {
	name: 'core-source-resolver',
	enforce: 'pre' as const,
	resolveId(source: string, importer?: string) {
		if (source.startsWith('$lib/') && importer?.includes('packages/core/src/lib/')) {
			return resolveCoreLibImport(source);
		}
	}
};

const coreSourceImportRewriter = {
	name: 'core-source-import-rewriter',
	enforce: 'pre' as const,
	transform(code: string, id: string) {
		if (!id.includes('/packages/core/src/lib/')) return null;

		return code.replace(/(['"])\$lib\/([^'"\n]+)\1/g, (match, quote, path) => {
			const resolved = resolveCoreLibImport(`$lib/${path}`);
			if (!resolved) return match;
			return `${quote}/@fs${resolved}${quote}`;
		});
	}
};

export default defineConfig({
	plugins: [coreSourceImportRewriter, coreSourceResolver, sveltekit()],
	resolve: {
		alias: [
			{
				find: '@vostej/core/source-styles/',
				replacement: `${coreLibRoot}/styles/`
			},
			{
				find: '@vostej/core/styles.css',
				replacement: `${coreLibRoot}/styles/styles.css`
			},
			{
				find: '@vostej/core/light.css',
				replacement: `${coreLibRoot}/styles/light.css`
			},
			{
				find: '@vostej/core/dark.css',
				replacement: `${coreLibRoot}/styles/dark.css`
			},
			{
				find: '@vostej/core/',
				replacement: `${coreLibRoot}/`
			},
			{
				find: '@vostej/core',
				replacement: `${coreLibRoot}/index.ts`
			}
		]
	}
});
