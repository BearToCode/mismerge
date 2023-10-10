<script lang="ts">
	import type { BlockComponent } from '$lib/internal/editor/component';
	import type { Side } from '$lib/internal/editor/side';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import SidePanel from './SidePanel.svelte';
	import { DEV } from '$lib/internal/utils';
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
	let sideComponentElements: HTMLDivElement[] = [];
	let saveHistory: () => void;
	let height = 0;
	let width = 0;
	let observer: MutationObserver | undefined;

	/* Local functions */

	const findElements = () => {
		// Find and invalidated all the elements after they have been mounted in the DOM
		if (!contentElem) return;
		const elements = Array.from(contentElem.querySelectorAll('.msm__block'));
		if (elements.length == sideComponents.length) {
			sideComponentElements = elements as HTMLDivElement[];
		}
	};

	const redrawLines = () => (sideComponentElements = sideComponentElements);

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
		findElements();
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
			components={sideComponents}
			componentsElements={sideComponentElements}
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
				<!-- TODO: find out the origin of unknown props warnings -->
				<!-- {@const _ = void console.log(blockComponent, blockComponent.props)} -->
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
			components={sideComponents}
			componentsElements={sideComponentElements}
			on:resolve
			on:merge
		/>
	{/if}
</div>
