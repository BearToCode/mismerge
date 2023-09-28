<script lang="ts">
	import type { BlockComponent } from '$lib/internal/editor/component';
	import { TwoWaySide, type Side } from '$lib/internal/editor/side';
	import { createEventDispatcher, onMount } from 'svelte';
	import ArrowIcon from './icons/ArrowIcon.svelte';

	/* Exports */

	export let side: Side;
	export let components: BlockComponent[];
	export let disableMerging: boolean;
	export let componentsElements: HTMLDivElement[];

	/* Local variables */

	let addMergeActions =
		!disableMerging && (!(side instanceof TwoWaySide) || !side.eq(TwoWaySide.ctr));
	let direction: 'right' | 'left' = side.eq(TwoWaySide.lhs) ? 'right' : 'left';
	let linesComponents: {
		startingLineNumber: number;
		component: BlockComponent;
	}[] = [];

	/* Local functions */

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

	function getLineHeight(componentIndex: number, lineIndex: number) {
		const componentElem = componentsElements[componentIndex];
		if (!componentElem) return '';
		const lineElem = Array.from(componentElem.querySelectorAll('.msm__line')).at(lineIndex);
		if (!lineElem) return '';
		return `${lineElem.clientHeight}px`;
	}

	/* Reactive statements */

	$: generateLines(components);

	/* Events */

	const dispatch = createEventDispatcher<{ merge: { component: BlockComponent } }>();
</script>

<div class="msm__side_panel {direction}">
	{#each linesComponents as { startingLineNumber, component }, componentIndex}
		{#if component.placeholder}
			<div class="msm__line_placeholder {component.type}" />
		{:else}
			{#each { length: component.linesCount } as _, lineIndex}
				{#key componentsElements[componentIndex]}
					<div
						style="height: {getLineHeight(componentIndex, lineIndex)};"
						class="msm__line_number {component.type}"
					>
						{#if lineIndex == 0 && addMergeActions && component.mergeActions}
							<button
								class="msm__merge_button {direction}"
								on:click={() => dispatch('merge', { component })}
							>
								<ArrowIcon />
							</button>
						{/if}

						<pre>{startingLineNumber + lineIndex}</pre>
					</div>
				{/key}
			{/each}
		{/if}
	{/each}
</div>
