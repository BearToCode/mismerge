<script lang="ts">
	import type { EditorColors } from '$lib/internal/editor/colors';
	import { drawConnections, type Connection } from '$lib/internal/editor/connection';

	/* Exports */

	export let colors: EditorColors;
	export let lhsViewElem: HTMLDivElement;
	export let rhsViewElem: HTMLDivElement;

	export const draw = (container: HTMLDivElement, connections: Connection[]) => {
		savedContainer = container;
		savedConnections = connections;
		if (lhsViewElem && rhsViewElem) {
			drawConnections(canvas, connections, colors, lhsViewElem, rhsViewElem, container);
		}
	};

	/* Local variables */

	let canvas: HTMLCanvasElement;
	let width: number, height: number;
	let savedContainer: HTMLDivElement;
	let savedConnections: Connection[];

	/* Local functions */

	function resize(width: number, height: number) {
		if (!canvas) return;
		if (canvas.width == width && canvas.height == height) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Resize the canvas to fit the container
		// and copy the original data back to the canvas
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		ctx.canvas.width = width;
		ctx.canvas.height = height;
		ctx.putImageData(imageData, 0, 0);
	}

	const redraw = () => {
		if (!canvas || !savedContainer || !savedConnections) return;
		draw(savedContainer, savedConnections);
	};

	/* Reactive statements */

	$: {
		lhsViewElem;
		rhsViewElem;
		colors;
		redraw();
	}

	$: resize(width, height);
</script>

<div class="msm__connector" bind:offsetWidth={width} bind:offsetHeight={height}>
	<canvas bind:this={canvas} />
</div>
