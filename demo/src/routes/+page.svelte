<script lang="ts">
	import {
		DefaultDarkColors,
		MisMerge2,
		MisMerge3,
		type EditorColors,
		DefaultLightColors
	} from '@mismerge/core';
	import {
		component,
		ctr,
		disableFooter,
		disableMerging,
		ignoreCase,
		ignoreWhitespace,
		language,
		lhs,
		rhs,
		theme,
		wrapLines
	} from '$lib/stores';
	import { loadDynamicStylesheet } from '$lib/dynamic-css';
	import { highlightText } from '@speed-highlight/core';
	import { onMount } from 'svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';

	import '$lib/styles/styles.css';
	import '@mismerge/core/styles.css';
	import mismergeLightStyle from '@mismerge/core/light.css?raw';
	import mismergeDarkStyle from '@mismerge/core/dark.css?raw';
	import codeLightStyle from '$lib/styles/code-light.css?raw';
	import codeDarkStyle from '$lib/styles/code-dark.css?raw';
	import Footer from '$lib/components/Footer.svelte';

	let mounted = false;
	let unloadStylesheets: (() => void)[] = [];

	onMount(() => {
		mounted = true;
		loadStylesheets($theme);
	});

	function loadStylesheets(theme: string) {
		const add = (fn: () => void) => unloadStylesheets.push(fn);
		switch (theme) {
			case 'dark':
				add(loadDynamicStylesheet(mismergeDarkStyle));
				add(loadDynamicStylesheet(codeDarkStyle));
				break;
			case 'light':
				add(loadDynamicStylesheet(mismergeLightStyle));
				add(loadDynamicStylesheet(codeLightStyle));
				break;
		}
	}

	theme.subscribe((value) => {
		if (!mounted) return;
		unloadStylesheets.forEach((fn) => fn());
		unloadStylesheets = [];
		loadStylesheets(value);
		updateColors(value);
	});

	const highlight = async (text: string) =>
		highlightText(text, $language, true, { hideLineNumbers: true });

	let colors: EditorColors;
	const updateColors = (theme: string) =>
		(colors = theme == 'light' ? DefaultLightColors : DefaultDarkColors);
	theme.subscribe(updateColors);
</script>

<svelte:head>
	<title>MisMerge</title>
	<meta name="description" content="A modern merge conflict editor for the web" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta charset="utf-8" />

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

	<script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
</svelte:head>

<main>
	<Toolbar />
	{#key $language}
		{#if $component == 'mismerge2'}
			<MisMerge2
				{colors}
				{highlight}
				bind:lhs={$lhs}
				bind:rhs={$rhs}
				lhsEditable
				rhsEditable
				wrapLines={$wrapLines}
				disableMerging={$disableMerging}
				disableFooter={$disableFooter}
				ignoreWhitespace={$ignoreWhitespace}
				ignoreCase={$ignoreCase}
			/>
		{:else}
			<MisMerge3
				{colors}
				{highlight}
				bind:lhs={$lhs}
				bind:ctr={$ctr}
				bind:rhs={$rhs}
				lhsEditable
				rhsEditable
				wrapLines={$wrapLines}
				disableMerging={$disableMerging}
				disableFooter={$disableFooter}
				ignoreWhitespace={$ignoreWhitespace}
				ignoreCase={$ignoreCase}
			/>
		{/if}
	{/key}

	<Footer />
</main>

<style>
	:global(.mismerge) {
		font-family: 'Fira Code', monospace;
		font-variant-ligatures: normal;
		min-height: 80vh;
		margin-top: 1rem;
	}
</style>
