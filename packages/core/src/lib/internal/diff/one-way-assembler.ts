import type { DiffBlock } from '../blocks';
import { AddedBlock } from '../blocks/added';
import { RemovedBlock } from '../blocks/removed';
import { UnchangedBlock } from '../blocks/unchanged';
import { type OneWayChange, oneWayDiff } from './base';
import { diff2Sides, equalIgnoringWhitespace, type LineDiffAlgorithm } from './line-diff';
import { OneWaySide } from '../editor/side';
import { nanoid } from 'nanoid';
import { BlocksHashTable } from '../storage/table';
import { ModifiedBlock } from '../blocks/modified';
import type { LinesOptions } from 'diff';
import { dev } from '$lib/internal/env';

export interface OneWayAssemblerOptions {
	lineDiffAlgorithm?: LineDiffAlgorithm;
	hashTable?: BlocksHashTable<OneWaySide>;
	direction?: 'left-to-right' | 'right-to-left';
	diffOpts?: LinesOptions;
}

/**
 * One way diff blocks assembler.
 */
class OneWayAssembler {
	constructor(private readonly options?: OneWayAssemblerOptions) {
		if (options?.hashTable) this.hashTable = options.hashTable;

		if ((options?.direction ?? 'left-to-right') == 'left-to-right') {
			this.removeSide = OneWaySide.lhs;
			this.addSide = OneWaySide.rhs;
		} else {
			this.removeSide = OneWaySide.rhs;
			this.addSide = OneWaySide.lhs;
		}
	}

	/**
	 * Assembly one-way diff blocks.
	 * @param lhs Left hand side content.
	 * @param rhs Right hand side content.
	 * @returns The assembled diff blocks.
	 */
	public assemble(lhs: string, rhs: string): DiffBlock<OneWaySide>[] {
		this.hashTable.startGeneration();

		this.lhs = lhs;
		this.rhs = rhs;

		this.blocks = [];

		this.linesDiff = oneWayDiff(this.lhs, this.rhs, this.options?.diffOpts);

		this.advance();
		while (this.currentChange) {
			this.assembleBlock(this.currentChange);
			this.advance();
		}

		this.hashTable.endGeneration();

		return this.blocks;
	}

	private hashTable: BlocksHashTable<OneWaySide> = new BlocksHashTable();

	private lhs = '';
	private rhs = '';

	private addSide: OneWaySide;
	private removeSide: OneWaySide;

	private blocks: DiffBlock<OneWaySide>[] = [];

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
			if (dev) console.error('Invalid combination of sides in change', change);
		}
	}

	private assembleChangeBlock(change: OneWayChange, side: OneWaySide) {
		let block: DiffBlock<OneWaySide>;
		if (this.addSide.eq(side)) {
			block = this.hashTable.new(AddedBlock, {
				sidesData: {
					lines: this.intoLines(change.content),
					side
				},
				placeholderSide: side.opposite()
			});
		} else {
			block = this.hashTable.new(RemovedBlock, {
				sidesData: {
					lines: this.intoLines(change.content),
					side
				},
				placeholderSide: side.opposite()
			});
		}
		this.blocks.push(block);
	}

	private assembleUnchangedBlock(change: OneWayChange) {
		const block = this.hashTable.new(UnchangedBlock, {
			sidesData: [
				{
					side: this.addSide,
					lines: this.intoLines(change.content)
				},
				{
					side: this.removeSide,
					lines: this.intoLines(change.content)
				}
			]
		});
		this.blocks.push(block);
	}

	private assemblePartiallyModifiedBlock(lhsChange: OneWayChange, rhsChange: OneWayChange) {
		if (
			this.options?.diffOpts?.ignoreWhitespace &&
			equalIgnoringWhitespace(lhsChange.content, rhsChange.content)
		) {
			const block = this.hashTable.new(UnchangedBlock, {
				sidesData: [
					{
						side: OneWaySide.lhs,
						lines: this.intoLines(lhsChange.content)
					},
					{
						side: OneWaySide.rhs,
						lines: this.intoLines(lhsChange.content)
					}
				]
			});
			return this.blocks.push(block);
		}

		const diff = diff2Sides(lhsChange.content, rhsChange.content, {
			algorithm: this.options?.lineDiffAlgorithm
		});

		const block = this.hashTable.new(ModifiedBlock, {
			modifiedSidesData: [
				{
					lines: this.addSide.eq(OneWaySide.lhs) ? diff.lhs : diff.rhs,
					side: this.addSide
				},
				{
					lines: this.addSide.eq(OneWaySide.lhs) ? diff.rhs : diff.lhs,
					side: this.removeSide
				}
			]
		});
		this.blocks.push(block);
	}

	private intoLines(content: string) {
		const lines = this.removeEndOfLine(content).split('\n');
		return lines.map((line) => {
			return {
				content: line
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
