<script lang="ts">
	import type { LineDiff, PartiallyModifiedBlock } from '$lib/internal/blocks';
	import type { BlockComponent } from '$lib/internal/component';

	export let block: PartiallyModifiedBlock;
	export let lines: LineDiff[];
	export let component: BlockComponent;
</script>

<div class="block {block.type}" id={component.id}>
	{#each lines as line}
		<div class="line">
			<div class="line-number">
				{line.number}
			</div>
			<div class="content">
				{#each line.diff as change}
					{#if !change.removed}
						<pre>{change.value}</pre>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>
