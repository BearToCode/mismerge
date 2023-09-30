<script lang="ts">
	import type { MergeConflictBlock } from '$lib/internal/blocks/merge-conflict';
	import type { BlockComponent } from '$lib/internal/editor/component';

	export let block: MergeConflictBlock;
	export let component: BlockComponent;
</script>

<div class="msm__block {block.resolvedPlaceholderType}" id={component.id} />
