<script lang="ts">
	import type { BlockComponent } from '$lib/internal/component';
	import type { Side } from '$lib/internal/side';

	export let components: BlockComponent[];
	export let editable: boolean = false;
	export let content: string;
	export let side: Side;
	let clazz = '';
	export { clazz as class };

	let textarea: HTMLTextAreaElement | undefined;
	let containerElem: HTMLDivElement;

	export { containerElem as elem };

	let sideComponents: BlockComponent[] = [];
	let scrollWidth = 0;

	$: sideComponents = components.filter((component) => component.side.eq(side));
</script>

<div bind:this={containerElem} class="view {editable ? 'editable' : ''} {clazz}">
	<div bind:clientWidth={scrollWidth} class="view-content">
		{#each sideComponents as blockComponent}
			<svelte:component
				this={blockComponent.component}
				component={blockComponent}
				{...blockComponent.props}
			/>
		{/each}

		{#if editable}
			<textarea
				spellcheck="false"
				bind:this={textarea}
				bind:value={content}
				style="--scroll-width: {scrollWidth}px;"
				on:scroll={() => textarea && (textarea.scrollTop = 0)}
			/>
		{/if}
	</div>
</div>
