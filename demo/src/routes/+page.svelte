<script lang="ts">
	import { MisMerge2, MisMerge3 } from 'mismerge';
	import { highlightText } from '@speed-highlight/core';
	import { detectLanguage } from '@speed-highlight/core/detect.js';
	import 'mismerge/styles.css';
	import 'mismerge/default-light.css';
	import '$lib/styles/code-light.css';

	const highlight = async (text: string) =>
		highlightText(text, await detectLanguage(text), true, { hideLineNumbers: true });
</script>

<svelte:head>
	<!-- Custom fonts -->
	<!-- Fira font -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
	<!-- Inter -->
	<link rel="preconnect" href="https://rsms.me/" />
	<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
</svelte:head>

<main>
	<MisMerge3 lhs="" ctr="" rhs="" lhsEditable rhsEditable wrapLines {highlight} />
	<MisMerge2 lhs="" rhs="" lhsEditable rhsEditable wrapLines />
</main>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Inter var', sans-serif;
		min-height: 100vh;
	}

	:global(.mismerge) {
		font-family: 'Fira Code', monospace;
		font-variant-ligatures: normal;
	}

	main {
		max-width: 1536px;
		margin: 0 auto 0 auto;
		padding: 2rem 0 2rem 0;
	}

	/* Responsive main */

	@media screen and (max-width: 640px) {
		main {
			width: 95%;
		}
	}

	@media screen and (min-width: 640px) and (max-width: 767px) {
		main {
			width: 640px;
		}
	}

	@media screen and (min-width: 767px) and (max-width: 1023px) {
		main {
			width: 768px;
		}
	}

	@media screen and (min-width: 1023px) and (max-width: 1279px) {
		main {
			width: 1024px;
		}
	}

	@media screen and (min-width: 1279px) and (max-width: 1535px) {
		main {
			width: 1280px;
		}
	}
</style>
