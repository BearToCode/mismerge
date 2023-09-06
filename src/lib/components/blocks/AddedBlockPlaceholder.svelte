<script lang="ts">
	import type { AddedBlockPlaceholder } from '$lib/internal/blocks';

	export let block: AddedBlockPlaceholder;
	export let elem: HTMLDivElement;
</script>

<div bind:this={elem} class="added-block-placeholder" />
