import { assembleOneWay } from '$lib/internal/diff/one-way-assembler';
import { expect, test } from 'vitest';
import dedent from 'dedent';
import { assembleTwoWay } from '$lib/internal/diff/two-way-assembler';
import { UnchangedBlock } from '$lib/internal/blocks/unchanged';
import { ModifiedBlock } from '$lib/internal/blocks/modified';
import { MergeConflictBlock } from '$lib/internal/blocks/merge-conflict';
import { RemovedBlock } from '$lib/internal/blocks/removed';
import { AddedBlock } from '$lib/internal/blocks/added';
import DeleteChange from '$lib/components/actions/DeleteChange.svelte';
import MergeChange from '$lib/components/actions/MergeChange.svelte';
import { TwoWaySide } from '$lib/internal/editor/side';

test('assemble-one-way unchanged', () => {
	const blocks = assembleOneWay(
		dedent`1
           2
           3`,
		dedent`1
           2
           3`
	);

	expect(blocks.at(0)).toBeInstanceOf(UnchangedBlock);
});

test('assemble-one-way added', () => {
	const blocks = assembleOneWay(
		dedent`1
           2
           3`,
		dedent`1
           2
           3
           4`
	);

	expect(blocks).toHaveLength(2);
	expect(blocks.at(1)).toBeInstanceOf(RemovedBlock);
});

test('assemble-one-way removed', () => {
	const blocks = assembleOneWay(
		dedent`1
					 2
					 3
					 4`,
		dedent`1
					 2
					 3`
	);

	expect(blocks).toHaveLength(2);
	expect(blocks.at(1)).toBeInstanceOf(AddedBlock);
});

test('assemble-one-way added and removed', () => {
	const blocks = assembleOneWay(
		dedent`1
					 2
					 3
					 a`,
		dedent`b
					 1
					 2
					 3`
	);

	expect(blocks).toHaveLength(3);
	expect(blocks.at(0)).toBeInstanceOf(RemovedBlock);
	expect(blocks.at(1)).toBeInstanceOf(UnchangedBlock);
	expect(blocks.at(2)).toBeInstanceOf(AddedBlock);
});

test('assemble-one-way modified', () => {
	const blocks = assembleOneWay(
		dedent`1
					 2
					 3
					 a`,
		dedent`1
					 2
					 3
					 b`
	);

	expect(blocks).toHaveLength(2);
	expect(blocks.at(1)).toBeInstanceOf(ModifiedBlock);
});

test('assemble-two-way unchanged', () => {
	const blocks = assembleTwoWay(
		dedent`1
					 2
					 3`,
		dedent`1
					 2
					 3`,
		dedent`1
					 2
					 3`
	);
	expect(blocks.at(0)).toBeInstanceOf(UnchangedBlock);
});

test('assemble-two-way removed', () => {
	const blocks = assembleTwoWay(
		dedent`1
					 2
					 3`,
		dedent`1
					 2
					 3
					 4`,
		dedent`1
					 2
					 3`
	);

	expect(blocks).toHaveLength(2);
	expect(blocks.at(1)).toBeInstanceOf(AddedBlock);
});

test('assemble-two-way added lhs', () => {
	const blocks = assembleTwoWay(
		dedent`1
					 2
					 3
					 4`,
		dedent`1
					 2
					 3`,
		dedent`1
					 2
					 3`
	);

	expect(blocks).toHaveLength(2);
	expect(blocks.at(1)).toBeInstanceOf(RemovedBlock);
});

test('assemble-two-way added rhs', () => {
	const blocks = assembleTwoWay(
		dedent`1
					 2
					 3`,
		dedent`1
					 2
					 3`,
		dedent`1
					 2
					 3
					 4`
	);

	expect(blocks).toHaveLength(2);
	expect(blocks.at(1)).toBeInstanceOf(RemovedBlock);
});

test('modified blocks show delete action when a side is already merged into center', () => {
	const modifiedBlock = new ModifiedBlock({
		modifiedSidesData: [
			{
				side: TwoWaySide.lhs,
				lines: [{ parts: [{ content: 'left change', overlay: false }] }]
			},
			{
				side: TwoWaySide.ctr,
				lines: [{ parts: [{ content: 'center change', overlay: false }] }]
			}
		]
	});

	const components = modifiedBlock.render();
	const leftComponent = components.find((component) => component.side.eq(TwoWaySide.lhs));
	const centerComponent = components.find((component) => component.side.eq(TwoWaySide.ctr));

	expect(leftComponent?.sideAction?.component).toBe(MergeChange);
	expect(centerComponent?.sideAction).toBeUndefined();

	const mergedBlock = new ModifiedBlock({
		modifiedSidesData: [
			{
				side: TwoWaySide.lhs,
				lines: [{ parts: [{ content: 'left change', overlay: false }] }]
			},
			{
				side: TwoWaySide.ctr,
				lines: [
					{ parts: [{ content: 'left change', overlay: false }] },
					{ parts: [{ content: 'center change', overlay: false }] }
				]
			}
		]
	});

	const mergedComponents = mergedBlock.render();
	const mergedLeftComponent = mergedComponents.find((component) => component.side.eq(TwoWaySide.lhs));
	const mergedCenterComponent = mergedComponents.find((component) => component.side.eq(TwoWaySide.ctr));

	expect(mergedLeftComponent?.sideAction?.component).toBe(DeleteChange);
	expect(mergedLeftComponent?.type).toBe(ModifiedBlock.type);
	expect(mergedLeftComponent?.visualType).toBe(AddedBlock.type);
	expect(mergedCenterComponent?.props.acceptedInCenter).toBe(true);
	expect(mergedCenterComponent?.type).toBe(ModifiedBlock.type);
	expect(mergedCenterComponent?.visualType).toBe(AddedBlock.type);
});

test('accepted merge conflict source blocks render as added blocks', () => {
	const mergedConflict = new MergeConflictBlock({
		sidesData: [
			{
				side: TwoWaySide.lhs,
				lines: [{ content: 'left conflict' }]
			},
			{
				side: TwoWaySide.ctr,
				lines: [{ content: 'left conflict' }, { content: 'center conflict' }]
			},
			{
				side: TwoWaySide.rhs,
				lines: [{ content: 'right conflict' }]
			}
		]
	});

	const components = mergedConflict.render();
	const leftComponent = components.find((component) => component.side.eq(TwoWaySide.lhs));
	const centerComponent = components.find((component) => component.side.eq(TwoWaySide.ctr));

	expect(leftComponent?.sideAction?.component).toBe(DeleteChange);
	expect(leftComponent?.type).toBe(MergeConflictBlock.type);
	expect(leftComponent?.visualType).toBe(AddedBlock.type);
	expect(centerComponent?.type).toBe(MergeConflictBlock.type);
});

test('accepted unchanged source rows render as added blocks', () => {
	const mergedBlock = new ModifiedBlock({
		modifiedSidesData: [
			{
				side: TwoWaySide.ctr,
				lines: [
					{ parts: [{ content: 'shared line', overlay: false }] },
					{ parts: [{ content: 'center-only line', overlay: false }] }
				]
			}
		],
		unchangedSideData: {
			side: TwoWaySide.lhs,
			lines: [{ content: 'shared line' }]
		}
	});

	const components = mergedBlock.render();
	const leftComponent = components.find((component) => component.side.eq(TwoWaySide.lhs));

	expect(leftComponent?.sideAction?.component).toBe(DeleteChange);
	expect(leftComponent?.type).toBe(UnchangedBlock.type);
	expect(leftComponent?.visualType).toBe(AddedBlock.type);
});

