<script lang="ts">
	let {
		content,
		highlight,
		width
	}: {
		content: string;
		highlight: (text: string) => string | Promise<string>;
		width: number;
	} = $props();

	let highlighted = $state('');
	let renderVersion = 0;

	$effect(() => {
		const currentVersion = ++renderVersion;

		(async () => {
			try {
				const rendered = await highlight(content);
				if (currentVersion !== renderVersion) return;
				highlighted = rendered;
			} catch {
				if (currentVersion !== renderVersion) return;
				highlighted = '';
			}
		})();
	});
</script>

{#if highlighted}
	<div style="--width: {width}px;" class="msm__highlight-overlay">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html highlighted}
	</div>
{/if}
