<script lang="ts">
	import type { DiffBlock } from '$lib/internal/blocks';
	import type { BlockComponent } from '$lib/internal/component';
	import type { Side } from '$lib/internal/side';
	import LineNumbers from './LineNumbers.svelte';

	export let components: BlockComponent[];
	export let editable: boolean = false;
	export let content: string;
	export let side: Side;
	export let lineNumbersSide: 'left' | 'right' = 'left';
	let clazz = '';
	export { clazz as class };

	let textarea: HTMLTextAreaElement | undefined;
	let containerElem: HTMLDivElement;

	export { containerElem as elem };

	let sideComponents: BlockComponent[] = [];
	let width = 0;

	$: sideComponents = components.filter((component) => component.side.eq(side));
</script>

<div bind:this={containerElem} class="view {editable ? 'editable' : ''} {clazz}">
	{#if lineNumbersSide == 'left'}
		<LineNumbers side={lineNumbersSide} components={sideComponents} />
	{/if}
	<div class="view-content">
		<div bind:clientWidth={width} class="wrapper">
			{#each sideComponents as blockComponent}
				<svelte:component
					this={blockComponent.component}
					component={blockComponent}
					{...blockComponent.props}
				/>
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
