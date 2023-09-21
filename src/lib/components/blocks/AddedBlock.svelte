<script lang="ts">
	import type { AddedBlock } from '$lib/internal/blocks';
	import type { BlockComponent } from '$lib/internal/component';

	export let block: AddedBlock;
	export let component: BlockComponent;
</script>

<div class="block {block.type}" id={component.id}>
	{#each block.lines as line}
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
