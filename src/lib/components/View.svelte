<script lang="ts">
	import type { BlockComponent } from '$lib/internal/editor/component';
	import type { Side } from '$lib/internal/editor/side';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import SidePanel from './SidePanel.svelte';
	import { CodeInput } from '$lib/internal/input/code-input';
	import { DEV } from '$lib/internal/utils';

	export let components: BlockComponent[];
	export let editable: boolean = false;
	export let content: string;
	export let side: Side;
	export let disableMerging: boolean;
	export let lineNumbersSide: 'left' | 'right' = 'left';
	export const saveHistory = () => codeInput?.saveHistoryState();
	export { clazz as class };
	export { containerElem as elem };

	let clazz = '';
	let textarea: HTMLTextAreaElement | undefined;
	let containerElem: HTMLDivElement;
	let contentElem: HTMLDivElement;
	let sideComponents: BlockComponent[] = [];
	let sideComponentElements: HTMLDivElement[] = [];
	let previousHeight = 0;
	let width = 0;
	let mounted = false;
	let codeInput: CodeInput | undefined;
	onMount(() => (mounted = true));

	$: sideComponents = components.filter((component) => component.side.eq(side));
	$: handleTextArea(textarea);

	function handleTextArea(textarea: HTMLTextAreaElement | undefined) {
		if (!mounted) return;
		if (textarea && codeInput) return;

		if (!textarea) {
			if (codeInput) codeInput.dispose();
			return;
		}
		codeInput = new CodeInput(textarea);
	}

	// Events
	const dispatch = createEventDispatcher<{
		newline: {};
	}>();

	// Trigger a reload when all the elements have been mounted
	const findElements = () => {
		if (!contentElem) return;
		const elements = Array.from(contentElem.querySelectorAll('.msm__block'));
		if (elements.length == sideComponents.length) {
			sideComponentElements = elements as HTMLDivElement[];
		}
	};

	let observer: MutationObserver | undefined;
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

<div bind:this={containerElem} class="msm__view {editable ? 'editable' : ''} {clazz}">
	{#if lineNumbersSide == 'left'}
		<SidePanel
			{side}
			{disableMerging}
			components={sideComponents}
			componentsElements={sideComponentElements}
			on:merge
		/>
	{/if}
	<div class="msm__view_content">
		<div bind:this={contentElem} bind:clientWidth={width} class="msm__wrapper">
			{#each sideComponents as blockComponent, i}
				<svelte:component
					this={blockComponent.component}
					component={blockComponent}
					{...blockComponent.props}
				/>
				<!-- TODO: find out the origin of unknown props warnings -->
				<!-- {@const _ = void console.log(blockComponent, blockComponent.props)} -->
			{/each}
		</div>

		{#if editable}
			<textarea
				spellcheck="false"
				bind:this={textarea}
				bind:value={content}
				style="--scroll-width: {width}px;"
				on:scroll={() => textarea && (textarea.scrollTop = 0)}
				on:keyup={() => {
					if (!textarea) return;
					// Listen for new rows
					textarea.style.height = '0px';
					textarea.style.minHeight = '0px';
					const newHeight = textarea.scrollHeight;
					textarea.style.height = '';
					textarea.style.minHeight = '';
					if (newHeight != previousHeight) {
						previousHeight = newHeight;
						sideComponentElements = sideComponentElements;
						dispatch('newline', {});
					}
				}}
			/>
		{/if}
	</div>
	{#if lineNumbersSide == 'right'}
		<SidePanel
			{side}
			{disableMerging}
			components={sideComponents}
			componentsElements={sideComponentElements}
			on:merge
		/>
	{/if}
</div>
