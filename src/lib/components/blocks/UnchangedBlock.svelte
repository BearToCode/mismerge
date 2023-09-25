<script lang="ts">
	import type { Line } from '$lib/internal/blocks';
	import type { BlockComponent } from '$lib/internal/component';

	export let lines: Line[];
	export let component: BlockComponent;
</script>

<div class="block {component.type}" id={component.id}>
	{#each lines as line}
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
