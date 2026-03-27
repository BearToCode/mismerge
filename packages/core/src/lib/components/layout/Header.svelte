<script lang="ts">
	import type { DiffBlock } from '$lib/internal/blocks';
	import type { BlockComponent } from '$lib/internal/editor/component';
	import { MergeConflictBlock } from '$lib/internal/blocks/merge-conflict';
	import { AddedBlock } from '$lib/internal/blocks/added';
	import { ModifiedBlock } from '$lib/internal/blocks/modified';
	import { RemovedBlock } from '$lib/internal/blocks/removed';
	import type { Side } from '$lib/internal/editor/side';
	import type { Snippet } from 'svelte';
	import ChevronUpIcon from '../icons/ChevronUpIcon.svelte';
	import ChevronDownIcon from '../icons/ChevronDownIcon.svelte';
	import AcceptLeftIcon from '../icons/AcceptLeftIcon.svelte';
	import AcceptRightIcon from '../icons/AcceptRightIcon.svelte';

	let {
		blocks,
		components,
		container,
		disableAcceptLeft = false,
		disableAcceptRight = false,
		disableNavigation = false,
		acceptMode = 'current',
		onacceptleft,
		onacceptright,
		children
	}: {
		blocks: DiffBlock<Side>[];
		components: BlockComponent[];
		container: HTMLDivElement | undefined;
		disableAcceptLeft?: boolean;
		disableAcceptRight?: boolean;
		disableNavigation?: boolean;
		acceptMode?: 'current' | 'all';
		onacceptleft?: (block?: DiffBlock<Side>) => void;
		onacceptright?: (block?: DiffBlock<Side>) => void;
		children?: Snippet;
	} = $props();

	const conflicts = $derived(
		blocks.filter((b) => b instanceof MergeConflictBlock && !b.isResolved)
	);

	const changes = $derived(
		blocks.filter(
			(b) =>
				b instanceof AddedBlock ||
				b instanceof RemovedBlock ||
				b instanceof ModifiedBlock ||
				(b instanceof MergeConflictBlock && !b.isResolved)
		)
	);

	const navigableBlocks = $derived(conflicts.length > 0 ? conflicts : changes);
	const label = $derived(conflicts.length > 0 ? 'conflict' : 'change');

	let currentIndex = $state(-1);

	function scrollToBlock(block: DiffBlock<Side>) {
		if (!container) return;
		// Find non-placeholder components belonging to this block
		const blockComps = components.filter((c) => c.blockId === block.id && !c.placeholder);
		if (blockComps.length === 0) return;

		for (const comp of blockComps) {
			const el = container.querySelector(`[data-component-id="${comp.id}"]`);
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' });
				return;
			}
		}
	}

	function navigateTo(index: number) {
		if (navigableBlocks.length === 0) return;
		currentIndex =
			((index % navigableBlocks.length) + navigableBlocks.length) % navigableBlocks.length;
		scrollToBlock(navigableBlocks[currentIndex]);
	}

	function handlePrevious() {
		if (navigableBlocks.length === 0) return;
		navigateTo(currentIndex <= 0 ? navigableBlocks.length - 1 : currentIndex - 1);
	}

	function handleNext() {
		if (navigableBlocks.length === 0) return;
		navigateTo(currentIndex + 1);
	}

	function handleAcceptLeft() {
		if (acceptMode === 'all') {
			onacceptleft?.();
			return;
		}
		if (navigableBlocks.length === 0 || currentIndex < 0) return;
		onacceptleft?.(navigableBlocks[currentIndex]);
	}

	function handleAcceptRight() {
		if (acceptMode === 'all') {
			onacceptright?.();
			return;
		}
		if (navigableBlocks.length === 0 || currentIndex < 0) return;
		onacceptright?.(navigableBlocks[currentIndex]);
	}
</script>

<header class="msm__header">
	{#if acceptMode === 'all'}
		<div class="msm__header-content msm__header-content-global">
			<div class="msm__header-content-left msm__header-content-pane-start">
				{#if !disableAcceptLeft}
					<button
						class="msm__header-button msm__accept-left"
						aria-label="Accept All Incoming Changes from Left"
						title="Accept All Incoming Changes from Left"
						onclick={handleAcceptLeft}
					>
						<AcceptLeftIcon />
					</button>
				{/if}
			</div>
			<div class="msm__header-content-center">
				{#if !disableNavigation}
					<div class="msm__header-nav">
						<button
							class="msm__header-button"
							aria-label="Previous {label}"
							title="Previous {label}"
							disabled={navigableBlocks.length === 0}
							onclick={handlePrevious}
						>
							<ChevronUpIcon />
						</button>
						<span class="msm__header-counter">
							{#if navigableBlocks.length > 0}
								{currentIndex < 0 ? '–' : currentIndex + 1} / {navigableBlocks.length}
								{label}{navigableBlocks.length === 1 ? '' : 's'}
							{:else}
								No {label}s
							{/if}
						</span>
						<button
							class="msm__header-button"
							aria-label="Next {label}"
							title="Next {label}"
							disabled={navigableBlocks.length === 0}
							onclick={handleNext}
						>
							<ChevronDownIcon />
						</button>
					</div>
				{/if}
			</div>
			<div class="msm__header-content-right msm__header-content-pane-end">
				{#if !disableAcceptRight}
					<button
						class="msm__header-button msm__accept-right"
						aria-label="Accept All Incoming Changes from Right"
						title="Accept All Incoming Changes from Right"
						onclick={handleAcceptRight}
					>
						<AcceptRightIcon />
					</button>
				{/if}
			</div>
		</div>
	{:else}
		<div class="msm__header-content">
			<div class="msm__header-content-left">
				{#if !disableNavigation}
					<div class="msm__header-nav">
						<button
							class="msm__header-button"
							aria-label="Previous {label}"
							title="Previous {label}"
							disabled={navigableBlocks.length === 0}
							onclick={handlePrevious}
						>
							<ChevronUpIcon />
						</button>
						<span class="msm__header-counter">
							{#if navigableBlocks.length > 0}
								{currentIndex < 0 ? '–' : currentIndex + 1} / {navigableBlocks.length}
								{label}{navigableBlocks.length === 1 ? '' : 's'}
							{:else}
								No {label}s
							{/if}
						</span>
						<button
							class="msm__header-button"
							aria-label="Next {label}"
							title="Next {label}"
							disabled={navigableBlocks.length === 0}
							onclick={handleNext}
						>
							<ChevronDownIcon />
						</button>
					</div>
				{/if}
			</div>
			<div class="msm__header-content-right">
				{#if !disableAcceptLeft}
					<button
						class="msm__header-button msm__accept-left"
						aria-label="Accept left"
						title="Accept left"
						disabled={navigableBlocks.length === 0 || currentIndex < 0}
						onclick={handleAcceptLeft}
					>
						<AcceptLeftIcon />
						<span>Accept Left</span>
					</button>
				{/if}
				{#if !disableAcceptRight}
					<button
						class="msm__header-button msm__accept-right"
						aria-label="Accept right"
						title="Accept right"
						disabled={navigableBlocks.length === 0 || currentIndex < 0}
						onclick={handleAcceptRight}
					>
						<span>Accept Right</span>
						<AcceptRightIcon />
					</button>
				{/if}
			</div>
		</div>
	{/if}
	{@render children?.()}
</header>
