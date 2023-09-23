import { assembleTwoWay } from '$lib/internal/two-way-assembler';
import { expect, test } from 'vitest';
import dedent from 'dedent';
import {
	AddedBlock,
	PartiallyModifiedBlock,
	RemovedBlock,
	UnchangedBlock
} from '$lib/internal/blocks';
import { assembleThreeWay } from '$lib/internal/three-way-assembler';

test('assemble-two-way unchanged', () => {
	const blocks = assembleTwoWay(
		dedent`1
           2
           3`,
		dedent`1
           2
           3`
	);

	expect(blocks.at(0)).toBeInstanceOf(UnchangedBlock);
});

test('assemble-two-way added', () => {
	const blocks = assembleTwoWay(
		dedent`1
           2
           3`,
		dedent`1
           2
           3
           4`
	);

	expect(blocks).toHaveLength(2);
	expect(blocks.at(1)).toBeInstanceOf(AddedBlock);
});

test('assemble-two-way removed', () => {
	const blocks = assembleTwoWay(
		dedent`1
					 2
					 3
					 4`,
		dedent`1
					 2
					 3`
	);

	expect(blocks).toHaveLength(2);
	expect(blocks.at(1)).toBeInstanceOf(RemovedBlock);
});

test('assemble-two-way added and removed', () => {
	const blocks = assembleTwoWay(
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
	expect(blocks.at(0)).toBeInstanceOf(AddedBlock);
	expect(blocks.at(1)).toBeInstanceOf(UnchangedBlock);
	expect(blocks.at(2)).toBeInstanceOf(RemovedBlock);
});

test('assemble-two-way modified', () => {
	const blocks = assembleTwoWay(
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
	expect(blocks.at(1)).toBeInstanceOf(PartiallyModifiedBlock);
});

test('assemble-three-way unchanged', () => {
	const blocks = assembleThreeWay(
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

test('assemble-three-way added', () => {
	const blocks = assembleThreeWay(
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

test('assemble-three-way removed lhs', () => {
	const blocks = assembleThreeWay(
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

test('assemble-three-way removed rhs', () => {
	const blocks = assembleThreeWay(
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
