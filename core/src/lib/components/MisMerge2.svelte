<script lang="ts">
	import { joinWithDefault } from '$lib/internal/utils';
	import { type DiffBlock, LinkedComponentsBlock } from '$lib/internal/blocks';
	import type { BlockComponent } from '$lib/internal/editor/component';
	import { drawOnChange, type Connection } from '$lib/internal/editor/connection';
	import { assembleOneWay } from '$lib/internal/diff/one-way-assembler';
	import { OneWaySide, Side } from '$lib/internal/editor/side';
	import View from './layout/View.svelte';
	import Connector from './layout/Connector.svelte';
	import type { LineDiffAlgorithm } from '$lib/internal/diff/line-diff';
	import { mergeComponent } from '$lib/internal/editor/merging';
	import { BlocksHashTable } from '$lib/internal/storage/table';
	import { countWords, countChars } from '$lib/internal/editor/counters';
	import Footer from './layout/Footer.svelte';
	import { DefaultLightColors, type EditorColors } from '$lib/internal/editor/colors';

	/* Exports */

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
	export { userColors as colors };
	/**
	 * Whether the left hand side content is editable.
	 */
	export let lhsEditable = true;
	/**
	 * Whether the right hand side content is editable.
	 */
	export let rhsEditable = true;
	/**
	 * Line diff algorithm.
	 * @default "words_with_space"
	 */
	export let lineDiffAlgorithm: LineDiffAlgorithm = 'words_with_space';
	/**
	 * Editor class.
	 */
	export { clazz as class };
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

	/* Local variables */

	let clazz = '';
	let userColors: Partial<EditorColors> = {};
	let editorColors: EditorColors;
	let blocks: DiffBlock<Side>[] = [];
	let connections: Connection[] = [];
	let components: BlockComponent[] = [];

	let container: HTMLDivElement;
	let lhsViewElem: HTMLDivElement;
	let rhsViewElem: HTMLDivElement;
	let drawConnections: (container: HTMLDivElement, connections: Connection[]) => void;
	let saveLhsHistory: () => void;
	let saveRhsHistory: () => void;

	const hashTable = new BlocksHashTable();

	/* Local functions */

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

	/* Reactive statements */

	$: editorColors = joinWithDefault(userColors, DefaultLightColors);
	$: blocks = assembleOneWay(lhs, rhs, {
		lineDiffAlgorithm,
		hashTable,
		diffOpts: {
			ignoreCase,
			ignoreWhitespace
		}
	});
	$: renderComponents(blocks);

	/* Lifecycle hooks */

	drawOnChange(() => container, redrawConnections);
</script>

<div
	style="
		--added: {editorColors.added};
		--removed: {editorColors.removed};
		--conflict: {editorColors.conflict};
		--resolved-conflict: {editorColors.resolvedConflict};
		--modified: {editorColors.modified};
		--modified-overlay: {editorColors.modifiedOverlay};
	"
	class="mismerge msm__one-way {wrapLines ? 'wrap-lines' : ''} {clazz}"
	bind:this={container}
>
	<div class="msm__main">
		<View
			{highlight}
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
		<Connector
			colors={editorColors}
			bind:draw={drawConnections}
			bind:lhsViewElem
			bind:rhsViewElem
		/>
		<View
			{highlight}
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
	{#if !disableFooter}
		<Footer
			{blocks}
			wordsCount={[lhs, rhs].map((s) => countWords(s))}
			charsCount={[lhs, rhs].map((s) => countChars(s))}
			{disableWordsCounter}
			{disableCharsCounter}
			{disableBlocksCounters}
		/>
	{/if}
</div>
