<svelte:options
	customElement={{
		tag: 'mis-merge2',
		shadow: 'none'
	}}
/>

<script lang="ts">
	import { joinWithDefault } from '$lib/internal/utils';
	import { type DiffBlock, LinkedComponentsBlock } from '$lib/internal/blocks';
	import type { BlockComponent } from '$lib/internal/editor/component';
	import { onLineChange, type Connection } from '$lib/internal/editor/connection';
	import { assembleOneWay } from '$lib/internal/diff/one-way-assembler';
	import { OneWaySide, Side } from '$lib/internal/editor/side';
	import View from './layout/View.svelte';
	import Connector from './layout/Connector.svelte';
	import type { LineDiffAlgorithm } from '$lib/internal/diff/line-diff';
	import { BlocksHashTable } from '$lib/internal/storage/table';
	import { countWords, countChars } from '$lib/internal/editor/counters';
	import Footer from './layout/Footer.svelte';
	import { DefaultLightColors, type EditorColors } from '$lib/internal/editor/colors';
	import { browser } from '$lib/internal/env';

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
	let drawCtrConnections: (container: HTMLDivElement, connections: Connection[]) => void;
	let updateLhsView: () => void;
	let updateRhsView: () => void;

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

	const drawConnections = () => {
		if (!container) return;
		drawCtrConnections(container, connections);
	};

	const updateViews = () => {
		if (!updateLhsView || !updateRhsView) return;
		updateLhsView();
		updateRhsView();
	};

	const update = () => {
		if (!browser) return;
		updateViews();
		drawConnections();
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
	$: {
		wrapLines;
		editorColors;
		update();
	}

	/* Lifecycle hooks */

	onLineChange(() => container, update);
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
	class="mismerge msm__one-way
	{wrapLines ? 'wrap-lines' : ''} 
	{disableFooter ? 'disable-footer' : ''} 
	{clazz}"
	bind:this={container}
>
	<slot name="header" />

	<div>
		<div class="msm__main">
			<View
				{container}
				{highlight}
				{disableMerging}
				editable={lhsEditable}
				side={OneWaySide.lhs}
				bind:components
				bind:content={lhs}
				bind:elem={lhsViewElem}
				bind:update={updateLhsView}
				on:height-change={update}
				on:merge
				on:delete
				on:input
				on:keydown
				on:keypress
				on:keyup
			/>
			<Connector
				colors={editorColors}
				bind:draw={drawCtrConnections}
				bind:lhsViewElem
				bind:rhsViewElem
			/>
			<View
				{container}
				{highlight}
				{disableMerging}
				editable={rhsEditable}
				side={OneWaySide.rhs}
				bind:components
				bind:content={rhs}
				bind:elem={rhsViewElem}
				bind:update={updateRhsView}
				on:height-change={update}
				on:merge
				on:delete
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
			wordsCount={[lhs, rhs].map((s) => countWords(s))}
			charsCount={[lhs, rhs].map((s) => countChars(s))}
			{disableWordsCounter}
			{disableCharsCounter}
			{disableBlocksCounters}
		>
			<slot name="footer" />
		</Footer>
	{/if}
</div>
