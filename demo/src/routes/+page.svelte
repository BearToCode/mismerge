<script lang="ts">
	import { DefaultDarkColors, MisMerge2, MisMerge3 } from 'mismerge';
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
		wrapLines
	} from '$lib/stores';
	import { highlightText } from '@speed-highlight/core';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import 'mismerge/styles.css';
	import 'mismerge/dark.css';
	import '$lib/styles/code-dark.css';
	import '$lib/styles/styles.css';

	const highlight = async (text: string) =>
		highlightText(text, $language, true, { hideLineNumbers: true });
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

	<script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
</svelte:head>

<main>
	<Toolbar />
	{#key $language}
		{#if $component == 'mismerge2'}
			<MisMerge2
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
				colors={DefaultDarkColors}
			/>
		{:else}
			<MisMerge3
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
				colors={DefaultDarkColors}
			/>
		{/if}
	{/key}
</main>

<style>
	:global(.mismerge) {
		font-family: 'Fira Code', monospace;
		font-variant-ligatures: normal;
		min-height: 85vh;
		margin-top: 1rem;
	}
</style>
