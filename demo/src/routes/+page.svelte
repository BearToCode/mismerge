<script lang="ts">
	import { DefaultDarkColors, MisMerge3 } from 'mismerge';
	import { highlightText } from '@speed-highlight/core';
	import { detectLanguage } from '@speed-highlight/core/detect.js';
	import LhsPlaceholderText from '$lib/placeholder/lhs-quicksort.c?raw';
	import CtrPlaceholderText from '$lib/placeholder/ctr-quicksort.c?raw';
	import RhsPlaceholderText from '$lib/placeholder/rhs-quicksort.c?raw';
	import 'mismerge/styles.css';
	import 'mismerge/dark.css';
	import '$lib/styles/code-dark.css';
	import '$lib/styles/styles.css';

	const highlight = async (text: string) =>
		highlightText(text, 'c', true, { hideLineNumbers: true });
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
	<MisMerge3
		{highlight}
		lhs={LhsPlaceholderText}
		ctr={CtrPlaceholderText}
		rhs={RhsPlaceholderText}
		lhsEditable
		rhsEditable
		colors={DefaultDarkColors}
	/>
	<!-- <MisMerge2
		{highlight}
		lhs=""
		rhs=""
		lhsEditable
		rhsEditable
		wrapLines
		colors={DefaultDarkColors}
	/> -->
</main>

<style>
	:global(.mismerge) {
		font-family: 'Fira Code', monospace;
		font-variant-ligatures: normal;
		min-height: 90vh;
	}
</style>
