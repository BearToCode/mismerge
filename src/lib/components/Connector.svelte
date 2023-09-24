<script lang="ts">
	import type { DiffColors, EditorColors } from '$lib/internal/colors';
	import { drawConnections, type Connection } from '$lib/internal/connection';

	export let colors: EditorColors | DiffColors;
	export let lhsViewElem: HTMLDivElement;
	export let rhsViewElem: HTMLDivElement;

	let canvas: HTMLCanvasElement;
	let width: number, height: number;
	let savedContainer: HTMLDivElement;
	let savedConnections: Connection[];

	function setDimensions() {
		canvas.width = Math.floor(width);
		canvas.height = Math.floor(height + 2);
	}

	export const draw = (container: HTMLDivElement, connections: Connection[]) => {
		savedContainer = container;
		savedConnections = connections;
		if (lhsViewElem && rhsViewElem)
			drawConnections(canvas, connections, colors, lhsViewElem, rhsViewElem, container);
	};

	const redraw = () => savedConnections && savedContainer && draw(savedContainer, savedConnections);

	$: {
		width;
		height;
		if (canvas) {
			setDimensions();
			redraw();
		}
	}
</script>

<div class="connector" bind:offsetWidth={width} bind:offsetHeight={height}>
	<canvas bind:this={canvas} />
</div>
