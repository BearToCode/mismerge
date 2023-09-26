<script lang="ts">
	import type { Line } from '$lib/internal/blocks';
	import type { PartiallyModifiedBlock } from '$lib/internal/blocks/partially-modified';
	import type { BlockComponent } from '$lib/internal/component';

	export let block: PartiallyModifiedBlock;
	export let lines: Line[];
	export let component: BlockComponent;
</script>

<div class="block {block.type}" id={component.id}>
	{#each lines as line}
		<div class="line">
			<div class="content">
				<pre>{line.content || ' '}</pre>
			</div>
		</div>
	{/each}
</div>
