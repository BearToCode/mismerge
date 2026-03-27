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

	function escapeHtml(value: string) {
		return value
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	}

	$effect(() => {
		(async () => {
			try {
				highlighted = await highlight(content);
			} catch {
				// Keep code visible even when syntax highlighting fails.
				highlighted = `<pre><code>${escapeHtml(content)}</code></pre>`;
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
