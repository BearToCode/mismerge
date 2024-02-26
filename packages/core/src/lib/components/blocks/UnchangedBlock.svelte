<script lang="ts">
	import type { Line } from '$lib/internal/blocks';
	import type { BlockComponent } from '$lib/internal/editor/component';

	export let lines: Line[];
	export let component: BlockComponent;
</script>

<div class="msm__block {component.type}" data-component-id={component.id}>
	{#each lines as line}
		<div class="msm__line">
			<div class="msm__content">
				<!-- 
					An empty character is needed, as in Chromium <pre> elements with
					no content have height 0. 
				-->
				<pre>{line.content.trim() != '' ? line.content : ' '}</pre>
			</div>
		</div>
	{/each}
</div>
