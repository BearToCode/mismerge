<script lang="ts">
	import type { BlockComponent } from '$lib/internal/component';
	import type { Side } from '$lib/internal/side';

	export let components: BlockComponent[];
	export let editable: boolean = false;
	export let content: string;
	export let side: Side;
	export let elem: HTMLDivElement;
	let clazz = '';
	export { clazz as class };

	let textarea: HTMLTextAreaElement | undefined;

	let sideComponents: BlockComponent[] = [];

	$: sideComponents = components.filter((component) => component.side.eq(side));
</script>

<div bind:this={elem} class="view {editable ? 'editable' : ''} {clazz}">
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
			on:scroll={() => textarea && (textarea.scrollTop = 0)}
		/>
	{/if}
</div>
