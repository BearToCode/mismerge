<script lang="ts">
	import type { BlockComponent } from '$lib/internal/editor/component';
	import { TwoWaySide, type Side } from '$lib/internal/editor/side';

	let {
		side,
		components,
		disableMerging,
		renderedSideComponents,
		onmerge,
		ondelete,
		onresolve
	}: {
		side: Side;
		components: BlockComponent[];
		disableMerging: boolean;
		renderedSideComponents: {
			block: HTMLDivElement;
			lines: HTMLDivElement[];
			linesHeights: number[];
		}[];
		onmerge?: (component: BlockComponent) => void;
		ondelete?: (component: BlockComponent) => void;
		onresolve?: (component: BlockComponent) => void;
	} = $props();

	const direction = $derived(side.eq(TwoWaySide.lhs) ? 'right' : 'left');

	const linesComponents = $derived.by(() => {
		const result: { startingLineNumber: number; component: BlockComponent }[] = [];
		let line = 1;
		for (const component of components) {
			result.push({ startingLineNumber: line, component });
			line += component.linesCount;
		}
		return result;
	});
</script>

<div class="msm__side-panel msm__{direction}">
	{#if renderedSideComponents}
		{#each renderedSideComponents as { block, lines, linesHeights }, index}
			{@const lineComponent = linesComponents[index]}

			{#if lineComponent}
				{@const { startingLineNumber, component } = lineComponent}
				{@const acceptedClass = component.props.acceptedInCenter ? 'accepted' : ''}
				{#if block && lines}
					{#if lines.length == 0}
						<div
							class="msm__line-placeholder {component.visualType} {acceptedClass}"
							data-component-id={component.id}
						></div>
					{:else}
						{#each lines as _line, lineIndex}
							<div
								style="height: {linesHeights[lineIndex]}px;"
								class="msm__line-number {component.visualType} {acceptedClass}"
								data-component-id={component.id}
							>
								{#if lineIndex == 0 && !disableMerging && component.sideAction}
									{@const ActionComp = component.sideAction.component}
									<ActionComp
										{...component.sideAction.props}
										{component}
										{onmerge}
										{ondelete}
										{onresolve}
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
