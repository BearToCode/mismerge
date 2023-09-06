<script lang="ts">
	import type { MountedDiffBlock } from '$lib/internal/blocks';
	import {
		type BlockConnection,
		generateConnections,
		drawConnections
	} from '$lib/internal/connection';

	export let mountedBlocks: {
		lhs: MountedDiffBlock[];
		rhs: MountedDiffBlock[];
	};
	let connections: BlockConnection[] = [];
	let canvas: HTMLCanvasElement;

	$: connections = generateConnections(
		Array.prototype.concat(mountedBlocks.lhs, mountedBlocks.rhs)
	);
	$: canvas && drawConnections(canvas, connections);
</script>

<div class="connector">
	<canvas bind:this={canvas} />
</div>
