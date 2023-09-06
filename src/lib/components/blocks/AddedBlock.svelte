<script lang="ts">
	import type { AddedBlock } from '$lib/internal/blocks';

	export let block: AddedBlock;
	export let elem: HTMLDivElement;
</script>

<div bind:this={elem} class="added-block">
	<pre>{block.content}</pre>
</div>
