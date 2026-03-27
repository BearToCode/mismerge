import { dev } from '$lib/internal/env';
import type { BlockComponent } from './component';
import type { Side } from './side';
import { TwoWaySide } from './side';
import { endsWithSequence, startsWithSequence } from '$lib/internal/utils';

/**
 * Merges a block component with its corresponding component on the opposite side of the editor.
 * @param data An object containing the source component, its side, an array of components, and the container element.
 * @param data.source The source component to be merged.
 * @param data.side The side of the editor where the source component is located.
 * @param data.components An array of components to search for the corresponding component on the opposite side.
 * @param data.container The element containing the editor.
 * @returns void
 */
export function mergeComponent(data: {
	source: BlockComponent;
	side: Side;
	components: BlockComponent[];
	container: HTMLElement;
}) {
	const mergeData = getMergeData(data);
	if (!mergeData) {
		return;
	}

	const { prevLines, nextLines } = getContentAroundComponent(
		mergeData.correspondingWrapper,
		mergeData.correspondingComponent
	);
	const { compLines } = getContentAroundComponent(
		mergeData.correspondingWrapper,
		mergeData.correspondingComponent
	);

	const sourceLines = getLinesFromElem(mergeData.sourceElem as HTMLDivElement);
	const mergeStrategy = getMergeStrategy(data.source, mergeData.correspondingComponent);
	const mergedLines = applyMergedLines(compLines, sourceLines, mergeStrategy);
	mergeData.textarea.value = Array.prototype.concat(prevLines, mergedLines, nextLines).join('\n');

	// Trigger update using event
	const event = new Event('input', { bubbles: true });
	mergeData.textarea.dispatchEvent(event);
}

export function removeMergedComponent(data: {
	source: BlockComponent;
	side: Side;
	components: BlockComponent[];
	container: HTMLElement;
}) {
	const mergeData = getMergeData(data);
	if (!mergeData) {
		return;
	}

	const { prevLines, compLines, nextLines } = getContentAroundComponent(
		mergeData.correspondingWrapper,
		mergeData.correspondingComponent
	);
	const sourceLines = getLinesFromElem(mergeData.sourceElem as HTMLDivElement);
	const mergeStrategy = getMergeStrategy(data.source, mergeData.correspondingComponent);
	const remainingLines = removeMergedLines(compLines, sourceLines, mergeStrategy);

	if (!remainingLines) {
		if (dev) console.error('Failed to delete merged component: source lines not found in target');
		return;
	}

	mergeData.textarea.value = Array.prototype.concat(prevLines, remainingLines, nextLines).join('\n');

	const event = new Event('input', { bubbles: true });
	mergeData.textarea.dispatchEvent(event);
}

/**
 * Deletes a block component from the editor.
 * @param component The component to delete.
 * @param container The element containing the editor.
 * @returns void
 */
export function deleteComponent({
	component,
	container
}: {
	component: BlockComponent;
	container: HTMLElement;
}) {
	const elem = getComponentElem(container, component);
	if (!elem) {
		if (dev) console.error('Failed to delete component: element not found');
		return;
	}

	const wrapper = elem.parentElement;
	if (!wrapper) {
		if (dev) console.error('Failed to delete component: parent element is null');
		return;
	}

	const textarea = wrapper.parentElement?.querySelector('textarea');
	if (!textarea) {
		if (dev) console.error('Failed to delete component: failed to find textarea');
		return;
	}

	const { prevLines, nextLines } = getContentAroundComponent(wrapper, component);

	textarea.value = Array.prototype.concat(prevLines, nextLines).join('\n');

	// Trigger update using event
	const event = new Event('input', { bubbles: true });
	textarea.dispatchEvent(event);
}

/**
 * Gets the content around a component.
 * @param wrapper The wrapper element containing the component(`.msm__wrapper`)
 * @param component The component to get the content around
 * @returns An object containing the lines before, after, and around the component
 */
function getContentAroundComponent(wrapper: HTMLElement, component: BlockComponent) {
	const prevLines: string[] = [];
	const compLines: string[] = [];
	const nextLines: string[] = [];

	let elemFound = false;

	for (const block of wrapper.children) {
		if (!(block instanceof HTMLDivElement)) {
			continue;
		}

		if (block.dataset.componentId === component.id) {
			elemFound = true;
			compLines.push(...getLinesFromElem(block));
			continue;
		}

		if (elemFound) {
			nextLines.push(...getLinesFromElem(block));
		} else {
			prevLines.push(...getLinesFromElem(block));
		}
	}

	return { prevLines, compLines, nextLines };
}

function getLinesFromElem(elem: HTMLDivElement): string[] {
	return (
		Array.from(elem.querySelectorAll('.msm__content'))
			.map((line) => line.textContent)
			.filter((line) => typeof line == 'string') as string[]
	).map((line) => line.replaceAll('\r', '').replaceAll('\n', ''));
}

function getComponentElem(container: HTMLElement, component: BlockComponent) {
	return container.querySelector(`[data-component-id="${component.id}"]`);
}

function getMergeData(data: {
	source: BlockComponent;
	side: Side;
	components: BlockComponent[];
	container: HTMLElement;
}) {
	const sourceElem = getComponentElem(data.container, data.source);
	if (!sourceElem) {
		if (dev) console.error('Failed to merge component: source element not found');
		return;
	}

	let correspondingComponent: BlockComponent | undefined;
	for (const component of data.components) {
		if (
			component.blockId === data.source.blockId &&
			(component.side.isOnTheLeftOf(data.side) || component.side.isOnTheRightOf(data.side))
		) {
			correspondingComponent = component;
			break;
		}
	}
	if (!correspondingComponent) {
		if (dev) console.error('Failed to merge component: corresponding component not found');
		return;
	}

	const correspondingComponentElem = getComponentElem(data.container, correspondingComponent);
	if (!correspondingComponentElem) {
		if (dev) console.error('Failed to merge component: corresponding component element not found');
		return;
	}

	const correspondingWrapper = correspondingComponentElem.parentElement;
	if (!correspondingWrapper) {
		if (dev) console.error('Failed to merge component: parent element is null');
		return;
	}

	const textarea = correspondingWrapper.parentElement?.querySelector('textarea');
	if (!textarea) {
		if (dev) console.error('Failed to merge component: failed to find textarea');
		return;
	}

	return {
		sourceElem,
		correspondingComponent,
		correspondingWrapper,
		textarea
	};
}

function getMergeStrategy(
	source: BlockComponent,
	correspondingComponent: BlockComponent
): 'replace' | 'insert-above' | 'insert-below' {
	if (!supportsInsertMerge(source.type, correspondingComponent.type)) {
		return 'replace';
	}

	if (!(source.side instanceof TwoWaySide) || !(correspondingComponent.side instanceof TwoWaySide)) {
		return 'replace';
	}

	if (!correspondingComponent.side.eq(TwoWaySide.ctr) || source.side.eq(TwoWaySide.ctr)) {
		return 'replace';
	}

	if (
		(source.side as Side & { isOnTheLeftOf: (side: Side) => boolean }).isOnTheLeftOf(
			correspondingComponent.side
		)
	) {
		return 'insert-above';
	}

	return 'insert-below';
}

function applyMergedLines(
	compLines: string[],
	sourceLines: string[],
	mergeStrategy: 'replace' | 'insert-above' | 'insert-below'
) {
	if (mergeStrategy === 'insert-above') {
		if (startsWithSequence(compLines, sourceLines)) return compLines;
		return Array.prototype.concat(sourceLines, compLines);
	}

	if (mergeStrategy === 'insert-below') {
		if (endsWithSequence(compLines, sourceLines)) return compLines;
		return Array.prototype.concat(compLines, sourceLines);
	}

	return sourceLines;
}

function supportsInsertMerge(sourceType: string, correspondingType: string) {
	const insertableTypes = new Set(['modified', 'merge-conflict', 'resolved-merge-conflict']);
	return (
		(insertableTypes.has(sourceType) || sourceType === 'unchanged') &&
		insertableTypes.has(correspondingType)
	);
}

function removeMergedLines(
	compLines: string[],
	sourceLines: string[],
	mergeStrategy: 'replace' | 'insert-above' | 'insert-below'
) {
	if (mergeStrategy === 'insert-above') {
		if (!startsWithSequence(compLines, sourceLines)) return;
		return compLines.slice(sourceLines.length);
	}

	if (mergeStrategy === 'insert-below') {
		if (!endsWithSequence(compLines, sourceLines)) return;
		return compLines.slice(0, -sourceLines.length);
	}

	return [];
}
