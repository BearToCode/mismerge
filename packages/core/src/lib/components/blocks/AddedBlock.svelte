<script lang="ts">
	import type { Line } from '$lib/internal/blocks';
	import type { BlockComponent } from '$lib/internal/editor/component';

	let {
		component,
		lines
	}: { component: BlockComponent; lines: Line[] } = $props();
</script>

<div class="msm__block {component.visualType}" data-component-id={component.id}>
	{#each lines as line}
		<div class="msm__line">
			<div class="msm__content">
				<pre>{line.content}</pre>
			</div>
		</div>
	{/each}
</div>
