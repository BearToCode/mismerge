<script lang="ts">
	import type { DiffBlock } from '$lib/internal/blocks';
	import { AddedBlock } from '$lib/internal/blocks/added';
	import { MergeConflictBlock } from '$lib/internal/blocks/merge-conflict';
	import { ModifiedBlock } from '$lib/internal/blocks/modified';
	import { RemovedBlock } from '$lib/internal/blocks/removed';
	import type { Side } from '$lib/internal/editor/side';

	export let wordsCount: number[];
	export let charsCount: number[];
	export let blocks: DiffBlock<Side>[];
	export let disableWordsCounter: boolean;
	export let disableCharsCounter: boolean;
	export let disableBlocksCounters: boolean;

	let added = 0;
	let removed = 0;
	let modified = 0;
	let conflicts = 0;
	let resolved = 0;

	$: added = blocks.filter((b) => b instanceof AddedBlock).length;
	$: removed = blocks.filter((b) => b instanceof RemovedBlock).length;
	$: modified = blocks.filter((b) => b instanceof ModifiedBlock).length;
	$: conflicts = blocks.filter((b) => b instanceof MergeConflictBlock && !b.isResolved).length;
	$: resolved = blocks.filter((b) => b instanceof MergeConflictBlock && b.isResolved).length;
</script>

<footer class="msm__footer">
	<div class="msm__footer_content">
		<div class="msm__footer_content_left">
			{#if !disableWordsCounter}
				<div class="msm__words_counter">
					<span>Words:</span>
					<span>
						{wordsCount.map((n) => n.toString()).join('/')}
					</span>
				</div>
			{/if}
			{#if !disableCharsCounter}
				<div class="msm__chars_counter">
					<span>Chars:</span>
					<span>
						{charsCount.map((n) => n.toString()).join('/')}
					</span>
				</div>
			{/if}
		</div>
		<div class="msm__footer_content_right">
			{#if !disableBlocksCounters}
				{#if added}
					<div class="msm__block_counter added">
						<div />
						<span>{added} added</span>
					</div>
				{/if}
				{#if removed}
					<div class="msm__block_counter removed">
						<div />
						<span>{removed} removed</span>
					</div>
				{/if}
				{#if modified}
					<div class="msm__block_counter modified">
						<div />
						<span>{modified} modified</span>
					</div>
				{/if}
				{#if conflicts}
					<div class="msm__block_counter conflict">
						<div />
						<span>{conflicts} conflict{conflicts == 1 ? '' : 's'}</span>
					</div>
				{/if}
				{#if resolved}
					<div class="msm__block_counter resolved">
						<div />
						<span>{resolved} resolved</span>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</footer>
