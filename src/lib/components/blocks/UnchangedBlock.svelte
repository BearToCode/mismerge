<script lang="ts">
	import type { UnchangedBlock } from '$lib/internal/blocks';

	export let block: UnchangedBlock;
	export let elem: HTMLDivElement;
</script>

<div bind:this={elem} class="unchanged-block">
	<pre>{block.content}</pre>
</div>
