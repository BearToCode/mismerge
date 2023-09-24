import type { DiffColors, EditorColors } from './colors';
import type { BlockComponent } from './component';

export type Connection = {
	from: BlockComponent;
	to: BlockComponent;
};

function componentColor(
	blockComponent: BlockComponent,
	colors: Partial<EditorColors & DiffColors>
): `#${string}` {
	const defaultColor = '#000000';
	switch (blockComponent.type) {
		case 'added':
		case 'added_placeholder':
			return colors.added ?? defaultColor;
		case 'removed':
		case 'removed_placeholder':
			return colors.removed ?? defaultColor;
		case 'merge_conflict':
		case 'merge_conflict_placeholder':
			return colors.conflict ?? defaultColor;
		case 'partially_added':
			return colors.addedOverlay ?? defaultColor;
		case 'partially_removed':
			return colors.removedOverlay ?? defaultColor;
		default:
			return defaultColor;
	}
}

/**
 * Draw block connections onto a canvas.
 * @param canvas HTML canvas element.
 * @param connections Connections to draw.
 * @param colors Editor colors to use.
 * @param lhsViewElem Left hand side view HTML element.
 * @param rhsViewElem Right hand side view HTML element.
 * @param container Main container HTML element.
 */
export function drawConnections(
	canvas: HTMLCanvasElement,
	connections: Connection[],
	colors: EditorColors | DiffColors,
	lhsViewElem: HTMLDivElement,
	rhsViewElem: HTMLDivElement,
	container: HTMLElement
) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const width = canvas.width;

	ctx.reset();
	for (const connection of connections) {
		const fromElem = container.querySelector(`[id='${connection.from.id}']`);
		const toElem = container.querySelector(`[id='${connection.to.id}']`);
		if (
			!fromElem ||
			!toElem ||
			!(fromElem instanceof HTMLDivElement) ||
			!(toElem instanceof HTMLDivElement)
		)
			continue;
		const fromOffsetTop =
			fromElem.getBoundingClientRect().top - lhsViewElem.getBoundingClientRect().top;
		const toOffsetTop =
			toElem.getBoundingClientRect().top - rhsViewElem.getBoundingClientRect().top;
		const fromHeight = fromElem.offsetHeight;
		const toHeight = toElem.offsetHeight;

		const BezierOffset = 8;

		ctx.beginPath();
		ctx.moveTo(0, fromOffsetTop);
		ctx.bezierCurveTo(
			BezierOffset, // first control point x
			fromOffsetTop, // first control point y
			width - BezierOffset, // second control point x
			toOffsetTop, // second control point y
			width, // end x
			toOffsetTop // end y
		);
		ctx.lineTo(width, toOffsetTop + toHeight);
		ctx.bezierCurveTo(
			width - BezierOffset,
			toOffsetTop + toHeight,
			BezierOffset,
			fromOffsetTop + fromHeight,
			0,
			fromOffsetTop + fromHeight
		);

		const gradient = ctx.createLinearGradient(0, 0, width, 0);
		gradient.addColorStop(0, componentColor(connection.from, colors));
		gradient.addColorStop(1, componentColor(connection.to, colors));
		ctx.fillStyle = gradient;

		ctx.fill();
		ctx.closePath();
	}
}
