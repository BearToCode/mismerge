<script lang="ts">
	import type { PartiallyAddedBlock } from '$lib/internal/blocks';

	export let block: PartiallyAddedBlock;
	export let elem: HTMLDivElement;
</script>

<div bind:this={elem} class="partially-added-block">
	{#each block.diff as change}
		{#if change.added}
			<pre><span class="added">{change.value}</span></pre>
		{:else if !change.removed}
			<pre><span class="unchanged">{change.value}</span></pre>
		{/if}
	{/each}
</div>
