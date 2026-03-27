<script lang="ts">
	import type { BlockComponent } from '$lib/internal/editor/component';
	import { TwoWaySide, type Side } from '$lib/internal/editor/side';
	import { browser } from '$lib/internal/env';
	import SidePanel from './SidePanel.svelte';
	import Editor from './Editor.svelte';
	import HighlightOverlay from './HighlightOverlay.svelte';
	import { deleteComponent, mergeComponent, removeMergedComponent } from '$lib/internal/editor/actions';

	let {
		elem = $bindable(),
		contentContainer = $bindable(),
		container,
		components,
		editable = false,
		content = $bindable(),
		side,
		disableMerging,
		lineNumbersSide = 'left',
		highlight,
		class: clazz = '',
		onheightchange,
		onmerge,
		ondelete,
		onresolve
	}: {
		elem?: HTMLDivElement;
		contentContainer?: HTMLDivElement;
		container: HTMLDivElement;
		components: BlockComponent[];
		editable?: boolean;
		content: string;
		side: Side;
		disableMerging: boolean;
		lineNumbersSide?: 'left' | 'right';
		highlight?: (text: string) => string | Promise<string>;
		class?: string;
		onheightchange?: () => void;
		onmerge?: (component: BlockComponent) => void;
		ondelete?: (component: BlockComponent) => void;
		onresolve?: (component: BlockComponent) => void;
	} = $props();

	let contentElem: HTMLDivElement;
	let editorRef = $state<Editor | undefined>(undefined);
	let scrollbarRef = $state<HTMLDivElement | undefined>(undefined);
	let height = $state(0);
	let width = $state(0);

	// Sync scrollLeft bidirectionally between contentContainer and sticky scrollbar
	$effect(() => {
		if (!browser || !contentContainer || !scrollbarRef) return;
		const cc = contentContainer;
		const sb = scrollbarRef;

		let syncing = false;
		const onContentScroll = () => {
			if (syncing) return;
			syncing = true;
			sb.scrollLeft = cc.scrollLeft;
			syncing = false;
		};
		const onScrollbarScroll = () => {
			if (syncing) return;
			syncing = true;
			cc.scrollLeft = sb.scrollLeft;
			syncing = false;
		};

		cc.addEventListener('scroll', onContentScroll, { passive: true });
		sb.addEventListener('scroll', onScrollbarScroll, { passive: true });

		return () => {
			cc.removeEventListener('scroll', onContentScroll);
			sb.removeEventListener('scroll', onScrollbarScroll);
		};
	});

	let renderedSideComponents = $state<
		{ block: HTMLDivElement; lines: HTMLDivElement[]; linesHeights: number[] }[]
	>([]);

	const sideComponents = $derived(components.filter((c) => c.side.eq(side)));

	export function update() {
		if (!contentElem) return;
		const elements = Array.from(contentElem.querySelectorAll('.msm__block'));
		if (elements.length != sideComponents.length) return;

		renderedSideComponents = elements.map((blockElem) => {
			const lines = Array.from(blockElem.querySelectorAll('.msm__line'));
			const heights = lines.map((line) => line.getBoundingClientRect().height);
			return {
				block: blockElem as HTMLDivElement,
				lines: lines as HTMLDivElement[],
				linesHeights: heights
			};
		});
	}

	$effect(() => {
		void height;
		onheightchange?.();
	});

	function handleMerge(component: BlockComponent) {
		mergeComponent({ source: component, side, components, container });
		editorRef?.saveHistory();
		onmerge?.(component);
	}

	function handleDelete(component: BlockComponent) {
		if (
			component.side instanceof TwoWaySide &&
			!component.side.eq(TwoWaySide.ctr) &&
			['modified', 'merge-conflict', 'resolved-merge-conflict', 'unchanged'].includes(
				component.type
			)
		) {
			removeMergedComponent({ source: component, side, components, container });
		} else {
			deleteComponent({ component, container });
		}
		editorRef?.saveHistory();
		ondelete?.(component);
	}

	function handleResolve(component: BlockComponent) {
		onresolve?.(component);
	}
</script>

<div
	bind:this={elem}
	class="msm__view {highlight ? 'highlight' : ''} {editable ? 'editable' : ''} {clazz}"
>
	{#if lineNumbersSide == 'left'}
		<SidePanel
			{side}
			{disableMerging}
			{renderedSideComponents}
			components={sideComponents}
			onmerge={handleMerge}
			ondelete={handleDelete}
			onresolve={handleResolve}
		/>
	{/if}
	<div class="msm__view-inner">
		<div class="msm__view-content" bind:this={contentContainer}>
			<div
				class="msm__wrapper"
				bind:this={contentElem}
				bind:clientWidth={width}
				bind:clientHeight={height}
			>
				{#each sideComponents as blockComponent}
					{@const BlockComp = blockComponent.component}
					<BlockComp {...blockComponent.props} component={blockComponent} />
				{/each}
			</div>

			{#if highlight}
				<HighlightOverlay {content} {width} {highlight} />
			{/if}

			{#if editable}
				<Editor bind:content {width} bind:this={editorRef} />
			{/if}
		</div>
		<div class="msm__sticky-scrollbar" bind:this={scrollbarRef}>
			<div style:width="{width}px"></div>
		</div>
	</div>
	{#if lineNumbersSide == 'right'}
		<SidePanel
			{side}
			{disableMerging}
			{renderedSideComponents}
			components={sideComponents}
			onmerge={handleMerge}
			ondelete={handleDelete}
			onresolve={handleResolve}
		/>
	{/if}
</div>
