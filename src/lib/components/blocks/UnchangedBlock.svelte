<script lang="ts">
	import type { Line } from '$lib/internal/blocks';
	import type { BlockComponent } from '$lib/internal/editor/component';

	export let lines: Line[];
	export let component: BlockComponent;
</script>

<div class="msm__block {component.type}" id={component.id}>
	{#each lines as line}
		<div class="msm__line">
			<div class="msm__content">
				<pre>{line.content}</pre>
			</div>
		</div>
	{/each}
</div>
