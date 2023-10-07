<script lang="ts">
	import { debounce } from '$lib/internal/utils';

	/* Exports */

	export let content: string;
	export let highlight: (text: string) => string | Promise<string>;
	export let width: number;
	export let highlightDebounce: number;

	/* Local variables */

	let highlighted: string;

	/* Local functions */

	const highlightContent = debounce(async (text: string) => {
		highlighted = await highlight(text);
	}, highlightDebounce);

	/* Reactive statements */

	$: highlightContent(content);
</script>

{#if highlighted}
	<div style="--width: {width}px;" class="msm__highlight-overlay">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<pre>{@html highlighted}</pre>
	</div>
{/if}
