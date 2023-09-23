import {
	getLineDiffAlgorithm,
	OneWayDiff,
	type LineDiffAlgorithm,
	type OneWayChange
} from './diff';
import {
	type LineDiff,
	type DiffBlock,
	AddedBlock,
	Side,
	RemovedBlock,
	UnchangedBlock,
	PartiallyModifiedBlock,
	OneWaySide
} from './blocks';
import type { Change } from 'diff';
import { nanoid } from 'nanoid';

export interface OneWayAssemblerOptions {
	lineDiffAlgorithm?: LineDiffAlgorithm;
	direction?: 'left-to-right' | 'right-to-left';
}

class OneWayAssembler {
	constructor(private readonly options?: OneWayAssemblerOptions) {
		if (options?.direction ?? 'left-to-right' == 'left-to-right') {
			this.removeSide = OneWaySide.lhs;
			this.addSide = OneWaySide.rhs;
		} else {
			this.removeSide = OneWaySide.rhs;
			this.addSide = OneWaySide.lhs;
		}
	}

	public assemble(lhs: string, rhs: string): DiffBlock[] {
		this.lhs = lhs;
		this.rhs = rhs;

		this.blocks = [];
		this.removeSideLineNumber = 1;
		this.addSideLineNumber = 1;

		this.linesDiff = OneWayDiff(this.lhs, this.rhs);

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

	private addSide: OneWaySide;
	private removeSide: OneWaySide;

	private blocks: DiffBlock[] = [];

	private removeSideLineNumber = 1;
	private addSideLineNumber = 1;

	private linesDiff: OneWayChange[] = [];
	private currentChange: OneWayChange | undefined;
	private previousChange: OneWayChange | undefined;
	private nextChange: OneWayChange | undefined;

	private getId = () => nanoid(6);
	private getRemoveSideLineNumber = () => this.removeSideLineNumber++;
	private getAddSideLineNumber = () => this.addSideLineNumber++;

	private advance() {
		this.previousChange = this.currentChange;
		this.nextChange = this.linesDiff.at(1);
		return (this.currentChange = this.linesDiff.shift());
	}

	private assembleBlock(change: OneWayChange) {
		if (change.lhs && change.rhs) {
			this.assembleUnchangedBlock(change);
		} else if (
			(change.lhs && this.nextChange?.rhs && !this.nextChange.lhs) ||
			(change.rhs && this.nextChange?.lhs && !this.nextChange.rhs)
		) {
			this.linesDiff.shift();
			this.assemblePartiallyModifiedBlock(change, this.nextChange);
		} else if (change.lhs) {
			this.assembleChangeBlock(change, OneWaySide.lhs);
		} else if (change.rhs) {
			this.assembleChangeBlock(change, OneWaySide.rhs);
		} else {
			console.error('Invalid combination of sides in change', change);
		}
	}

	private assembleChangeBlock(change: OneWayChange, side: OneWaySide) {
		let block: DiffBlock;
		if (this.addSide.eq(side)) {
			block = new AddedBlock({
				id: this.getId(),
				lines: this.intoLines(change.content, side),
				side,
				placeholderSide: side.opposite()
			});
		} else {
			block = new RemovedBlock({
				id: this.getId(),
				lines: this.intoLines(change.content, side),
				side,
				placeholderSide: side.opposite()
			});
		}
		this.blocks.push(block);
	}

	private assembleUnchangedBlock(change: OneWayChange) {
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

	private assemblePartiallyModifiedBlock(lhsChange: OneWayChange, rhsChange: OneWayChange) {
		const oldString = this.addSide.eq(OneWaySide.rhs) ? lhsChange.content : rhsChange.content;
		const newString = this.addSide.eq(OneWaySide.rhs) ? rhsChange.content : lhsChange.content;
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
		const placeholderBlock = (side: OneWaySide) =>
			new UnchangedBlock(this.getId(), { side, lines: [{ number: 1, content: '' }] });
		if (!this.linesDiff.find((change) => change.lhs))
			this.blocks.push(placeholderBlock(OneWaySide.lhs));
		if (!this.linesDiff.find((change) => change.rhs))
			this.blocks.push(placeholderBlock(OneWaySide.rhs));
	}
}

/**
 * Generate one-way diff blocks.
 * @param lhs Left hand side content.
 * @param rhs Right hand side content.
 * @param options Assemble options.
 * @returns Diff blocks to use in the View component.
 */
export function assembleOneWay(lhs: string, rhs: string, options?: OneWayAssemblerOptions) {
	return new OneWayAssembler(options).assemble(lhs, rhs);
}
