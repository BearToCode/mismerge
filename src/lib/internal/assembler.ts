import { diffLines, type Change, diffWordsWithSpace } from 'diff';
import type {
	AddedBlock,
	AddedBlockPlaceholder,
	DiffBlock,
	LinesDiff,
	PartiallyAddedBlock,
	PartiallyRemovedBlock,
	RemovedBlock,
	RemovedBlockPlaceholder,
	UnchangedBlock
} from './blocks';

class Assembler {
	public assemble(
		lhs: string,
		rhs: string
	): {
		lhs: DiffBlock[];
		rhs: DiffBlock[];
	} {
		this.lhs = lhs;
		this.rhs = rhs;
		this.lhsBlocks = [];
		this.rhsBlocks = [];
		this.id = 0;
		this.lhsLineNumber = 1;
		this.rhsLineNumber = 1;
		this.linesDiff = diffLines(lhs, rhs);
		this.advance();
		while (this.currentChange) {
			this.assembleBlock(this.currentChange);
			this.advance();
		}

		return {
			lhs: this.lhsBlocks,
			rhs: this.rhsBlocks
		};
	}

	private lhs = '';
	private rhs = '';

	private lhsBlocks: DiffBlock[] = [];
	private rhsBlocks: DiffBlock[] = [];

	private id = 0;
	private lhsLineNumber = 1;
	private rhsLineNumber = 1;

	private linesDiff: Change[] = [];
	private currentChange: Change | undefined;
	private previousChange: Change | undefined;
	private nextChange: Change | undefined;

	private getId = () => (this.id++).toString();
	private getLhsLineNumber = () => this.lhsLineNumber++;
	private getRhsLineNumber = () => this.rhsLineNumber++;

	private advance() {
		this.previousChange = this.currentChange;
		this.nextChange = this.linesDiff.at(1);
		return (this.currentChange = this.linesDiff.shift());
	}

	private assembleBlock(change: Change) {
		if (
			(change.added && this.previousChange?.removed) ||
			(this.previousChange?.added && change.removed)
		) {
			const partiallyAddedId = this.getId();
			const partiallyRemovedId = this.getId();

			this.assemblePartiallyAddedBlock(change, partiallyAddedId, partiallyRemovedId);
			this.assemblePartiallyRemovedBlock(change, partiallyAddedId, partiallyRemovedId);
		} else if (change.added) {
			this.assembleAddedBlock(change);
		} else if (change.removed) {
			this.assembleRemovedBlock(change);
		} else {
			this.assembleUnchangedBlock(change);
		}
	}

	private assembleAddedBlock(change: Change) {
		const addedBlock: AddedBlock = {
			type: 'added',
			id: this.getId(),
			lines: this.intoLines(change.value, 'rhs')
		};
		const placeholderBlock: AddedBlockPlaceholder = {
			type: 'added_placeholder',
			id: this.getId(),
			referenceBlock: addedBlock
		};
		this.rhsBlocks.push(addedBlock);
		this.lhsBlocks.push(placeholderBlock);
	}

	private assembleRemovedBlock(change: Change) {
		const removed: RemovedBlock = {
			type: 'removed',
			id: this.getId(),
			lines: this.intoLines(change.value, 'lhs')
		};
		const placeholderBlock: RemovedBlockPlaceholder = {
			type: 'removed_placeholder',
			id: this.getId(),
			referenceBlock: removed
		};
		this.lhsBlocks.push(removed);
		this.rhsBlocks.push(placeholderBlock);
	}

	private assembleUnchangedBlock(change: Change) {
		const block: Omit<UnchangedBlock, 'lines'> = {
			type: 'unchanged',
			id: this.getId()
		};

		const lhsBlock = { ...block, lines: this.intoLines(change.value, 'lhs') };
		const rhsBlock = { ...block, lines: this.intoLines(change.value, 'rhs') };

		this.lhsBlocks.push(lhsBlock);
		this.rhsBlocks.push(rhsBlock);
	}

	private assemblePartiallyAddedBlock(change: Change, lhsId: string, rhsId: string) {
		const previousBlock = this.rhsBlocks.pop();
		if (previousBlock?.type == 'added') this.rhsLineNumber -= previousBlock.lines.length;

		const block: PartiallyAddedBlock = {
			type: 'partially_added',
			id: lhsId,
			referenceId: rhsId,
			lines: this.intoLinesDiff(this.previousChange?.value ?? '', change.value, 'rhs')
		};

		this.rhsBlocks.push(block);
	}

	private assemblePartiallyRemovedBlock(change: Change, lhsId: string, rhsId: string) {
		const previousBlock = this.lhsBlocks.pop();
		if (previousBlock?.type == 'removed') this.lhsLineNumber -= previousBlock.lines.length;

		const block: PartiallyRemovedBlock = {
			type: 'partially_removed',
			id: rhsId,
			referenceId: lhsId,
			lines: this.intoLinesDiff(this.previousChange?.value ?? '', change.value, 'lhs')
		};

		this.lhsBlocks.push(block);
	}

	private intoLines(content: string, side: 'lhs' | 'rhs') {
		const lines = this.removeEndOfLine(content, side).split('\n');
		return lines.map((line) => ({
			content: line,
			number: side === 'lhs' ? this.getLhsLineNumber() : this.getRhsLineNumber()
		}));
	}

	private intoLinesDiff(lhs: string, rhs: string, side: 'lhs' | 'rhs'): LinesDiff {
		return (
			diffWordsWithSpace(lhs, rhs)
				.filter((change) => {
					if (side === 'lhs') return !change.added;
					return !change.removed;
				})
				// Split diffs that include newlines into multiple diffs
				.map((change) => {
					// "This \n is \n a change" => ["This \n" + "is \n", "a change"]
					return change.value.split('\n').map((line, index) => ({
						...change,
						value: line + (index == change.value.split('\n').length - 1 ? '' : '\n')
					}));
				})
				// Flatten array
				.flat()
				// Group by line
				.reduce<Array<Change[]>>(
					(acc, change) => {
						const incomplete = acc[acc.length - 1];
						incomplete.push(change);
						if (change.value.endsWith('\n')) {
							acc.push([]);
						}
						return acc;
					},
					[[]]
				)
				// Add line numbers
				.map((line) => ({
					number: side === 'lhs' ? this.getLhsLineNumber() : this.getRhsLineNumber(),
					diff: line
				}))
		);
	}

	private removeEndOfLine(content: string, side: 'lhs' | 'rhs') {
		if (
			!this.linesDiff.find((change) => {
				if (side == 'lhs') return !change.added;
				return !change.removed;
			})
		)
			return content;
		return content.endsWith('\n') ? content.slice(0, -1) : content;
	}
}

/**
 * Generate blocks for the editor.
 * @param lhs Left hand side content.
 * @param rhs Right hand side content.
 * @returns Diff blocks to use in the View component.
 */
export function assembleBlocks(lhs: string, rhs: string) {
	return new Assembler().assemble(lhs, rhs);
}
