<script lang="ts">
	import { joinWithDefault } from '$lib/internal/utils';
	import { type DiffBlock, LinkedComponentsBlock } from '$lib/internal/blocks';
	import { type DiffColors, DefaultDiffColors } from '$lib/internal/editor/colors';
	import type { BlockComponent } from '$lib/internal/editor/component';
	import { drawOnChange, type Connection } from '$lib/internal/editor/connection';
	import { assembleOneWay } from '$lib/internal/diff/one-way-assembler';
	import { OneWaySide, Side } from '$lib/internal/editor/side';
	import View from './View.svelte';
	import Connector from './Connector.svelte';
	import type { LineDiffAlgorithm } from '$lib/internal/diff/line-diff';
	import { mergeComponent } from '$lib/internal/editor/merging';

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
	/**
	 * Disable merging actions.
	 */
	export let disableMerging = false;
	/**
	 * Enables lines wrapping.
	 */
	export let wrapLines = false;

	const colors = joinWithDefault(userColors, DefaultDiffColors);

	let blocks: DiffBlock<Side>[] = [];
	let connections: Connection[] = [];
	let components: BlockComponent[] = [];

	let container: HTMLDivElement;
	let lhsViewElem: HTMLDivElement;
	let rhsViewElem: HTMLDivElement;
	let drawConnections: (container: HTMLDivElement, connections: Connection[]) => void;
	let saveLhsHistory: () => void;
	let saveRhsHistory: () => void;

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

	// Returns a function that merges a component from the given side.
	function mergeComponentHandler(side: OneWaySide) {
		return (
			e: CustomEvent<{
				component: BlockComponent<Record<string, unknown>>;
			}>
		) => {
			mergeComponent({ source: e.detail.component, side, components, container });

			// Save editor history after merging.
			if (e.detail.component.side.eq(OneWaySide.lhs)) saveRhsHistory();
			else saveLhsHistory();
		};
	}

	const redrawConnections = () => {
		if (!container) return;
		drawConnections(container, connections);
	};

	$: blocks = assembleOneWay(lhs, rhs, { lineDiffAlgorithm });
	$: renderComponents(blocks);

	drawOnChange(() => container, redrawConnections);
</script>

<div
	style="
		--added: {colors.added};
		--removed: {colors.removed};
		--added-overlay: {colors.addedOverlay};
		--removed-overlay: {colors.removedOverlay};
	"
	class="mismerge {wrapLines ? 'wrap_lines' : ''} {clazz}"
	bind:this={container}
>
	<View
		{disableMerging}
		editable={lhsEditable}
		side={OneWaySide.lhs}
		bind:components
		bind:content={lhs}
		bind:elem={lhsViewElem}
		bind:saveHistory={saveLhsHistory}
		on:merge={mergeComponentHandler(OneWaySide.lhs)}
		on:newline={redrawConnections}
	/>
	<Connector {colors} bind:draw={drawConnections} bind:lhsViewElem bind:rhsViewElem />
	<View
		{disableMerging}
		editable={rhsEditable}
		side={OneWaySide.rhs}
		bind:components
		bind:content={rhs}
		bind:elem={rhsViewElem}
		bind:saveHistory={saveRhsHistory}
		on:merge={mergeComponentHandler(OneWaySide.rhs)}
		on:newline={redrawConnections}
	/>
</div>
