<script lang="ts">
	import type { LineDiffAlgorithm } from '$lib/internal/diff';
	import type { EditorColors } from '$lib/internal/colors';
	import type { BlockComponent } from '$lib/internal/component';
	import { OneWaySide, type DiffBlock, LinkedComponentsBlock } from '$lib/internal/blocks';
	import { assembleOneWay } from '$lib/internal/one-way-assembler';
	import { joinWithDefault } from '$lib/internal/utils';
	import View from './View.svelte';
	import type { Connection } from '$lib/internal/connection';
	import Connector from './Connector.svelte';
	import { onDestroy, onMount } from 'svelte';

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
	let userColors: Partial<EditorColors> = {};
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

	const defaultColors: EditorColors = {
		addedLight: '#d4eed4',
		addedDark: '#bee6bd',
		removedLight: '#fff2f0',
		removedDark: '#ffdfd8',
		modifiedLight: '#e4f4f5',
		modifiedDark: '#d3f0f2'
	};
	const editorColors = joinWithDefault(userColors, defaultColors);

	let blocks: DiffBlock[] = [];
	let connections: Connection[] = [];
	let components: BlockComponent[] = [];

	let container: HTMLDivElement;
	let lhsViewElem: HTMLDivElement;
	let rhsViewElem: HTMLDivElement;
	let drawConnections: (container: HTMLDivElement, connections: Connection[]) => void;

	function renderComponents(blocks: DiffBlock[]) {
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
		--light-green: {editorColors.addedLight};
		--dark-green: {editorColors.addedDark};
		--light-red: {editorColors.removedLight};
		--dark-red: {editorColors.removedDark};
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
		<Connector
			colors={editorColors}
			bind:draw={drawConnections}
			bind:lhsViewElem
			bind:rhsViewElem
		/>
	{/if}
	<View
		editable={rhsEditable}
		side={OneWaySide.rhs}
		bind:components
		bind:content={rhs}
		bind:elem={rhsViewElem}
	/>
</div>
