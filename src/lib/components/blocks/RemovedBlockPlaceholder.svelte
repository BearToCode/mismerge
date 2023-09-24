<script lang="ts">
	import type { RemovedBlock } from '$lib/internal/blocks/removed';
	import type { BlockComponent } from '$lib/internal/component';

	export let block: RemovedBlock;
	export let component: BlockComponent;
</script>

<div class="block {block.placeholderType}" id={component.id} />
