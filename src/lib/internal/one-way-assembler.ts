import { get, writable } from 'svelte/store';
import type { DiffBlock } from './blocks';
import { AddedBlock } from './blocks/added';
import { PartiallyModifiedBlock } from './blocks/partially-modified';
import { RemovedBlock } from './blocks/removed';
import { UnchangedBlock } from './blocks/unchanged';
import { type OneWayChange, OneWayDiff } from './diff';
import { diff2Sides, type LineDiff, type LineDiffAlgorithm } from './line-diff';
import { Side, OneWaySide } from './side';
import { nanoid } from 'nanoid';

export interface OneWayAssemblerOptions {
	lineDiffAlgorithm?: LineDiffAlgorithm;
	direction?: 'left-to-right' | 'right-to-left';
}

class OneWayAssembler {
	constructor(private readonly options?: OneWayAssemblerOptions) {
		if ((options?.direction ?? 'left-to-right') == 'left-to-right') {
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
		this.removeSideLineNumber.set(1);
		this.addSideLineNumber.set(1);

		this.linesDiff = OneWayDiff(this.lhs, this.rhs);

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

	private removeSideLineNumber = writable(1);
	private addSideLineNumber = writable(1);

	private linesDiff: OneWayChange[] = [];
	private currentChange: OneWayChange | undefined;
	private previousChange: OneWayChange | undefined;
	private nextChange: OneWayChange | undefined;

	private getId = () => nanoid(6);

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
				sidesData: {
					lines: this.intoLines(change.content, side),
					side
				},
				placeholderSide: side.opposite()
			});
		} else {
			block = new RemovedBlock({
				id: this.getId(),
				sidesData: {
					lines: this.intoLines(change.content, side),
					side
				},
				placeholderSide: side.opposite()
			});
		}
		this.blocks.push(block);
	}

	private assembleUnchangedBlock(change: OneWayChange) {
		const block = new UnchangedBlock({
			id: this.getId(),
			sidesData: [
				{
					lines: this.intoLines(change.content, this.addSide),
					side: this.addSide
				},
				{
					lines: this.intoLines(change.content, this.removeSide),
					side: this.removeSide
				}
			]
		});
		this.blocks.push(block);
	}

	private assemblePartiallyModifiedBlock(lhsChange: OneWayChange, rhsChange: OneWayChange) {
		let lhsLines: LineDiff[];
		let rhsLines: LineDiff[];

		if (this.addSide.eq(OneWaySide.lhs)) {
			const diff = diff2Sides(lhsChange.content, rhsChange.content, {
				algorithm: this.options?.lineDiffAlgorithm,
				lhsLineNumber: this.addSideLineNumber,
				rhsLineNumber: this.removeSideLineNumber
			});
			lhsLines = diff.lhs;
			rhsLines = diff.rhs;
		} else {
			const diff = diff2Sides(lhsChange.content, rhsChange.content, {
				algorithm: this.options?.lineDiffAlgorithm,
				lhsLineNumber: this.removeSideLineNumber,
				rhsLineNumber: this.addSideLineNumber
			});
			lhsLines = diff.lhs;
			rhsLines = diff.rhs;
		}

		const block = new PartiallyModifiedBlock({
			id: this.getId(),
			sidesData: [
				{
					type: 'added',
					lines: this.addSide.eq(OneWaySide.lhs) ? lhsLines : rhsLines,
					side: this.addSide
				},
				{
					type: 'removed',
					lines: this.addSide.eq(OneWaySide.lhs) ? rhsLines : lhsLines,
					side: this.removeSide
				}
			]
		});
		this.blocks.push(block);
	}

	private intoLines(content: string, side: Side) {
		const lines = this.removeEndOfLine(content).split('\n');
		return lines.map((line) => {
			const lineNumberStore = side.eq(this.removeSide)
				? this.removeSideLineNumber
				: this.addSideLineNumber;
			const number = get(lineNumberStore);
			lineNumberStore.set(number + 1);
			return {
				content: line,
				number
			};
		});
	}

	private removeEndOfLine(content: string) {
		return content.endsWith('\n') ? content.slice(0, -1) : content;
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
