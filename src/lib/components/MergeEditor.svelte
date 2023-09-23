<script lang="ts">
	import { LinkedComponentsBlock, type DiffBlock, TwoWaySide } from '$lib/internal/blocks';
	import type { EditorColors } from '$lib/internal/colors';
	import type { BlockComponent } from '$lib/internal/component';
	import type { Connection } from '$lib/internal/connection';
	import type { LineDiffAlgorithm } from '$lib/internal/diff';
	import { joinWithDefault } from '$lib/internal/utils';
	import { onMount, onDestroy } from 'svelte';
	import Connector from './Connector.svelte';
	import View from './View.svelte';
	import { assembleTwoWay } from '$lib/internal/two-way-assembler';

	export let lhs: string;
	export let ctr: string;
	export let rhs: string;
	/**
	 * Line diff algorithm.
	 * @default "words_with_space"
	 */
	export let lineDiffAlgorithm: LineDiffAlgorithm = 'words_with_space';
	/**
	 * Custom colors to use for the editor.
	 */
	let userColors: Partial<EditorColors> = {};
	export { userColors as colors };
	let clazz = '';
	export { clazz as class };

	const defaultColors: EditorColors = {
		addedLight: '#d4eed4',
		addedDark: '#bee6bd',
		removedLight: '#fff2f0',
		removedDark: '#ffdfd8',
		modifiedLight: '#e4f4f5',
		modifiedDark: '#d3f0f2'
	};

	const editorColors = joinWithDefault(userColors, defaultColors);

	let blocks: DiffBlock[] = [];
	let lhsConnections: Connection[] = [];
	let rhsConnections: Connection[] = [];
	let components: BlockComponent[] = [];

	let container: HTMLDivElement;
	let lhsViewElem: HTMLDivElement;
	let ctrViewElem: HTMLDivElement;
	let rhsViewElem: HTMLDivElement;
	let drawLhsConnections: (container: HTMLDivElement, connections: Connection[]) => void;
	let drawRhsConnections: (container: HTMLDivElement, connections: Connection[]) => void;

	function renderComponents(blocks: DiffBlock[]) {
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

	$: blocks = assembleTwoWay(lhs, ctr, rhs, { lineDiffAlgorithm });
	$: renderComponents(blocks);

	let observer: MutationObserver | undefined;
	onMount(() => {
		observer = new MutationObserver(() => {
			drawLhsConnections(container, lhsConnections);
			drawRhsConnections(container, rhsConnections);
		});
		observer.observe(container, {
			characterData: false,
			attributes: false,
			childList: true,
			subtree: true
		});
		drawLhsConnections(container, lhsConnections);
		drawRhsConnections(container, rhsConnections);
	});

	onDestroy(() => observer?.disconnect());
</script>

<div
	style="
		--light-green: {editorColors.addedLight};
		--dark-green: {editorColors.addedDark};
		--light-red: {editorColors.removedLight};
		--dark-red: {editorColors.removedDark};
    --blue: {editorColors.modifiedDark};
	"
	class="limerge merge-editor {clazz}"
	bind:this={container}
>
	<View bind:content={lhs} editable side={TwoWaySide.lhs} bind:components bind:elem={lhsViewElem} />
	<Connector
		colors={editorColors}
		bind:draw={drawLhsConnections}
		bind:lhsViewElem
		bind:rhsViewElem={ctrViewElem}
	/>
	<View bind:content={ctr} editable side={TwoWaySide.ctr} bind:components bind:elem={ctrViewElem} />
	<Connector
		colors={editorColors}
		bind:draw={drawRhsConnections}
		bind:lhsViewElem={ctrViewElem}
		bind:rhsViewElem
	/>
	<View bind:content={rhs} editable side={TwoWaySide.rhs} bind:components bind:elem={rhsViewElem} />
</div>
