<script lang="ts">
	import type { BlockComponent } from '$lib/internal/editor/component';
	import type { Side } from '$lib/internal/editor/side';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { DEV } from '$lib/internal/utils';
	import SidePanel from './SidePanel.svelte';
	import Editor from './Editor.svelte';
	import HighlightOverlay from './HighlightOverlay.svelte';

	/* Exports */

	export let components: BlockComponent[];
	export let editable = false;
	export let content: string;
	export let side: Side;
	export let disableMerging: boolean;
	export let lineNumbersSide: 'left' | 'right' = 'left';
	export let highlight: ((text: string) => string | Promise<string>) | undefined;
	export { clazz as class };
	export { containerElem as elem };
	// This way it is kept as an optional binding
	const _saveHistory = () => saveHistory();
	export { _saveHistory as saveHistory };

	/* Local variables */

	let clazz = '';
	let containerElem: HTMLDivElement;
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
	let observer: MutationObserver | undefined;

	/* Local functions */

	const findElements = () => {
		// Find and invalidated all the elements after they have been mounted in the DOM
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

	/* Lifecycle hooks */

	onMount(() => {
		if (!containerElem) {
			if (DEV) console.error('containerElem is undefined');
			return;
		}
		observer = new MutationObserver(findElements);
		observer.observe(contentElem, {
			characterData: false,
			attributes: false,
			childList: true,
			subtree: true
		});
		// FIXME: This is a hack to make sure the elements are rendered properly
		// the first time. I don't know why this is needed, but it works.
		findElements();
		setTimeout(findElements, 1);
	});
	onDestroy(() => observer?.disconnect());
</script>

<div
	bind:this={containerElem}
	class="msm__view {highlight ? 'highlight' : ''} {editable ? 'editable' : ''} {clazz}"
>
	{#if lineNumbersSide == 'left'}
		<SidePanel
			{side}
			{disableMerging}
			{renderedSideComponents}
			components={sideComponents}
			on:merge
			on:resolve
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
					component={blockComponent}
					{...blockComponent.props}
				/>
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
			on:resolve
			on:merge
		/>
	{/if}
</div>
