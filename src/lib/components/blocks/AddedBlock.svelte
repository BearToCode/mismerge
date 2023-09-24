<script lang="ts">
	import type { Line } from '$lib/internal/blocks';
	import type { AddedBlock } from '$lib/internal/blocks/added';
	import type { BlockComponent } from '$lib/internal/component';

	export let block: AddedBlock;
	export let component: BlockComponent;
	export let lines: Line[];
</script>

<div class="block {block.type}" id={component.id}>
	{#each lines as line}
		<div class="line">
			<div class="line-number">
				{line.number}
			</div>
			<div class="content">
				<pre>{line.content}</pre>
			</div>
		</div>
	{/each}
</div>
