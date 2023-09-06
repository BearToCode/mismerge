<script lang="ts">
	import type { PartiallyRemovedBlock } from '$lib/internal/blocks';

	export let block: PartiallyRemovedBlock;
	export let elem: HTMLDivElement;
</script>

<div bind:this={elem} class="partially-removed-block">
	{#each block.diff as change}
		{#if change.removed}
			<pre><span class="removed">{change.value}</span></pre>
		{:else if !change.added}
			<pre><span class="unchanged">{change.value}</span></pre>
		{/if}
	{/each}
</div>
