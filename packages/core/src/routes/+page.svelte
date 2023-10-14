<script lang="ts">
	import '$lib/styles/styles.css';
	import '$lib/styles/dark.css';
	import { DefaultDarkColors } from '$lib/internal/editor/colors';

	let colors = DefaultDarkColors;
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
</svelte:head>

<main>
	<!-- <MisMerge3
		lhs={LhsPlaceholderText}
		ctr={CtrPlaceholderText}
		rhs={RhsPlaceholderText}
		wrapLines
		lhsEditable
		rhsEditable
		colors={DefaultDarkColors}
		ignoreWhitespace
	/> -->
	<!-- <MisMerge2
		lhs="1
2"
		rhs=""
		{colors}
	/> -->
	<mismerge-2 lhs="1" rhs="" {colors} />
</main>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Inter var', sans-serif;
		min-height: 100vh;
		background: #0e0e0e;
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

	:global(main > *) {
		margin-top: 4rem;
	}

	:global(main > *:first-child) {
		margin-top: 0;
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
