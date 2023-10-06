import { onDestroy, onMount } from 'svelte';
import type { EditorColors } from './colors';
import type { BlockComponent } from './component';
import { DEV } from '../utils';
import { TwoWaySide } from './side';

/**
 * A connection between two blocks.
 */
export type Connection = {
	from: BlockComponent;
	to: BlockComponent;
};

function componentColor(component: BlockComponent, colors: EditorColors): `#${string}` {
	const defaultColor = '#ffffff';
	switch (component.type) {
		case 'added':
		case 'added-placeholder':
			return colors.added ?? defaultColor;
		case 'removed':
		case 'removed-placeholder':
			if (component.side instanceof TwoWaySide) return colors.removedBothSides ?? defaultColor;
			else return colors.removed ?? defaultColor;
		case 'merge-conflict':
		case 'merge-conflict-placeholder':
			return colors.conflict ?? defaultColor;
		case 'resolved-merge-conflict':
		case 'resolved-merge-conflict-placeholder':
			return colors.resolvedConflict ?? defaultColor;
		case 'modified':
			return colors.modified ?? defaultColor;
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
	colors: EditorColors,
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

/**
 * Draw connections when the DOM changes.
 * @param getTarget A function that returns the target element to observe. It is a function because the element
 * 									is defined only after the element is mounted.
 * @param draw Draw connections function.
 */
export function drawOnChange(getTarget: () => HTMLDivElement, draw: () => void) {
	let observer: MutationObserver | undefined;
	onMount(() => {
		observer = new MutationObserver(draw);
		const target = getTarget();
		if (!target) {
			if (DEV) console.error('Cannot listen for changes to draw connections: target is undefined');
			return;
		}
		observer.observe(target, {
			characterData: false,
			attributes: false,
			childList: true,
			subtree: true
		});

		draw();
	});

	onDestroy(() => observer?.disconnect());
}
