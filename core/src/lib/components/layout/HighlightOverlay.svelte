<script lang="ts">
	/* Exports */

	export let content: string;
	export let highlight: (text: string) => string | Promise<string>;
	export let width: number;

	/* Local variables */

	let highlighted: string;

	/* Local functions */

	const highlightContent = async (text: string) => {
		highlighted = await highlight(text);
	};

	/* Reactive statements */

	$: highlightContent(content);
</script>

{#if highlighted}
	<div style="--width: {width}px;" class="msm__highlight-overlay">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<pre>{@html highlighted}</pre>
	</div>
{/if}
