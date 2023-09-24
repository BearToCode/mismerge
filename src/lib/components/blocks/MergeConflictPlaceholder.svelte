<script lang="ts">
	import type { MergeConflictBlock } from '$lib/internal/blocks/merge-conflict';
	import type { BlockComponent } from '$lib/internal/component';

	export let block: MergeConflictBlock;
	export let component: BlockComponent;
</script>

<div class="block {block.placeholderType}" id={component.id} />
