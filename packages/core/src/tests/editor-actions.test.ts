// @vitest-environment jsdom

import { expect, test } from 'vitest';
import { mergeComponent, removeMergedComponent } from '$lib/internal/editor/actions';
import { BlockComponent } from '$lib/internal/editor/component';
import { OneWaySide, TwoWaySide } from '$lib/internal/editor/side';
import TestBlock from './fixtures/TestBlock.svelte';

function createComponent(side: OneWaySide | TwoWaySide, type: string, blockId = 'shared-block') {
	return new BlockComponent({
		component: TestBlock,
		blockId,
		props: {},
		side,
		type,
		linesCount: 1
	});
}

function createContainer(
	sourceComponent: BlockComponent,
	targetComponent: BlockComponent,
	sourceLines: string[],
	targetLines: string[]
) {
	const sourceHtml = sourceLines
		.map((line) => `<div class="msm__line"><div class="msm__content">${line}</div></div>`)
		.join('');
	const targetHtml = targetLines
		.map((line) => `<div class="msm__line"><div class="msm__content">${line}</div></div>`)
		.join('');

	const container = document.createElement('div');
	container.innerHTML = `
		<div class="msm__view-content">
			<div class="msm__wrapper">
				<div class="msm__block" data-component-id="${sourceComponent.id}">${sourceHtml}</div>
			</div>
			<textarea></textarea>
		</div>
		<div class="msm__view-content">
			<div class="msm__wrapper">
				<div class="msm__block" data-component-id="${targetComponent.id}">${targetHtml}</div>
			</div>
			<textarea></textarea>
		</div>
	`;

	const textareas = container.querySelectorAll('textarea');
	const targetTextarea = textareas.item(1) as HTMLTextAreaElement;
	return { container, targetTextarea };
}

test('merging a one-way modified change still replaces the target lines', () => {
	const source = createComponent(OneWaySide.lhs, 'modified');
	const target = createComponent(OneWaySide.rhs, 'modified');
	const { container, targetTextarea } = createContainer(source, target, ['left change'], ['right change']);

	mergeComponent({
		source,
		side: source.side,
		components: [source, target],
		container
	});

	expect(targetTextarea.value).toBe('left change');
});

test('merging a three-way modified left-side change into center inserts it above the target lines', () => {
	const source = createComponent(TwoWaySide.lhs, 'modified');
	const target = createComponent(TwoWaySide.ctr, 'modified');
	const { container, targetTextarea } = createContainer(source, target, ['left change'], ['center change']);

	mergeComponent({
		source,
		side: source.side,
		components: [source, target],
		container
	});

	expect(targetTextarea.value).toBe('left change\ncenter change');
});

test('removing an already merged three-way modified left-side change restores the center lines', () => {
	const source = createComponent(TwoWaySide.lhs, 'modified');
	const target = createComponent(TwoWaySide.ctr, 'modified');
	const { container, targetTextarea } = createContainer(source, target, ['left change'], [
		'left change',
		'center change'
	]);

	removeMergedComponent({
		source,
		side: source.side,
		components: [source, target],
		container
	});

	expect(targetTextarea.value).toBe('center change');
});

test('removing an accepted unchanged left-side component restores the center lines', () => {
	const source = createComponent(TwoWaySide.lhs, 'unchanged');
	const target = createComponent(TwoWaySide.ctr, 'modified');
	const { container, targetTextarea } = createContainer(source, target, ['accepted left line'], [
		'accepted left line',
		'center change'
	]);

	removeMergedComponent({
		source,
		side: source.side,
		components: [source, target],
		container
	});

	expect(targetTextarea.value).toBe('center change');
});

test('merging a three-way modified right-side change into center inserts it below the target lines', () => {
	const source = createComponent(TwoWaySide.rhs, 'modified');
	const target = createComponent(TwoWaySide.ctr, 'modified');
	const { container, targetTextarea } = createContainer(source, target, ['right change'], ['center change']);

	mergeComponent({
		source,
		side: source.side,
		components: [source, target],
		container
	});

	expect(targetTextarea.value).toBe('center change\nright change');
});

test('merging an unresolved conflict left-side change into center inserts it above the target lines', () => {
	const source = createComponent(TwoWaySide.lhs, 'merge-conflict');
	const target = createComponent(TwoWaySide.ctr, 'merge-conflict');
	const { container, targetTextarea } = createContainer(source, target, ['left change'], ['center change']);

	mergeComponent({
		source,
		side: source.side,
		components: [source, target],
		container
	});

	expect(targetTextarea.value).toBe('left change\ncenter change');
});

test('merging an unresolved conflict right-side change into center inserts it below the target lines', () => {
	const source = createComponent(TwoWaySide.rhs, 'merge-conflict');
	const target = createComponent(TwoWaySide.ctr, 'merge-conflict');
	const { container, targetTextarea } = createContainer(source, target, ['right change'], ['center change']);

	mergeComponent({
		source,
		side: source.side,
		components: [source, target],
		container
	});

	expect(targetTextarea.value).toBe('center change\nright change');
});

test('removing an already merged unresolved conflict right-side change restores the center lines', () => {
	const source = createComponent(TwoWaySide.rhs, 'merge-conflict');
	const target = createComponent(TwoWaySide.ctr, 'merge-conflict');
	const { container, targetTextarea } = createContainer(source, target, ['right change'], [
		'center change',
		'right change'
	]);

	removeMergedComponent({
		source,
		side: source.side,
		components: [source, target],
		container
	});

	expect(targetTextarea.value).toBe('center change');
});

test('merging a non-modified change still replaces the target lines', () => {
	const source = createComponent(OneWaySide.lhs, 'added');
	const target = createComponent(OneWaySide.rhs, 'added');
	const { container, targetTextarea } = createContainer(source, target, ['replacement'], ['original']);

	mergeComponent({
		source,
		side: source.side,
		components: [source, target],
		container
	});

	expect(targetTextarea.value).toBe('replacement');
});