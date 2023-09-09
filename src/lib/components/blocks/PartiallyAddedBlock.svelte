<script lang="ts">
	import type { PartiallyAddedBlock } from '$lib/internal/blocks';

	export let block: PartiallyAddedBlock;
</script>

<div class="block {block.type}">
	{#each block.lines as line}
		<div class="line">
			<div class="line-number">
				{line.number}
			</div>
			<div class="content">
				{#each line.diff as change}
					{#if change.added}
						<pre><span class="added">{change.value}</span></pre>
					{:else if !change.removed}
						<pre><span class="unchanged">{change.value}</span></pre>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>
