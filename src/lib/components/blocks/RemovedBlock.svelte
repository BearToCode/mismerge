<script lang="ts">
	import type { RemovedBlock } from '$lib/internal/blocks';

	export let block: RemovedBlock;
	export let elem: HTMLDivElement;
</script>

<div bind:this={elem} class="removed-block">
	<pre>{block.content}</pre>
</div>
