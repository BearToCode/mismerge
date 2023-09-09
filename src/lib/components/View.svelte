<script lang="ts">
	import type { DiffBlock, MountedDiffBlock } from '$lib/internal/blocks';
	import { onDestroy, onMount } from 'svelte';
	import AddedBlock from './blocks/AddedBlock.svelte';
	import AddedBlockPlaceholder from './blocks/AddedBlockPlaceholder.svelte';
	import PartiallyAddedBlock from './blocks/PartiallyAddedBlock.svelte';
	import PartiallyRemovedBlock from './blocks/PartiallyRemovedBlock.svelte';
	import RemovedBlock from './blocks/RemovedBlock.svelte';
	import RemovedBlockPlaceholder from './blocks/RemovedBlockPlaceholder.svelte';
	import UnchangedBlock from './blocks/UnchangedBlock.svelte';

	export let blocks: DiffBlock[];
	export let mountedBlocks: MountedDiffBlock[];
	export let editable: boolean = false;
	export let content: string;
	export let elem: HTMLDivElement;
	let clazz = '';
	export { clazz as class };

	let textarea: HTMLTextAreaElement | undefined;

	function mountBlocks(elements: HTMLDivElement[]) {
		mountedBlocks = [];
		for (const [index, block] of blocks.entries()) {
			mountedBlocks.push({
				...block,
				elem: elements[index]
			});
		}
		mountedBlocks = mountedBlocks;
	}

	function updateBlocks() {
		const children = elem.getElementsByClassName('block') as HTMLCollectionOf<HTMLDivElement>;
		if (children.length == blocks.length) mountBlocks(Array.from(children));
	}

	let observer: MutationObserver | undefined;
	onMount(() => {
		observer = new MutationObserver(updateBlocks);
		observer.observe(elem, {
			childList: true,
			attributes: false,
			characterData: false,
			subtree: true
		});

		updateBlocks();
	});
	onDestroy(() => observer?.disconnect());
</script>

<div bind:this={elem} class="view {editable ? 'editable' : ''} {clazz}">
	{#each blocks as block, index}
		{#if block.type == 'added'}
			<AddedBlock {block} />
		{:else if block.type == 'added_placeholder'}
			<AddedBlockPlaceholder {block} />
		{:else if block.type == 'removed'}
			<RemovedBlock {block} />
		{:else if block.type == 'removed_placeholder'}
			<RemovedBlockPlaceholder {block} />
		{:else if block.type == 'partially_added'}
			<PartiallyAddedBlock {block} />
		{:else if block.type == 'partially_removed'}
			<PartiallyRemovedBlock {block} />
		{:else if block.type == 'unchanged'}
			<UnchangedBlock {block} />
		{/if}
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
