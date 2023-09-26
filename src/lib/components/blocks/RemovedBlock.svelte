<script lang="ts">
	import type { Line } from '$lib/internal/blocks';
	import type { RemovedBlock } from '$lib/internal/blocks/removed';
	import type { BlockComponent } from '$lib/internal/component';

	export let block: RemovedBlock;
	export let component: BlockComponent;
	export let lines: Line[];
</script>

<div class="msm__block {block.type}" id={component.id}>
	{#each lines as line}
		<div class="msm__line">
			<div class="content">
				<pre>{line.content || ' '}</pre>
			</div>
		</div>
	{/each}
</div>
