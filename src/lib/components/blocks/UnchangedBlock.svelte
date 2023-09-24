<script lang="ts">
	import type { Line } from '$lib/internal/blocks';
	import type { UnchangedBlock } from '$lib/internal/blocks/unchanged';
	import type { BlockComponent } from '$lib/internal/component';

	export let block: UnchangedBlock;
	export let lines: Line[];
	export let component: BlockComponent;
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
