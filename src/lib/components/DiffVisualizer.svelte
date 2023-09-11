<script lang="ts">
	import type { DiffBlock, MountedDiffBlock } from '$lib/internal/blocks';
	import type { EditorColors } from '$lib/internal/colors';
	import { assembleBlocks } from '$lib/internal/assembler';
	import { joinOnUndefined } from '$lib/internal/utils';
	import Connector from './Connector.svelte';
	import View from './View.svelte';
	import type { LineDiffAlgorithm } from '$lib/internal/diff';

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
	export let colors: Partial<EditorColors> = {};
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
	export let lineDiffAlgorithm: LineDiffAlgorithm | undefined = undefined;
	let clazz = '';
	export { clazz as class };

	let blocks: {
		lhs: DiffBlock[];
		rhs: DiffBlock[];
	};
	let mountedBlocks: { lhs: MountedDiffBlock[]; rhs: MountedDiffBlock[] } = {
		lhs: [],
		rhs: []
	};
	const defaultColors: EditorColors = {
		lightGreen: '#d4eed4',
		darkGreen: '#bee6bd',
		lightRed: '#fff2f0',
		darkRed: '#ffdfd8'
	};
	const editorColors = joinOnUndefined(colors, defaultColors);
	let lhsViewElem: HTMLDivElement;
	let rhsViewElem: HTMLDivElement;

	$: blocks = assembleBlocks(lhs, rhs, { lineDiffAlgorithm });
</script>

<div
	style="
		--light-green: {editorColors.lightGreen};
		--dark-green: {editorColors.darkGreen};
		--light-red: {editorColors.lightRed};
		--dark-red: {editorColors.darkRed};
	"
	class="limerge {clazz}"
>
	<View
		editable={lhsEditable}
		bind:blocks={blocks.lhs}
		bind:mountedBlocks={mountedBlocks.lhs}
		bind:content={lhs}
		bind:elem={lhsViewElem}
	/>
	<Connector colors={editorColors} bind:mountedBlocks bind:lhsViewElem bind:rhsViewElem />
	<View
		editable={rhsEditable}
		bind:blocks={blocks.rhs}
		bind:mountedBlocks={mountedBlocks.rhs}
		bind:content={rhs}
		bind:elem={rhsViewElem}
	/>
</div>
