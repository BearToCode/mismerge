<script lang="ts">
	import type { ModifiedBlock } from '$lib/internal/blocks/modified';
	import type { BlockComponent } from '$lib/internal/component';
	import type { LineDiff } from '$lib/internal/line-diff';

	export let block: ModifiedBlock;
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
				{#each line.parts as part}
					{#if part.overlay}
						<pre><span class="overlay">{part.content}</span></pre>
					{:else}
						<pre><span>{part.content}</span></pre>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>
