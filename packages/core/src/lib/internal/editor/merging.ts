import { dev } from '$lib/internal/env';
import type { BlockComponent } from './component';
import type { Side } from './side';

/**
 * Merges a block component with its corresponding component on the opposite side of the editor.
 * @param data An object containing the source component, its side, an array of components, and the container element.
 * @param data.source The source component to be merged.
 * @param data.side The side of the editor where the source component is located.
 * @param data.components An array of components to search for the corresponding component on the opposite side.
 * @param data.container The container element where the components are located.
 * @returns void
 */
export function mergeComponent(data: {
	source: BlockComponent;
	side: Side;
	components: BlockComponent[];
	container: HTMLElement;
}) {
	const sourceElem = data.container.querySelector(`[data-component-id="${data.source.id}"]`);

	if (!sourceElem) {
		if (dev) console.error('Failed to merge component: source element not found');
		return;
	}

	let targetComponent: BlockComponent | undefined;
	for (const component of data.components) {
		if (
			component.blockId === data.source.blockId &&
			(component.side.isOnTheLeftOf(data.side) || component.side.isOnTheRightOf(data.side))
		) {
			targetComponent = component;
			break;
		}
	}

	if (!targetComponent) return;

	const targetElem = data.container.querySelector(
		`[data-component-id="${targetComponent.id}"]`
	) as HTMLDivElement | null;

	if (!targetElem) {
		if (dev) console.error('Failed to merge component: corresponding component element not found');
		return;
	}

	const parent = targetElem.parentElement;

	if (!parent) {
		if (dev) console.error('Failed to merge component: parent element is null');
		return;
	}

	const textarea = parent.parentElement?.querySelector('textarea');

	if (!textarea) {
		if (dev) console.error('Failed to merge component: failed to find textarea');
		return;
	}

	const prevLines: string[] = [];
	const nextLines: string[] = [];
	let elemFound = false;

	for (const child of parent.children) {
		if (!(child instanceof HTMLDivElement)) {
			if (dev) console.error('Failed to merge component: child is not an HTMLDivElement');
			continue;
		}

		if (child.dataset.componentId === targetElem.dataset.componentId) {
			elemFound = true;
			continue;
		}

		if (elemFound) {
			nextLines.push(...linesFromComponentElem(child as HTMLDivElement));
		} else {
			prevLines.push(...linesFromComponentElem(child as HTMLDivElement));
		}
	}

	const sourceLines = linesFromComponentElem(sourceElem as HTMLDivElement);

	textarea.value = Array.prototype.concat(prevLines, sourceLines, nextLines).join('\n');

	// Trigger update using event
	const event = new Event('input', { bubbles: true });
	textarea.dispatchEvent(event);
}

function linesFromComponentElem(elem: HTMLDivElement): string[] {
	return (
		Array.from(elem.querySelectorAll('.msm__content'))
			.map((line) => line.textContent)
			.filter((line) => typeof line == 'string') as string[]
	).map((line) => line.replaceAll('\r', '').replaceAll('\n', ''));
}
