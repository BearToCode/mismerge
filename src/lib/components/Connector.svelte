<script lang="ts">
	import type { MountedDiffBlock } from '$lib/internal/blocks';
	import type { EditorColors } from '$lib/internal/colors';
	import {
		type BlockConnection,
		generateConnections,
		drawConnections
	} from '$lib/internal/connection';

	export let mountedBlocks: {
		lhs: MountedDiffBlock[];
		rhs: MountedDiffBlock[];
	};
	export let colors: EditorColors;
	export let lhsViewElem: HTMLDivElement;
	export let rhsViewElem: HTMLDivElement;

	let connections: BlockConnection[] = [];
	let canvas: HTMLCanvasElement;
	let width: number, height: number;

	function setDimensions() {
		canvas.width = Math.floor(width);
		canvas.height = Math.floor(height + 2);
	}

	$: connections = generateConnections(
		Array.prototype.concat(mountedBlocks.lhs, mountedBlocks.rhs)
	);
	$: canvas && drawConnections(canvas, connections, colors, lhsViewElem, rhsViewElem);

	$: {
		width;
		height;
		if (canvas) {
			setDimensions();
			drawConnections(canvas, connections, colors, lhsViewElem, rhsViewElem);
		}
	}
</script>

<div class="connector" bind:offsetWidth={width} bind:offsetHeight={height}>
	<canvas bind:this={canvas} />
</div>
