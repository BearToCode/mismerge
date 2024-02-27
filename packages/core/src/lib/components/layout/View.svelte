<script lang="ts">
	import type { BlockComponent } from '$lib/internal/editor/component';
	import type { Side } from '$lib/internal/editor/side';
	import { createEventDispatcher } from 'svelte';
	import SidePanel from './SidePanel.svelte';
	import Editor from './Editor.svelte';
	import HighlightOverlay from './HighlightOverlay.svelte';
	import { deleteComponent, mergeComponent } from '$lib/internal/editor/actions';

	/* Exports */

	export let elem: HTMLDivElement;
	export let container: HTMLDivElement;
	export let components: BlockComponent[];
	export let editable = false;
	export let content: string;
	export let side: Side;
	export let disableMerging: boolean;
	export let lineNumbersSide: 'left' | 'right' = 'left';
	export let highlight: ((text: string) => string | Promise<string>) | undefined;
	export { clazz as class };

	/* Local variables */

	let clazz = '';
	let contentElem: HTMLDivElement;
	let sideComponents: BlockComponent[] = [];
	let renderedSideComponents: {
		block: HTMLDivElement;
		lines: HTMLDivElement[];
		linesHeights: number[];
	}[] = [];
	let saveHistory: () => void;
	let height = 0;
	let width = 0;

	/* Local functions */

	export const update = () => {
		// Find all the blocks elements after they have been mounted in the DOM
		if (!contentElem) return;
		const elements = Array.from(contentElem.querySelectorAll('.msm__block'));
		if (elements.length != sideComponents.length) return;

		renderedSideComponents = elements.map((blockElem) => {
			const lines = Array.from(blockElem.querySelectorAll('.msm__line'));
			const heights = lines.map((line) => line.getBoundingClientRect().height);
			return {
				block: blockElem as HTMLDivElement,
				lines: lines as HTMLDivElement[],
				linesHeights: heights
			};
		});
	};

	const redrawLines = () => (renderedSideComponents = renderedSideComponents);

	// Actions

	const onMerge = (e: CustomEvent<{ component: BlockComponent }>) => {
		mergeComponent({ source: e.detail.component, side, components, container });
		if (saveHistory) saveHistory();
	};

	const onDelete = (e: CustomEvent<{ component: BlockComponent }>) => {
		deleteComponent({ component: e.detail.component, container });
		if (saveHistory) saveHistory();
	};

	/* Reactive statements */

	$: sideComponents = components.filter((component) => component.side.eq(side));
	$: {
		height;
		redrawLines();
		dispatch('height-change', {});
	}

	/* Events */

	const dispatch = createEventDispatcher<{
		'height-change': Record<string, never>;
	}>();
</script>

<div
	bind:this={elem}
	class="msm__view {highlight ? 'highlight' : ''} {editable ? 'editable' : ''} {clazz}"
>
	{#if lineNumbersSide == 'left'}
		<SidePanel
			{side}
			{disableMerging}
			{renderedSideComponents}
			components={sideComponents}
			on:merge={onMerge}
			on:delete={onDelete}
			on:merge
			on:resolve
			on:delete
		/>
	{/if}
	<div class="msm__view-content">
		<div
			class="msm__wrapper"
			bind:this={contentElem}
			bind:clientWidth={width}
			bind:clientHeight={height}
		>
			{#each sideComponents as blockComponent}
				<svelte:component
					this={blockComponent.component}
					{...{ ...blockComponent.props, component: blockComponent }}
				/>
				<!-- 
					☝️ The weird spread is needed due to a Svelte bug affecting the use of 
					`<svelte:component>` with spread props and normal ones in v4.
					See here for more details: https://github.com/sveltejs/svelte/issues/9177	
				-->
			{/each}
		</div>

		{#if highlight}
			<HighlightOverlay bind:content bind:width {highlight} />
		{/if}

		{#if editable}
			<Editor bind:content bind:width bind:saveHistory on:input on:keydown on:keypress on:keyup />
		{/if}
	</div>
	{#if lineNumbersSide == 'right'}
		<SidePanel
			{side}
			{disableMerging}
			{renderedSideComponents}
			components={sideComponents}
			on:merge={onMerge}
			on:delete={onDelete}
			on:resolve
			on:merge
			on:delete
		/>
	{/if}
</div>
