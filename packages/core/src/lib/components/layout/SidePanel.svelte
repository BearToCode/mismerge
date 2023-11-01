<script lang="ts">
	import type { BlockComponent } from '$lib/internal/editor/component';
	import type { SidePanelEvents } from '$lib/internal/events';
	import { TwoWaySide, type Side } from '$lib/internal/editor/side';
	import { createEventDispatcher } from 'svelte';

	/* Exports */

	export let side: Side;
	export let components: BlockComponent[];
	export let disableMerging: boolean;
	export let renderedSideComponents: {
		block: HTMLDivElement;
		lines: HTMLDivElement[];
		linesHeights: number[];
	}[] = [];

	/* Local variables */

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

	/* Reactive statements */

	$: generateLines(components);

	/* Events */

	const dispatch = createEventDispatcher<SidePanelEvents>();
</script>

<div class="msm__side-panel msm__{direction}">
	{#if renderedSideComponents}
		{#each renderedSideComponents as { block, lines, linesHeights }, index}
			{@const lineComponent = linesComponents[index]}

			{#if lineComponent}
				{@const { startingLineNumber, component } = lineComponent}
				{#if block && lines}
					{#if lines.length == 0}
						<div class="msm__line-placeholder {component.type}" />
					{:else}
						<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
						{#each lines as _, lineIndex}
							<div
								style="height: {linesHeights[lineIndex]}px;"
								class="msm__line-number {component.type}"
							>
								{#if lineIndex == 0 && !disableMerging && component.sideAction}
									<svelte:component
										this={component.sideAction.component}
										{...component.sideAction.props}
										{component}
										{dispatch}
									/>
								{/if}

								<pre>{startingLineNumber + lineIndex}</pre>
							</div>
						{/each}
					{/if}
				{/if}
			{/if}
		{/each}
	{/if}
</div>
