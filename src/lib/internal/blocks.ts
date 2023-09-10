import type { Change } from 'diff';

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

type Line = {
	content: string;
	number: number;
};

export type UnchangedBlock = BaseDiffBlock & {
	lines: Line[];
	type: 'unchanged';
};

/**
 * Whole line was added.
 */
export type AddedBlock = BaseDiffBlock & {
	lines: Line[];
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
	lines: Line[];
	type: 'removed';
};

/**
 * Placeholder for a line that was removed on the other side.
 */
export type RemovedBlockPlaceholder = BaseDiffBlock & {
	referenceBlock: RemovedBlock;
	type: 'removed_placeholder';
};

export type LinesDiff = Array<{
	number: number;
	diff: Change[];
}>;

/**
 * Line was partially added.
 */
export type PartiallyAddedBlock = BaseDiffBlock & {
	referenceId: string;
	type: 'partially_added';
	lines: LinesDiff;
};

/**
 * Line was partially removed.
 */
export type PartiallyRemovedBlock = BaseDiffBlock & {
	referenceId: string;
	type: 'partially_removed';
	lines: LinesDiff;
};

export type MountedDiffBlock<Block extends DiffBlock = DiffBlock> = Block & {
	elem: HTMLDivElement;
};
