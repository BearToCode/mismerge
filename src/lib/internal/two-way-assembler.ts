import {
	getLineDiffAlgorithm,
	twoWayDiff,
	type LineDiffAlgorithm,
	type TwoWayChange
} from './diff';
import {
	type LineDiff,
	type DiffBlock,
	AddedBlock,
	Side,
	RemovedBlock,
	UnchangedBlock,
	PartiallyModifiedBlock,
	TwoWaySide
} from './blocks';
import type { Change } from 'diff';
import { nanoid } from 'nanoid';

export interface TwoWayAssemblerOptions {
	lineDiffAlgorithm?: LineDiffAlgorithm;
	direction?: 'left-to-right' | 'right-to-left';
}

class TwoWayAssembler {
	constructor(private readonly options?: TwoWayAssemblerOptions) {
		if (options?.direction ?? 'left-to-right' == 'left-to-right') {
			this.removeSide = TwoWaySide.lhs;
			this.addSide = TwoWaySide.rhs;
		} else {
			this.removeSide = TwoWaySide.rhs;
			this.addSide = TwoWaySide.lhs;
		}
	}

	public assemble(lhs: string, rhs: string): DiffBlock[] {
		this.lhs = lhs;
		this.rhs = rhs;

		this.blocks = [];
		this.removeSideLineNumber = 1;
		this.addSideLineNumber = 1;

		this.linesDiff = twoWayDiff(this.lhs, this.rhs);

		this.addPlaceholderBlocks();

		this.advance();
		while (this.currentChange) {
			this.assembleBlock(this.currentChange);
			this.advance();
		}

		return this.blocks;
	}

	private lhs = '';
	private rhs = '';

	private addSide: TwoWaySide;
	private removeSide: TwoWaySide;

	private blocks: DiffBlock[] = [];

	private removeSideLineNumber = 1;
	private addSideLineNumber = 1;

	private linesDiff: TwoWayChange[] = [];
	private currentChange: TwoWayChange | undefined;
	private previousChange: TwoWayChange | undefined;
	private nextChange: TwoWayChange | undefined;

	private getId = () => nanoid(6);
	private getRemoveSideLineNumber = () => this.removeSideLineNumber++;
	private getAddSideLineNumber = () => this.addSideLineNumber++;

	private advance() {
		this.previousChange = this.currentChange;
		this.nextChange = this.linesDiff.at(1);
		return (this.currentChange = this.linesDiff.shift());
	}

	private assembleBlock(change: TwoWayChange) {
		if (change.lhs && change.rhs) {
			this.assembleUnchangedBlock(change);
		} else if (
			(change.lhs && this.nextChange?.rhs && !this.nextChange.lhs) ||
			(change.rhs && this.nextChange?.lhs && !this.nextChange.rhs)
		) {
			this.linesDiff.shift();
			this.assemblePartiallyModifiedBlock(change, this.nextChange);
		} else if (change.lhs) {
			this.assembleChangeBlock(change, TwoWaySide.lhs);
		} else if (change.rhs) {
			this.assembleChangeBlock(change, TwoWaySide.rhs);
		} else {
			console.error('Invalid combination of sides in change', change);
		}
	}

	private assembleChangeBlock(change: TwoWayChange, side: TwoWaySide) {
		let block: DiffBlock;
		if (this.addSide.eq(side)) {
			block = new AddedBlock(
				this.getId(),
				this.intoLines(change.content, side),
				side,
				side.opposite()
			);
		} else {
			block = new RemovedBlock(
				this.getId(),
				this.intoLines(change.content, side),
				side,
				side.opposite()
			);
		}
		this.blocks.push(block);
	}

	private assembleUnchangedBlock(change: TwoWayChange) {
		const block = new UnchangedBlock(this.getId(), [
			{
				lines: this.intoLines(change.content, this.addSide),
				side: this.addSide
			},
			{
				lines: this.intoLines(change.content, this.removeSide),
				side: this.removeSide
			}
		]);
		this.blocks.push(block);
	}

	private assemblePartiallyModifiedBlock(lhsChange: TwoWayChange, rhsChange: TwoWayChange) {
		const oldString = this.addSide.eq(TwoWaySide.rhs) ? lhsChange.content : rhsChange.content;
		const newString = this.addSide.eq(TwoWaySide.rhs) ? rhsChange.content : lhsChange.content;
		const block = new PartiallyModifiedBlock(this.getId(), [
			{
				type: 'added',
				lines: this.intoLinesDiff(oldString, newString, this.addSide),
				side: this.addSide
			},
			{
				type: 'removed',
				lines: this.intoLinesDiff(oldString, newString, this.removeSide),
				side: this.removeSide
			}
		]);
		this.blocks.push(block);
	}

	private intoLines(content: string, side: Side) {
		const lines = this.removeEndOfLine(content).split('\n');
		return lines.map((line) => ({
			content: line,
			number: side.eq(this.removeSide)
				? this.getRemoveSideLineNumber()
				: this.getAddSideLineNumber()
		}));
	}

	private intoLinesDiff(oldString: string, newString: string, side: Side): LineDiff[] {
		return (
			getLineDiffAlgorithm(this.options?.lineDiffAlgorithm ?? 'words_with_space')(
				oldString,
				newString
			)
				.filter((change) => {
					if (side.eq(this.removeSide)) return !change.added;
					return !change.removed;
				})
				// Split diffs that include newlines into multiple diffs
				.map((change) => {
					// "This \n is \n a change" => ["This \n" + "is \n", "a change"]
					return change.value.split('\n').map((line, index, lines) => ({
						...change,
						value: line + (index == lines.length - 1 ? '' : '\n')
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
				.filter((line, index, lines) => {
					return !(index == lines.length - 1 && line.length == 1 && line[0].value == '');
				})
				// Add line numbers
				.map((line) => ({
					number: side.eq(this.addSide)
						? this.getAddSideLineNumber()
						: this.getRemoveSideLineNumber(),
					diff: line
				}))
		);
	}

	private removeEndOfLine(content: string) {
		return content.endsWith('\n') ? content.slice(0, -1) : content;
	}

	private addPlaceholderBlocks() {
		const placeholderBlock = (side: TwoWaySide) =>
			new UnchangedBlock(this.getId(), { side, lines: [{ number: 1, content: '' }] });
		if (!this.linesDiff.find((change) => change.lhs))
			this.blocks.push(placeholderBlock(TwoWaySide.lhs));
		if (!this.linesDiff.find((change) => change.rhs))
			this.blocks.push(placeholderBlock(TwoWaySide.rhs));
	}
}

/**
 * Generate two-way diff blocks.
 * @param lhs Left hand side content.
 * @param rhs Right hand side content.
 * @param options Assemble options.
 * @returns Diff blocks to use in the View component.
 */
export function assembleTwoWay(lhs: string, rhs: string, options?: TwoWayAssemblerOptions) {
	return new TwoWayAssembler(options).assemble(lhs, rhs);
}
