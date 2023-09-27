<script lang="ts">
	import type { BlockComponent } from '$lib/internal/editor/component';
	import { TwoWaySide, type Side } from '$lib/internal/editor/side';
	import { createEventDispatcher } from 'svelte';
	import ArrowIcon from './icons/ArrowIcon.svelte';

	export let container: HTMLDivElement;
	export let side: Side;
	export let components: BlockComponent[];
	export let disableMerging: boolean;

	let addMergeActions =
		!disableMerging && (!(side instanceof TwoWaySide) || !side.eq(TwoWaySide.ctr));
	let direction: 'right' | 'left' = side.eq(TwoWaySide.lhs) ? 'right' : 'left';
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

	function getLineHeight(componentId: string, idx: number) {
		if (!container) return null;
		const componentElem = Array.from(
			container.querySelectorAll(`[id="${componentId}"] .msm__line`)
		).at(idx);
		if (!componentElem) return null;
		return componentElem.clientHeight;
	}

	$: generateLines(components);

	// Events

	const dispatch = createEventDispatcher<{ merge: { component: BlockComponent } }>();
</script>

<div class="msm__side_panel {direction}">
	{#each linesComponents as { startingLineNumber, component }}
		{#if component.placeholder}
			<div class="msm__line_placeholder {component.type}" />
		{:else}
			{#each { length: component.linesCount } as _, i}
				{@const lineHeight = getLineHeight(component.id, i)}
				<div
					style="height: {lineHeight ? lineHeight + 'px' : 'unset'};"
					class="msm__line_number {component.type}"
				>
					{#if i == 0 && addMergeActions && component.mergeActions}
						<button
							class="msm__merge_button {direction}"
							on:click={() => {
								dispatch('merge', { component });
							}}
						>
							<ArrowIcon />
						</button>
					{/if}

					<pre>{startingLineNumber + i}</pre>
				</div>
			{/each}
		{/if}
	{/each}
</div>
