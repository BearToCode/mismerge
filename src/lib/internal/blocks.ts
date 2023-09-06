import { type Change, diffChars, diffLines } from 'diff';

export type DiffBlock =
	| UnchangedBlock
	| AddedBlock
	| AddedBlockPlaceholder
	| RemovedBlock
	| RemovedBlockPlaceholder
	| PartiallyAddedBlock
	| PartiallyRemovedBlock;

// Diff block types

/**
 * Shared content for all diff blocks;
 */
type BaseDiffBlock = { id: string };

export type UnchangedBlock = BaseDiffBlock & {
	content: string;
	type: 'unchanged';
};

/**
 * Whole line was added.
 */
export type AddedBlock = BaseDiffBlock & {
	content: string;
	type: 'added';
};

/**
 * Placeholder for a line that was added on the other side.
 */
export type AddedBlockPlaceholder = BaseDiffBlock & {
	referenceBlock: AddedBlock;
	type: 'added_placeholder';
};

/**
 * Whole line was removed.
 */
export type RemovedBlock = BaseDiffBlock & {
	content: string;
	type: 'removed';
};

/**
 * Placeholder for a line that was removed on the other side.
 */
export type RemovedBlockPlaceholder = BaseDiffBlock & {
	referenceBlock: RemovedBlock;
	type: 'removed_placeholder';
};

export type PartiallyAddedBlock = BaseDiffBlock & {
	referenceId: string;
	type: 'partially_added';
	diff: Change[];
};

export type PartiallyRemovedBlock = BaseDiffBlock & {
	referenceId: string;
	type: 'partially_removed';
	diff: Change[];
};

export type MountedDiffBlock<Block extends DiffBlock = DiffBlock> = Block & {
	elem: HTMLDivElement;
};

/**
 * Generate diff blocks for the editor.
 * @param lhs Left hand side content.
 * @param rhs Right hand side content.
 * @returns Diff blocks to use into Views.
 */
export function generateDiffBlocks(lhs: string, rhs: string) {
	const blocks: { lhs: DiffBlock[]; rhs: DiffBlock[] } = {
		lhs: [],
		rhs: []
	};

	let previousChange: Change | undefined;
	let id = 0;

	const getId = () => (id++).toString();

	for (const change of diffLines(lhs, rhs)) {
		if (!change.added && !change.removed) {
			// Unchanged
			const block: UnchangedBlock = {
				type: 'unchanged',
				content: change.value,
				id: getId()
			};
			blocks.lhs.push(block);
			blocks.rhs.push(block);
		} else if (
			(change.added && previousChange?.removed) ||
			(previousChange?.added && change.removed)
		) {
			// Partially modified
			// Remove "removed" blocks from previous iteration
			blocks.lhs.pop();
			blocks.rhs.pop();

			const diff = diffChars(previousChange.value, change.value);
			const partiallyAddedId = getId();
			const partiallyRemovedId = getId();

			const partiallyAddedBlock: PartiallyAddedBlock = {
				referenceId: partiallyRemovedId,
				type: 'partially_added',
				diff,
				id: partiallyAddedId
			};
			const partiallyRemovedBlock: PartiallyRemovedBlock = {
				referenceId: partiallyAddedId,
				type: 'partially_removed',
				diff,
				id: partiallyRemovedId
			};

			blocks.rhs.push(partiallyAddedBlock);
			blocks.lhs.push(partiallyRemovedBlock);
		} else if (change.added) {
			// Added
			const addedBlock: AddedBlock = {
				type: 'added',
				content: change.value,
				id: getId()
			};
			const addedPlaceholderBlock: AddedBlockPlaceholder = {
				referenceBlock: addedBlock,
				type: 'added_placeholder',
				id: getId()
			};
			blocks.rhs.push(addedBlock);
			blocks.lhs.push(addedPlaceholderBlock);
		} else if (change.removed) {
			// Removed
			const removedBlock: RemovedBlock = {
				type: 'removed',
				content: change.value,
				id: getId()
			};
			const removedPlaceholderBlock: RemovedBlockPlaceholder = {
				referenceBlock: removedBlock,
				type: 'removed_placeholder',
				id: getId()
			};
			blocks.rhs.push(removedPlaceholderBlock);
			blocks.lhs.push(removedBlock);
		}

		previousChange = change;
	}

	return blocks;
}
