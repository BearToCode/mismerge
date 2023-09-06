<script lang="ts">
	import type { RemovedBlockPlaceholder } from '$lib/internal/blocks';

	export let block: RemovedBlockPlaceholder;
	export let elem: HTMLDivElement;
</script>

<div bind:this={elem} class="removed-block-placeholder" />
