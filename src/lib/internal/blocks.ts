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

// /**
//  * Generate diff blocks for the editor.
//  * @param lhs Left hand side content.
//  * @param rhs Right hand side content.
//  * @returns Diff blocks to use into Views.
//  */
// export function generateDiffBlocks(lhs: string, rhs: string) {
// 	const blocks: { lhs: DiffBlock[]; rhs: DiffBlock[] } = {
// 		lhs: [],
// 		rhs: []
// 	};

// 	let previousChange: Change | undefined;
// 	let id = 0;
// 	let lhsLineNumber = 1;
// 	let rhsLineNumber = 1;

// 	const getId = () => (id++).toString();
// 	const getLhsLineNumber = () => lhsLineNumber++;
// 	const getRhsLineNumber = () => rhsLineNumber++;
// 	const getLinesDiff = (lhs: string, rhs: string): Array<Change[]> =>
// 		diffChars(lhs, rhs)
// 			.map((change) =>
// 				// "This \n is \n a change" => ["This \n" + "is \n", "a change"]
// 				change.value.split('\n').map((line, index) => ({
// 					...change,
// 					value: line + (index == change.value.split('\n').length - 1 ? '' : '\n')
// 				}))
// 			)
// 			.flat()
// 			.reduce<Array<Change[]>>(
// 				(acc, change) => {
// 					const incomplete = acc[acc.length - 1];
// 					incomplete.push(change);
// 					if (change.value.endsWith('\n')) {
// 						acc.push([]);
// 					}
// 					return acc;
// 				},
// 				[[]]
// 			)
// 			.map((t) => {
// 				console.log(t);
// 				return t;
// 			});
// 	const getLhsLinesDiff = (lhs: string, rhs: string): LinesDiff =>
// 		getLinesDiff(lhs, rhs)
// 			.filter((line) => line.find((change) => !change.added))
// 			.map((line) => ({
// 				number: getLhsLineNumber(),
// 				diff: line
// 			}));
// 	const getRhsLinesDiff = (lhs: string, rhs: string): LinesDiff =>
// 		getLinesDiff(lhs, rhs)
// 			.filter((line) => line.find((change) => !change.removed))
// 			.map((line) => ({
// 				number: getRhsLineNumber(),
// 				diff: line
// 			}));

// 	const addLhsLines = <T>(block: T, content: string): T & { lines: Line[] } => {
// 		console.log('lhs', content.replaceAll('\n', '\\n'));
// 		return {
// 			...block,
// 			lines: removeEndOfLine(content)
// 				.split('\n')
// 				.map((line) => ({ content: line, number: getLhsLineNumber() }))
// 		};
// 	};
// 	const addRhsLines = <T>(block: T, content: string): T & { lines: Line[] } => {
// 		console.log('rhs', content.replaceAll('\n', '\\n'));
// 		return {
// 			...block,
// 			lines: removeEndOfLine(content)
// 				.split('\n')
// 				.map((line) => ({ content: line, number: getRhsLineNumber() }))
// 		};
// 	};

// 	const removeEndOfLine = (string: string) =>
// 		string.endsWith('\n') ? string.slice(0, -1) : string;

// 	for (const change of diffLines(lhs, rhs)) {
// 		if (!change.added && !change.removed) {
// 			// Unchanged
// 			const block = {
// 				type: 'unchanged',
// 				id: getId()
// 			} as const;
// 			blocks.lhs.push(addLhsLines(block, change.value));
// 			blocks.rhs.push(addRhsLines(block, change.value));
// 			// } else if (
// 			// 	(change.added && previousChange?.removed) ||
// 			// 	(previousChange?.added && change.removed)
// 			// ) {
// 			// 	// Partially modified
// 			// 	// Remove blocks from previous iteration
// 			// 	const popLhs = blocks.lhs.pop();
// 			// 	const popRhs = blocks.rhs.pop();
// 			// 	if (popLhs?.type == 'removed') lhsLineNumber -= popLhs.lines.length;
// 			// 	if (popRhs?.type == 'added') rhsLineNumber -= popRhs.lines.length;

// 			// 	console.log(change, previousChange);

// 			// 	const partiallyAddedId = getId();
// 			// 	const partiallyRemovedId = getId();

// 			// 	const partiallyAddedBlock: PartiallyAddedBlock = {
// 			// 		referenceId: partiallyRemovedId,
// 			// 		type: 'partially_added',
// 			// 		lines: getRhsLinesDiff(previousChange.value, change.value),
// 			// 		id: partiallyAddedId
// 			// 	};
// 			// 	const partiallyRemovedBlock: PartiallyRemovedBlock = {
// 			// 		referenceId: partiallyAddedId,
// 			// 		type: 'partially_removed',
// 			// 		lines: getLhsLinesDiff(previousChange.value, change.value),
// 			// 		id: partiallyRemovedId
// 			// 	};

// 			// 	blocks.rhs.push(partiallyAddedBlock);
// 			// 	blocks.lhs.push(partiallyRemovedBlock);
// 		} else if (change.added) {
// 			// Added
// 			const addedBlock = addRhsLines(
// 				{
// 					type: 'added',
// 					id: getId()
// 				} as const,
// 				change.value
// 			);
// 			const addedPlaceholderBlock: AddedBlockPlaceholder = {
// 				referenceBlock: addedBlock,
// 				type: 'added_placeholder',
// 				id: getId()
// 			};
// 			blocks.rhs.push(addedBlock);
// 			blocks.lhs.push(addedPlaceholderBlock);
// 		} else if (change.removed) {
// 			// Removed
// 			const removedBlock: RemovedBlock = addLhsLines(
// 				{
// 					type: 'removed',
// 					content: change.value,
// 					id: getId()
// 				} as const,
// 				change.value
// 			);
// 			const removedPlaceholderBlock: RemovedBlockPlaceholder = {
// 				referenceBlock: removedBlock,
// 				type: 'removed_placeholder',
// 				id: getId()
// 			};
// 			blocks.rhs.push(removedPlaceholderBlock);
// 			blocks.lhs.push(removedBlock);
// 		}

// 		previousChange = change;
// 	}

// 	return blocks;
// }
