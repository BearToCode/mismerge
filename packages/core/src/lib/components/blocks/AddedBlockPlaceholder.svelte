<script lang="ts">
	import type { AddedBlock } from '$lib/internal/blocks/added';
	import type { BlockComponent } from '$lib/internal/editor/component';

	export let block: AddedBlock;
	export let component: BlockComponent;
</script>

<div class="msm__block {block.placeholderType}" data-component-id={component.id} />
