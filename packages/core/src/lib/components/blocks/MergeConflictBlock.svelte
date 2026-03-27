<script lang="ts">
	import type { Line } from '$lib/internal/blocks';
	import type { MergeConflictBlock } from '$lib/internal/blocks/merge-conflict';
	import type { BlockComponent } from '$lib/internal/editor/component';

	let {
		block,
		lines,
		component
	}: { block: MergeConflictBlock; lines: Line[]; component: BlockComponent } = $props();
</script>

<div class="msm__block {component.visualType}" data-component-id={component.id}>
	{#each lines as line}
		<div class="msm__line">
			<div class="msm__content">
				<pre>{line.content}</pre>
			</div>
		</div>
	{/each}
</div>
