<script lang="ts">
	import type { PartiallyModifiedBlock } from '$lib/internal/blocks/partially-modified';
	import type { BlockComponent } from '$lib/internal/component';
	import type { LineDiff } from '$lib/internal/line-diff';

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
				{#each line.parts as part}
					{#if part.overlay}
						<pre><span class="overlay">{part.content}</span></pre>
					{:else}
						<pre><span>{part.content || ' '}</span></pre>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>
