<svelte:options
	customElement={{
		tag: 'mis-merge2',
		shadow: 'none',
		props: {
			colors: { reflect: true, attribute: 'colors', type: 'Object' }
		}
	}}
/>

<script lang="ts">
	import { joinWithDefault } from '$lib/internal/utils';
	import { LinkedComponentsBlock } from '$lib/internal/blocks';
	import { onLineChange, type Connection } from '$lib/internal/editor/connection';
	import { assembleOneWay } from '$lib/internal/diff/one-way-assembler';
	import { OneWaySide } from '$lib/internal/editor/side';
	import View from './layout/View.svelte';
	import Connector from './layout/Connector.svelte';
	import type { LineDiffAlgorithm } from '$lib/internal/diff/line-diff';
	import { BlocksHashTable } from '$lib/internal/storage/table';
	import { countWords, countChars } from '$lib/internal/editor/counters';
	import Footer from './layout/Footer.svelte';
	import { DefaultLightColors, type EditorColors } from '$lib/internal/editor/colors';
	import { browser } from '$lib/internal/env';
	import type { Snippet } from 'svelte';

	let {
		lhs = $bindable(),
		rhs = $bindable(),
		colors = {} as Partial<EditorColors>,
		lhsEditable = true,
		rhsEditable = true,
		lineDiffAlgorithm = 'words_with_space' as LineDiffAlgorithm,
		class: clazz = '',
		disableMerging = false,
		syncHorizontalScroll = false,
		wrapLines = false,
		disableFooter = false,
		disableWordsCounter = false,
		disableCharsCounter = false,
		disableBlocksCounters = false,
		highlight = undefined as ((text: string) => string | Promise<string>) | undefined,
		ignoreWhitespace = false,
		ignoreCase = false,
		header = undefined,
		main = undefined,
		footer = undefined
	}: {
		lhs: string;
		rhs: string;
		colors?: Partial<EditorColors>;
		lhsEditable?: boolean;
		rhsEditable?: boolean;
		lineDiffAlgorithm?: LineDiffAlgorithm;
		class?: string;
		disableMerging?: boolean;
		syncHorizontalScroll?: boolean;
		wrapLines?: boolean;
		disableFooter?: boolean;
		disableWordsCounter?: boolean;
		disableCharsCounter?: boolean;
		disableBlocksCounters?: boolean;
		highlight?: (text: string) => string | Promise<string>;
		ignoreWhitespace?: boolean;
		ignoreCase?: boolean;
		header?: Snippet;
		main?: Snippet;
		footer?: Snippet;
	} = $props();

	const editorColors = $derived(joinWithDefault(colors, DefaultLightColors));

	const hashTable = new BlocksHashTable();

	const blockData = $derived.by(() => {
		const blocks = assembleOneWay(lhs, rhs, {
			lineDiffAlgorithm,
			hashTable,
			diffOpts: { ignoreCase, ignoreWhitespace }
		});

		const connections: Connection[] = [];

		const components = blocks
			.map((block) => {
				const comps = block.render();
				if (block instanceof LinkedComponentsBlock)
					connections.push(...block.connections([comps].flat()));
				return comps;
			})
			.flat();

		return { blocks, components, connections };
	});

	const blocks = $derived(blockData.blocks);
	const components = $derived(blockData.components);
	const connections = $derived(blockData.connections);

	let container = $state<HTMLDivElement | undefined>(undefined);
	let lhsViewElem = $state<HTMLDivElement | undefined>(undefined);
	let rhsViewElem = $state<HTMLDivElement | undefined>(undefined);
	let lhsContentContainer = $state<HTMLDivElement | undefined>(undefined);
	let rhsContentContainer = $state<HTMLDivElement | undefined>(undefined);

	let lhsViewRef: View;
	let rhsViewRef: View;
	let ctrConnectorRef: Connector;

	function drawConnections() {
		if (!container) return;
		ctrConnectorRef?.draw(container, connections);
	}

	function updateViews() {
		if (!lhsViewRef || !rhsViewRef) return;
		lhsViewRef.update();
		rhsViewRef.update();
	}

	function update() {
		if (!browser) return;
		updateViews();
		drawConnections();
	}

	$effect(() => {
		void wrapLines;
		void editorColors;
		update();
	});

	$effect(() => {
		if (!browser || !syncHorizontalScroll) return;
		const scrollContainers = [lhsContentContainer, rhsContentContainer].filter(
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

	onLineChange(() => container as HTMLDivElement, update);
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
	{#if header}{@render header()}{/if}

	<div>
		<div class="msm__main">
			<View
				{container}
				{highlight}
				{disableMerging}
				editable={lhsEditable}
				side={OneWaySide.lhs}
				{components}
				bind:content={lhs}
				bind:elem={lhsViewElem}
				bind:contentContainer={lhsContentContainer}
				bind:this={lhsViewRef}
				onheightchange={update}
			/>
			<Connector colors={editorColors} bind:this={ctrConnectorRef} {lhsViewElem} {rhsViewElem} />
			<View
				{container}
				{highlight}
				{disableMerging}
				editable={rhsEditable}
				side={OneWaySide.rhs}
				{components}
				bind:content={rhs}
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
			wordsCount={[lhs, rhs].map((s) => countWords(s))}
			charsCount={[lhs, rhs].map((s) => countChars(s))}
			{disableWordsCounter}
			{disableCharsCounter}
			{disableBlocksCounters}
		>
			{#if footer}{@render footer()}{/if}
		</Footer>
	{/if}
</div>
