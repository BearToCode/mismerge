<script lang="ts">
	import type { DiffBlock } from '$lib/internal/blocks';
	import type { BlockComponent } from '$lib/internal/component';
	import type { Side } from '$lib/internal/side';
	import { onMount } from 'svelte';
	import LineNumbers from './LineNumbers.svelte';
	import { CodeInput } from '$lib/internal/input/code-input';

	export let components: BlockComponent[];
	export let editable: boolean = false;
	export let content: string;
	export let side: Side;
	export let lineNumbersSide: 'left' | 'right' = 'left';
	export { clazz as class };
	export { containerElem as elem };

	let clazz = '';
	let textarea: HTMLTextAreaElement | undefined;
	let containerElem: HTMLDivElement;
	let sideComponents: BlockComponent[] = [];
	let width = 0;
	let mounted = false;
	let codeInput: CodeInput | undefined;
	onMount(() => (mounted = true));

	$: sideComponents = components.filter((component) => component.side.eq(side));
	$: onTextAreaCreationOrDisposal(textarea);

	function onTextAreaCreationOrDisposal(textarea: HTMLTextAreaElement | undefined) {
		if (!mounted) return;

		if (!textarea) {
			if (codeInput) codeInput.dispose();
			return;
		}

		codeInput = new CodeInput(textarea);
	}
</script>

<div bind:this={containerElem} class="msm__view {editable ? 'editable' : ''} {clazz}">
	{#if lineNumbersSide == 'left'}
		<LineNumbers side={lineNumbersSide} components={sideComponents} />
	{/if}
	<div class="msm__view-content">
		<div bind:clientWidth={width} class="msm__wrapper">
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

		{#if editable}
			<textarea
				spellcheck="false"
				bind:this={textarea}
				bind:value={content}
				style="--scroll-width: {width}px;"
				on:scroll={() => textarea && (textarea.scrollTop = 0)}
			/>
		{/if}
	</div>
	{#if lineNumbersSide == 'right'}
		<LineNumbers side={lineNumbersSide} components={sideComponents} />
	{/if}
</div>
