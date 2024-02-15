<svelte:options
	customElement={{
		tag: 'mis-merge3',
		shadow: 'none'
	}}
/>

<script lang="ts">
	import type { BlockComponent } from '$lib/internal/editor/component';
	import { drawOnChange, type Connection } from '$lib/internal/editor/connection';
	import { joinWithDefault } from '$lib/internal/utils';
	import Connector from './layout/Connector.svelte';
	import View from './layout/View.svelte';
	import { assembleTwoWay } from '$lib/internal/diff/two-way-assembler';
	import { type EditorColors, DefaultLightColors } from '$lib/internal/editor/colors';
	import { Side, TwoWaySide } from '$lib/internal/editor/side';
	import { type DiffBlock, LinkedComponentsBlock } from '$lib/internal/blocks';
	import type { LineDiffAlgorithm } from '$lib/internal/diff/line-diff';
	import { mergeComponent } from '$lib/internal/editor/merging';
	import { BlocksHashTable } from '$lib/internal/storage/table';
	import Footer from './layout/Footer.svelte';
	import { countChars, countWords } from '$lib/internal/editor/counters';
	import { MergeConflictBlock } from '$lib/internal/blocks/merge-conflict';

	/* Exports */

	/**
	 * Left hand side content.
	 */
	export let lhs: string;
	/**
	 * Center content.
	 */
	export let ctr: string;
	/**
	 * Right hand side content.
	 */
	export let rhs: string;
	/**
	 * Line diff algorithm.
	 * @default "words_with_space"
	 */
	export let lineDiffAlgorithm: LineDiffAlgorithm = 'words_with_space';
	/**
	 * Custom colors to use for the editor.
	 */
	export { userColors as colors };
	/**
	 * Editor class.
	 */
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
	/**
	 * Disable footer.
	 */
	export let disableFooter = false;
	/**
	 * Disable the footer words counter.
	 */
	export let disableWordsCounter = false;
	/**
	 * Disable the footer chars counter.
	 */
	export let disableCharsCounter = false;
	/**
	 * Disable the footer blocks counters.
	 */
	export let disableBlocksCounters = false;
	/**
	 * Syntax highlighting.
	 */
	export let highlight: ((text: string) => string | Promise<string>) | undefined = undefined;
	/**
	 * `true` to ignore leading and trailing whitespace.
	 * @default false
	 */
	export let ignoreWhitespace = false;
	/**
	 * `true` to ignore casing difference.
	 * @default false
	 */
	export let ignoreCase = false;
	/**
	 * Whether all conflicts have been resolved.
	 */
	export let conflictsResolved = false;

	/* Local variables */

	let clazz = '';
	let userColors: Partial<EditorColors> = {};
	let editorColors: EditorColors;
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

	const hashTable = new BlocksHashTable<TwoWaySide>();

	/* Local functions */

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

	/* Reactive statements */

	$: editorColors = joinWithDefault(userColors, DefaultLightColors);
	$: blocks = assembleTwoWay(lhs, ctr, rhs, {
		lineDiffAlgorithm,
		hashTable,
		diffOpts: {
			ignoreCase,
			ignoreWhitespace
		}
	});
	$: renderComponents(blocks);
	$: {
		wrapLines;
		editorColors;
		redrawConnections();
	}
	$: conflictsResolved = blocks.every(
		(block) => !(block instanceof MergeConflictBlock) || block.isResolved
	);

	/* Lifecycle hooks */

	drawOnChange(() => container, redrawConnections);
</script>

<div
	style="
		--added: {editorColors.added};
		--removed: {editorColors.removedBothSides};
    --conflict: {editorColors.conflict};
		--resolved-conflict: {editorColors.resolvedConflict};
		--modified: {editorColors.modified};
		--modified-overlay: {editorColors.modifiedOverlay};
	"
	class="mismerge msm__two-way
		{wrapLines ? 'wrap-lines' : ''} 
		{disableFooter ? 'disable-footer' : ''} 
		{clazz}"
	bind:this={container}
>
	<slot name="header" />

	<div>
		<div class="msm__main">
			<View
				{highlight}
				{disableMerging}
				editable={lhsEditable}
				side={TwoWaySide.lhs}
				lineNumbersSide="right"
				bind:content={lhs}
				bind:components
				bind:elem={lhsViewElem}
				on:merge={mergeComponentHandler(TwoWaySide.lhs)}
				on:height-change={redrawConnections}
				on:merge
				on:resolve
				on:input
				on:keydown
				on:keypress
				on:keyup
			/>
			<Connector
				colors={editorColors}
				bind:draw={drawLhsConnections}
				bind:lhsViewElem
				bind:rhsViewElem={ctrViewElem}
			/>
			<View
				{highlight}
				{disableMerging}
				editable={ctrEditable}
				side={TwoWaySide.ctr}
				bind:content={ctr}
				bind:components
				bind:elem={ctrViewElem}
				bind:saveHistory={saveCtrHistory}
				on:merge={mergeComponentHandler(TwoWaySide.ctr)}
				on:resolve={() => {
					blocks = assembleTwoWay(lhs, ctr, rhs, { lineDiffAlgorithm, hashTable });
				}}
				on:merge
				on:resolve
				on:height-change={redrawConnections}
				on:input
				on:keydown
				on:keypress
				on:keyup
			/>
			<Connector
				colors={editorColors}
				bind:draw={drawRhsConnections}
				bind:lhsViewElem={ctrViewElem}
				bind:rhsViewElem
			/>
			<View
				{highlight}
				{disableMerging}
				editable={rhsEditable}
				side={TwoWaySide.rhs}
				bind:content={rhs}
				bind:components
				bind:elem={rhsViewElem}
				on:merge={mergeComponentHandler(TwoWaySide.rhs)}
				on:height-change={redrawConnections}
				on:merge
				on:resolve
				on:input
				on:keydown
				on:keypress
				on:keyup
			/>
			<slot name="main" />
		</div>
	</div>
	{#if !disableFooter}
		<Footer
			{blocks}
			wordsCount={[lhs, ctr, rhs].map((s) => countWords(s))}
			charsCount={[lhs, ctr, rhs].map((s) => countChars(s))}
			{disableWordsCounter}
			{disableCharsCounter}
			{disableBlocksCounters}
		>
			<slot name="footer" />
		</Footer>
	{/if}
</div>
