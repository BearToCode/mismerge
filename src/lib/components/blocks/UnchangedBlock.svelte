<script lang="ts">
	import type { UnchangedBlock } from '$lib/internal/blocks';

	export let block: UnchangedBlock;
</script>

<div class="block {block.type}">
	{#each block.lines as line}
		<div class="line">
			<div class="line-number">
				{line.number}
			</div>
			<div class="content">
				<pre>{line.content}</pre>
			</div>
		</div>
	{/each}
</div>
