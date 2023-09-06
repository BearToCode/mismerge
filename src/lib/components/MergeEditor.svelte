<script lang="ts">
	import { generateDiffBlocks, type MountedDiffBlock } from '$lib/internal/blocks';
	import type { EditorColors } from '$lib/internal/colors';
	import { joinOnUndefined } from '$lib/internal/utils';
	import Connector from './Connector.svelte';
	import View from './View.svelte';

	export let lhs: string;
	export let rhs: string;
	let clazz = '';
	export { clazz as class };
	export let colors: Partial<EditorColors> = {};

	let blocks = generateDiffBlocks(lhs, rhs);
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
	<View bind:mountedBlocks={mountedBlocks.lhs} blocks={blocks.lhs} />
	<Connector {mountedBlocks} colors={editorColors} />
	<View bind:mountedBlocks={mountedBlocks.rhs} blocks={blocks.rhs} />
</div>
