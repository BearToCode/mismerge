<script lang="ts">
	import type { DiffBlock, MountedDiffBlock } from '$lib/internal/blocks';
	import type { EditorColors } from '$lib/internal/colors';
	import { onMount } from 'svelte';
	import AddedBlock from './blocks/AddedBlock.svelte';
	import AddedBlockPlaceholder from './blocks/AddedBlockPlaceholder.svelte';
	import PartiallyAddedBlock from './blocks/PartiallyAddedBlock.svelte';
	import PartiallyRemovedBlock from './blocks/PartiallyRemovedBlock.svelte';
	import RemovedBlock from './blocks/RemovedBlock.svelte';
	import RemovedBlockPlaceholder from './blocks/RemovedBlockPlaceholder.svelte';
	import UnchangedBlock from './blocks/UnchangedBlock.svelte';

	export let blocks: DiffBlock[];
	export let mountedBlocks: MountedDiffBlock[];
	let clazz = '';
	export { clazz as class };

	let elements: HTMLDivElement[];
	$: elements = new Array(blocks.length);

	onMount(() => {
		for (const [index, block] of blocks.entries()) {
			mountedBlocks.push({
				...block,
				elem: elements[index]
			});
		}
		mountedBlocks = mountedBlocks;
	});
</script>

<div class="view {clazz}">
	{#each blocks as block, index}
		{#if block.type == 'added'}
			<AddedBlock bind:elem={elements[index]} {block} />
		{:else if block.type == 'added_placeholder'}
			<AddedBlockPlaceholder bind:elem={elements[index]} {block} />
		{:else if block.type == 'removed'}
			<RemovedBlock bind:elem={elements[index]} {block} />
		{:else if block.type == 'removed_placeholder'}
			<RemovedBlockPlaceholder bind:elem={elements[index]} {block} />
		{:else if block.type == 'partially_added'}
			<PartiallyAddedBlock bind:elem={elements[index]} {block} />
		{:else if block.type == 'partially_removed'}
			<PartiallyRemovedBlock bind:elem={elements[index]} {block} />
		{:else if block.type == 'unchanged'}
			<UnchangedBlock bind:elem={elements[index]} {block} />
		{/if}
	{/each}
</div>
