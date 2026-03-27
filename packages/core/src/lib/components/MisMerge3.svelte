<svelte:options
	customElement={{
		tag: 'mis-merge3',
		shadow: 'none',
		props: {
			colors: { reflect: true, attribute: 'colors', type: 'Object' }
		}
	}}
/>

<script lang="ts">
	import { onLineChange, type Connection } from '$lib/internal/editor/connection';
	import { joinWithDefault } from '$lib/internal/utils';
	import Connector from './layout/Connector.svelte';
	import View from './layout/View.svelte';
	import { assembleTwoWay } from '$lib/internal/diff/two-way-assembler';
	import { type EditorColors, DefaultLightColors } from '$lib/internal/editor/colors';
	import { TwoWaySide } from '$lib/internal/editor/side';
	import { LinkedComponentsBlock } from '$lib/internal/blocks';
	import type { LineDiffAlgorithm } from '$lib/internal/diff/line-diff';
	import { BlocksHashTable } from '$lib/internal/storage/table';
	import Footer from './layout/Footer.svelte';
	import Header from './layout/Header.svelte';
	import { countChars, countWords } from '$lib/internal/editor/counters';
	import { MergeConflictBlock } from '$lib/internal/blocks/merge-conflict';
	import { browser } from '$lib/internal/env';
	import type { Snippet } from 'svelte';
	import { mergeComponent } from '$lib/internal/editor/actions';
	import type { DiffBlock } from '$lib/internal/blocks';

	let {
		lhs = $bindable(),
		ctr = $bindable(),
		rhs = $bindable(),
		lineDiffAlgorithm = 'words_with_space' as LineDiffAlgorithm,
		colors = {} as Partial<EditorColors>,
		class: clazz = '',
		lhsEditable = false,
		ctrEditable = true,
		rhsEditable = false,
		disableMerging = false,
		syncHorizontalScroll = false,
		wrapLines = false,
		disableFooter = false,
		disableHeader = false,
		disableWordsCounter = false,
		disableCharsCounter = false,
		disableBlocksCounters = false,
		highlight = undefined as ((text: string) => string | Promise<string>) | undefined,
		ignoreWhitespace = false,
		ignoreCase = false,
		conflictsResolved = $bindable(false),
		header = undefined,
		main = undefined,
		footer = undefined
	}: {
		lhs: string;
		ctr: string;
		rhs: string;
		lineDiffAlgorithm?: LineDiffAlgorithm;
		colors?: Partial<EditorColors>;
		class?: string;
		lhsEditable?: boolean;
		ctrEditable?: boolean;
		rhsEditable?: boolean;
		disableMerging?: boolean;
		syncHorizontalScroll?: boolean;
		wrapLines?: boolean;
		disableFooter?: boolean;
		disableHeader?: boolean;
		disableWordsCounter?: boolean;
		disableCharsCounter?: boolean;
		disableBlocksCounters?: boolean;
		highlight?: (text: string) => string | Promise<string>;
		ignoreWhitespace?: boolean;
		ignoreCase?: boolean;
		conflictsResolved?: boolean;
		header?: Snippet;
		main?: Snippet;
		footer?: Snippet;
	} = $props();

	const editorColors = $derived(joinWithDefault(colors, DefaultLightColors));

	const hashTable = new BlocksHashTable<TwoWaySide>();

	let resolveCount = $state(0);

	const blockData = $derived.by(() => {
		void resolveCount;
		const blocks = assembleTwoWay(lhs, ctr, rhs, {
			lineDiffAlgorithm,
			hashTable,
			diffOpts: { ignoreCase, ignoreWhitespace }
		});

		const lhsConnections: Connection[] = [];
		const rhsConnections: Connection[] = [];

		const components = blocks
			.map((block) => {
				const comps = block.render();
				if (block instanceof LinkedComponentsBlock) {
					const connections = block.connections([comps].flat());
					lhsConnections.push(...connections.filter((c) => c.from.side.eq(TwoWaySide.lhs)));
					rhsConnections.push(...connections.filter((c) => c.to.side.eq(TwoWaySide.rhs)));
				}
				return comps;
			})
			.flat();

		return { blocks, components, lhsConnections, rhsConnections };
	});

	const blocks = $derived(blockData.blocks);
	const components = $derived(blockData.components);
	const lhsConnections = $derived(blockData.lhsConnections);
	const rhsConnections = $derived(blockData.rhsConnections);

	$effect(() => {
		conflictsResolved = blocks.every((b) => !(b instanceof MergeConflictBlock) || b.isResolved);
	});

	let container = $state<HTMLDivElement | undefined>(undefined);
	let lhsViewElem = $state<HTMLDivElement | undefined>(undefined);
	let ctrViewElem = $state<HTMLDivElement | undefined>(undefined);
	let rhsViewElem = $state<HTMLDivElement | undefined>(undefined);
	let lhsContentContainer = $state<HTMLDivElement | undefined>(undefined);
	let ctrContentContainer = $state<HTMLDivElement | undefined>(undefined);
	let rhsContentContainer = $state<HTMLDivElement | undefined>(undefined);

	let lhsViewRef: View;
	let ctrViewRef: View;
	let rhsViewRef: View;
	let lhsConnectorRef: Connector;
	let rhsConnectorRef: Connector;

	function drawConnections() {
		if (!container) return;
		lhsConnectorRef?.draw(container, lhsConnections);
		rhsConnectorRef?.draw(container, rhsConnections);
	}

	function updateViews() {
		if (!lhsViewRef || !ctrViewRef || !rhsViewRef) return;
		lhsViewRef.update();
		ctrViewRef.update();
		rhsViewRef.update();
	}

	function update() {
		if (!browser) return;
		drawConnections();
		updateViews();
	}

	$effect(() => {
		void wrapLines;
		void editorColors;
		update();
	});

	$effect(() => {
		if (!browser || !syncHorizontalScroll) return;
		const scrollContainers = [lhsContentContainer, ctrContentContainer, rhsContentContainer].filter(
			(container): container is HTMLDivElement => !!container
		);
		if (scrollContainers.length < 2) return;

		let syncing = false;
		const syncScroll = (source: HTMLDivElement) => {
			if (syncing) return;
			syncing = true;
			const nextScrollLeft = source.scrollLeft;
			for (const container of scrollContainers) {
				if (container === source || container.scrollLeft === nextScrollLeft) continue;
				container.scrollLeft = nextScrollLeft;
			}
			syncing = false;
		};

		const listeners = scrollContainers.map((container) => {
			const listener = () => syncScroll(container);
			container.addEventListener('scroll', listener, { passive: true });
			return { container, listener };
		});

		const [firstContainer] = scrollContainers;
		syncScroll(firstContainer);

		return () => {
			for (const { container, listener } of listeners) {
				container.removeEventListener('scroll', listener);
			}
		};
	});

	function handleResolve() {
		resolveCount++;
	}

	function handleAcceptLeft(block: DiffBlock<TwoWaySide>) {
		const comp = components.find(
			(c) => c.blockId === block.id && c.side.eq(TwoWaySide.lhs) && !c.placeholder
		);
		if (!comp || !container) return;
		mergeComponent({ source: comp, side: TwoWaySide.lhs, components, container });
	}

	function handleAcceptRight(block: DiffBlock<TwoWaySide>) {
		const comp = components.find(
			(c) => c.blockId === block.id && c.side.eq(TwoWaySide.rhs) && !c.placeholder
		);
		if (!comp || !container) return;
		mergeComponent({ source: comp, side: TwoWaySide.rhs, components, container });
	}

	onLineChange(() => container as HTMLDivElement, update);
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
		{disableHeader ? 'disable-header' : ''} 
		{clazz}"
	bind:this={container}
>
	{#if !disableHeader}
		<Header
			{blocks}
			{components}
			{container}
			onacceptleft={handleAcceptLeft}
			onacceptright={handleAcceptRight}
		/>
	{/if}
	{#if header}{@render header()}{/if}

	<div>
		<div class="msm__main">
			<View
				{container}
				{highlight}
				{disableMerging}
				editable={lhsEditable}
				side={TwoWaySide.lhs}
				lineNumbersSide="right"
				bind:content={lhs}
				{components}
				bind:elem={lhsViewElem}
				bind:contentContainer={lhsContentContainer}
				bind:this={lhsViewRef}
				onheightchange={update}
			/>
			<Connector
				colors={editorColors}
				bind:this={lhsConnectorRef}
				{lhsViewElem}
				rhsViewElem={ctrViewElem}
			/>
			<View
				{container}
				{highlight}
				{disableMerging}
				editable={ctrEditable}
				side={TwoWaySide.ctr}
				bind:content={ctr}
				{components}
				bind:elem={ctrViewElem}
				bind:contentContainer={ctrContentContainer}
				bind:this={ctrViewRef}
				onresolve={handleResolve}
				onheightchange={update}
			/>
			<Connector
				colors={editorColors}
				bind:this={rhsConnectorRef}
				lhsViewElem={ctrViewElem}
				{rhsViewElem}
			/>
			<View
				{container}
				{highlight}
				{disableMerging}
				editable={rhsEditable}
				side={TwoWaySide.rhs}
				bind:content={rhs}
				{components}
				bind:elem={rhsViewElem}
				bind:contentContainer={rhsContentContainer}
				bind:this={rhsViewRef}
				onheightchange={update}
			/>
			{#if main}{@render main()}{/if}
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
			{#if footer}{@render footer()}{/if}
		</Footer>
	{/if}
</div>
