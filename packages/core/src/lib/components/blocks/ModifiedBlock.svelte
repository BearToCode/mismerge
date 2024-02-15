<script lang="ts">
	import type { ModifiedBlock } from '$lib/internal/blocks/modified';
	import type { BlockComponent } from '$lib/internal/editor/component';
	import type { LineDiff } from '$lib/internal/diff/line-diff';
	import type { Side } from '$lib/internal/editor/side';

	export let block: ModifiedBlock<Side>;
	export let lines: LineDiff[];
	export let component: BlockComponent;
</script>

<div class="msm__block {block.type}" data-component-id={component.id}>
	{#each lines as line}
		<div class="msm__line">
			<div class="msm__content">
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
