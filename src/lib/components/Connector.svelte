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
	let connections: BlockConnection[] = [];
	let canvas: HTMLCanvasElement;
	let width: number, height: number;

	function setDimensions() {
		canvas.width = Math.floor(width);
		canvas.height = Math.floor(height);
	}

	$: connections = generateConnections(
		Array.prototype.concat(mountedBlocks.lhs, mountedBlocks.rhs)
	);
	$: canvas && drawConnections(canvas, connections, colors);

	$: {
		width;
		height;
		if (canvas) {
			setDimensions();
			drawConnections(canvas, connections, colors);
		}
	}
</script>

<div class="connector" bind:offsetWidth={width} bind:offsetHeight={height}>
	<canvas bind:this={canvas} />
</div>
