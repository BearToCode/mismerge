<script lang="ts">
	import type { LineDiff } from '$lib/internal/blocks';
	import type { PartiallyModifiedBlock } from '$lib/internal/blocks/partially-modified';
	import type { BlockComponent } from '$lib/internal/component';

	export let block: PartiallyModifiedBlock;
	export let lines: LineDiff[];
	export let component: BlockComponent;
</script>

<div class="block {block.removedType}" id={component.id}>
	{#each lines as line}
		<div class="line">
			<div class="line-number">
				{line.number}
			</div>
			<div class="content">
				{#each line.diff as change}
					{#if change.removed}
						<pre><span class="removed">{change.value}</span></pre>
					{:else if !change.added}
						<pre><span class="unchanged">{change.value}</span></pre>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>
