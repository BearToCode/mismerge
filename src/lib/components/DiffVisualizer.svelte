<script lang="ts">
	import { joinWithDefault } from '$lib/internal/utils';
	import { onDestroy, onMount } from 'svelte';
	import { type DiffBlock, LinkedComponentsBlock } from '$lib/internal/blocks';
	import { type DiffColors, DefaultDiffColors } from '$lib/internal/colors';
	import type { BlockComponent } from '$lib/internal/component';
	import type { Connection } from '$lib/internal/connection';
	import { assembleOneWay } from '$lib/internal/one-way-assembler';
	import { OneWaySide, Side } from '$lib/internal/side';
	import View from './View.svelte';
	import Connector from './Connector.svelte';
	import type { LineDiffAlgorithm } from '$lib/internal/line-diff';

	/**
	 * Left hand side content.
	 */
	export let lhs: string;
	/**
	 * Right hand side content.
	 */
	export let rhs: string;
	/**
	 * Custom colors to use for the editor.
	 */
	let userColors: Partial<DiffColors> = {};
	export { userColors as colors };
	/**
	 * Whether the left hand side content is editable.
	 */
	export let lhsEditable = false;
	/**
	 * Whether the right hand side content is editable.
	 */
	export let rhsEditable = false;
	/**
	 * Line diff algorithm.
	 * @default "words_with_space"
	 */
	export let lineDiffAlgorithm: LineDiffAlgorithm = 'words_with_space';
	let clazz = '';
	export { clazz as class };

	const colors = joinWithDefault(userColors, DefaultDiffColors);

	let blocks: DiffBlock<Side>[] = [];
	let connections: Connection[] = [];
	let components: BlockComponent[] = [];

	let container: HTMLDivElement;
	let lhsViewElem: HTMLDivElement;
	let rhsViewElem: HTMLDivElement;
	let drawConnections: (container: HTMLDivElement, connections: Connection[]) => void;

	function renderComponents(blocks: DiffBlock<Side>[]) {
		connections = [];
		components = blocks
			.map((block) => {
				const comps = block.render();
				if (block instanceof LinkedComponentsBlock)
					connections.push(...block.connections([comps].flat()));
				return comps;
			})
			.flat();
	}

	$: blocks = assembleOneWay(lhs, rhs, { lineDiffAlgorithm });
	$: renderComponents(blocks);

	let observer: MutationObserver | undefined;
	onMount(() => {
		observer = new MutationObserver(() => drawConnections(container, connections));
		observer.observe(container, {
			characterData: false,
			attributes: false,
			childList: true,
			subtree: true
		});
	});

	onDestroy(() => observer?.disconnect());
</script>

<div
	style="
		--added: {colors.added};
		--removed: {colors.removed};
		--added-overlay: {colors.addedOverlay};
		--removed-overlay: {colors.removedOverlay};
	"
	class="limerge diff-visualizer {clazz}"
	bind:this={container}
>
	<View
		editable={lhsEditable}
		side={OneWaySide.lhs}
		bind:components
		bind:content={lhs}
		bind:elem={lhsViewElem}
	/>
	{#if container}
		<Connector {colors} bind:draw={drawConnections} bind:lhsViewElem bind:rhsViewElem />
	{/if}
	<View
		editable={rhsEditable}
		side={OneWaySide.rhs}
		bind:components
		bind:content={rhs}
		bind:elem={rhsViewElem}
	/>
</div>
