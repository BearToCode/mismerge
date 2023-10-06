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
		if (lhsViewElem && rhsViewElem)
			drawConnections(canvas, connections, colors, lhsViewElem, rhsViewElem, container);
	};

	/* Local variables */

	let canvas: HTMLCanvasElement;
	let width: number, height: number;
	let savedContainer: HTMLDivElement;
	let savedConnections: Connection[];

	/* Local functions */

	function setDimensions() {
		canvas.width = Math.floor(width);
		canvas.height = Math.floor(height + 2);
	}

	const redraw = () => savedConnections && savedContainer && draw(savedContainer, savedConnections);

	/* Reactive statements */

	$: {
		lhsViewElem;
		rhsViewElem;
		redraw();
	}

	$: {
		width;
		height;
		if (canvas) {
			setDimensions();
			redraw();
		}
	}
</script>

<div class="msm__connector" bind:offsetWidth={width} bind:offsetHeight={height}>
	<canvas bind:this={canvas} />
</div>
