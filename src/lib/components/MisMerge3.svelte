<script lang="ts">
	import type { BlockComponent } from '$lib/internal/editor/component';
	import { drawOnChange, type Connection } from '$lib/internal/editor/connection';
	import { joinWithDefault } from '$lib/internal/utils';
	import Connector from './Connector.svelte';
	import View from './View.svelte';
	import { assembleTwoWay } from '$lib/internal/diff/two-way-assembler';
	import { type EditorColors, DefaultEditorColors } from '$lib/internal/editor/colors';
	import { Side, TwoWaySide } from '$lib/internal/editor/side';
	import { type DiffBlock, LinkedComponentsBlock } from '$lib/internal/blocks';
	import type { LineDiffAlgorithm } from '$lib/internal/diff/line-diff';
	import { mergeComponent } from '$lib/internal/editor/merging';

	export let lhs: string;
	export let ctr: string;
	export let rhs: string;
	/**
	 * Line diff algorithm.
	 * @default "words_with_space"
	 */
	export let lineDiffAlgorithm: LineDiffAlgorithm = 'words_with_space';
	/**
	 * Custom colors to use for the editor.
	 */
	let userColors: Partial<EditorColors> = {};
	export { userColors as colors };
	let clazz = '';
	export { clazz as class };
	/**
	 * Whether the left-hand side content is editable.
	 * @default false
	 */
	export let lhsEditable = false;
	/**
	 * Whether the center content is editable.
	 * @default true
	 */
	export let ctrEditable = true;
	/**
	 * Whether the right-hand side content is editable.
	 * @default false
	 */
	export let rhsEditable = false;
	/**
	 * Disable merging actions.
	 */
	export let disableMerging = false;
	/**
	 * Enables lines wrapping.
	 */
	export let wrapLines = false;

	const editorColors = joinWithDefault(userColors, DefaultEditorColors);

	let blocks: DiffBlock<Side>[] = [];
	let lhsConnections: Connection[] = [];
	let rhsConnections: Connection[] = [];
	let components: BlockComponent[] = [];

	let container: HTMLDivElement;
	let lhsViewElem: HTMLDivElement;
	let ctrViewElem: HTMLDivElement;
	let rhsViewElem: HTMLDivElement;
	let drawLhsConnections: (container: HTMLDivElement, connections: Connection[]) => void;
	let drawRhsConnections: (container: HTMLDivElement, connections: Connection[]) => void;
	let saveCtrHistory: () => void;

	function renderComponents(blocks: DiffBlock<Side>[]) {
		lhsConnections = [];
		components = blocks
			.map((block) => {
				const comps = block.render();
				if (block instanceof LinkedComponentsBlock) {
					const connections = block.connections([comps].flat());
					lhsConnections.push(...connections.filter((conn) => conn.from.side.eq(TwoWaySide.lhs)));
					rhsConnections.push(...connections.filter((conn) => conn.to.side.eq(TwoWaySide.rhs)));
				}
				return comps;
			})
			.flat();
	}

	// Returns a function that merges a component from the given side.
	function mergeComponentHandler(side: TwoWaySide) {
		return (
			e: CustomEvent<{
				component: BlockComponent<Record<string, unknown>>;
			}>
		) => {
			mergeComponent({ source: e.detail.component, side, components, container });
			saveCtrHistory();
		};
	}

	const redrawConnections = () => {
		if (!container) return;
		drawLhsConnections(container, lhsConnections);
		drawRhsConnections(container, rhsConnections);
	};

	$: blocks = assembleTwoWay(lhs, ctr, rhs, { lineDiffAlgorithm });
	$: renderComponents(blocks);

	drawOnChange(() => container, redrawConnections);
</script>

<div
	style="
		--added: {editorColors.added};
		--removed: {editorColors.removed};
    --conflict: {editorColors.conflict};
		--modified: {editorColors.modified};
		--modified-overlay: {editorColors.modifiedOverlay};
	"
	class="mismerge {wrapLines ? 'wrap_lines' : ''} {clazz}"
	bind:this={container}
>
	<View
		{disableMerging}
		editable={lhsEditable}
		side={TwoWaySide.lhs}
		lineNumbersSide="right"
		bind:content={lhs}
		bind:components
		bind:elem={lhsViewElem}
		on:merge={mergeComponentHandler(TwoWaySide.lhs)}
		on:newline={redrawConnections}
	/>
	<Connector
		colors={editorColors}
		bind:draw={drawLhsConnections}
		bind:lhsViewElem
		bind:rhsViewElem={ctrViewElem}
	/>
	<View
		{disableMerging}
		editable={ctrEditable}
		side={TwoWaySide.ctr}
		bind:content={ctr}
		bind:components
		bind:elem={ctrViewElem}
		bind:saveHistory={saveCtrHistory}
		on:merge={mergeComponentHandler(TwoWaySide.ctr)}
		on:newline={redrawConnections}
	/>
	<Connector
		colors={editorColors}
		bind:draw={drawRhsConnections}
		bind:lhsViewElem={ctrViewElem}
		bind:rhsViewElem
	/>
	<View
		{disableMerging}
		editable={rhsEditable}
		side={TwoWaySide.rhs}
		bind:content={rhs}
		bind:components
		bind:elem={rhsViewElem}
		on:merge={mergeComponentHandler(TwoWaySide.rhs)}
		on:newline={redrawConnections}
	/>
</div>
