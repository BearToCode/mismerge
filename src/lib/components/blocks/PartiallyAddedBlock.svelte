<script lang="ts">
	import type { PartiallyModifiedBlock } from '$lib/internal/blocks/partially-modified';
	import type { BlockComponent } from '$lib/internal/component';
	import type { LineDiff } from '$lib/internal/line-diff';

	export let block: PartiallyModifiedBlock;
	export let lines: LineDiff[];
	export let component: BlockComponent;
</script>

<div class="msm__block {block.addedType}" id={component.id}>
	{#each lines as line}
		<div class="msm__line">
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
