<script lang="ts">
	import type { BlockComponent } from '$lib/internal/component';

	export let side: 'left' | 'right';
	export let components: BlockComponent[];

	let linesComponents: {
		startingLineNumber: number;
		component: BlockComponent;
	}[] = [];

	function generateLines(components: BlockComponent[]) {
		linesComponents = [];
		let line = 1;
		for (const component of components) {
			linesComponents.push({
				startingLineNumber: line,
				component
			});
			line += component.linesCount;
		}
		linesComponents = linesComponents;
	}

	$: generateLines(components);
</script>

<div class="line-numbers {side}">
	{#each linesComponents as { startingLineNumber, component }}
		{#if component.placeholder}
			<div class="line-placeholder {component.type}" />
		{:else}
			{#each { length: component.linesCount } as _, i}
				<div class="line-number {component.type}"><pre>{startingLineNumber + i}</pre></div>
			{/each}
		{/if}
	{/each}
</div>
