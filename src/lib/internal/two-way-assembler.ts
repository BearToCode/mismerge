import type { DiffBlock } from './blocks';
import { AddedBlock, type AddedSideData } from './blocks/added';
import { MergeConflictBlock } from './blocks/merge-conflict';
import { ModifiedBlock } from './blocks/modified';
import { RemovedBlock, type RemovedSideData } from './blocks/removed';
import { UnchangedBlock } from './blocks/unchanged';
import { TwoWayDiff, type TwoWayChange } from './diff';
import { diff2Sides, type LineDiffAlgorithm } from './line-diff';
import { TwoWaySide } from './side';
import { nanoid } from 'nanoid';

export interface TwoWayAssemblerOptions {
	lineDiffAlgorithm?: LineDiffAlgorithm;
}

class TwoWayAssembler {
	constructor(private readonly options?: TwoWayAssemblerOptions) {}

	public assemble(lhs: string, ctr: string, rhs: string): DiffBlock[] {
		this.lhs = lhs;
		this.ctr = ctr;
		this.rhs = rhs;

		this.blocks = [];

		this.lhsLineNumber = 1;
		this.ctrLineNumber = 1;
		this.rhsLineNumber = 1;

		this.linesDiff = TwoWayDiff(this.lhs, this.ctr, this.rhs);

		this.addPlaceholderBlocks();

		this.advance();
		while (this.currentChange) {
			this.assembleBlock(this.currentChange);
			this.advance();
		}

		this.generateMergeConflictBlocks();
		this.generateModifiedBlocks();

		return this.blocks;
	}

	private lhs = '';
	private ctr = '';
	private rhs = '';

	private blocks: DiffBlock[] = [];

	private lhsLineNumber = 1;
	private ctrLineNumber = 1;
	private rhsLineNumber = 1;

	private linesDiff: TwoWayChange[] = [];
	private currentChange: TwoWayChange | undefined;

	private getId = () => nanoid(6);
	private getLhsLineNumber = () => this.lhsLineNumber++;
	private getCtrLineNumber = () => this.ctrLineNumber++;
	private getRhsLineNumber = () => this.rhsLineNumber++;

	private advance() {
		return (this.currentChange = this.linesDiff.shift());
	}

	private assembleBlock(change: TwoWayChange) {
		if (change.lhs && change.ctr && change.rhs) {
			this.assembleUnchangedBlock(change);
		} else if (change.ctr) {
			this.assembleRemovedBlock(change);
		} else if (!change.ctr && (change.lhs || change.rhs)) {
			this.assembleAddedBlock(change);
		} else {
			console.error('Invalid combination of sides in change', change);
		}
	}

	private assembleAddedBlock(change: TwoWayChange) {
		const side = change.lhs ? TwoWaySide.lhs : change.ctr ? TwoWaySide.ctr : TwoWaySide.rhs;

		const block = new AddedBlock({
			id: this.getId(),
			sidesData: {
				lines: this.intoLines(change.content, side),
				side
			},
			placeholderSide: side.adjacentSides().filter((side) => {
				if (side.eq(TwoWaySide.lhs)) return !change.lhs;
				if (side.eq(TwoWaySide.ctr)) return !change.ctr;
				if (side.eq(TwoWaySide.rhs)) return !change.rhs;
			})
		});

		this.blocks.push(block);
	}

	private assembleRemovedBlock(change: TwoWayChange) {
		const side = TwoWaySide.ctr;

		const sidesData = [
			{
				lines: this.intoLines(change.content, side),
				side
			}
		];

		if (change.lhs)
			sidesData.push({
				lines: this.intoLines(change.content, TwoWaySide.lhs),
				side: TwoWaySide.lhs
			});
		if (change.rhs)
			sidesData.push({
				lines: this.intoLines(change.content, TwoWaySide.rhs),
				side: TwoWaySide.rhs
			});

		const block = new RemovedBlock({
			id: this.getId(),
			sidesData,
			placeholderSide: side.adjacentSides().filter((side) => {
				if (side.eq(TwoWaySide.lhs)) return !change.lhs;
				if (side.eq(TwoWaySide.ctr)) return !change.ctr;
				if (side.eq(TwoWaySide.rhs)) return !change.rhs;
			})
		});

		this.blocks.push(block);
	}

	private assembleUnchangedBlock(change: TwoWayChange) {
		const sides: TwoWaySide[] = [TwoWaySide.lhs, TwoWaySide.ctr, TwoWaySide.rhs];
		const block = new UnchangedBlock({
			id: this.getId(),
			sidesData: sides.map((side) => ({ side, lines: this.intoLines(change.content, side) }))
		});
		this.blocks.push(block);
	}

	private intoLines(content: string, side: TwoWaySide) {
		const lines = this.removeEndOfLine(content).split('\r\n');
		return lines.map((line) => ({
			content: line,
			number: side.eq(TwoWaySide.lhs)
				? this.getLhsLineNumber()
				: side.eq(TwoWaySide.ctr)
				? this.getCtrLineNumber()
				: this.getRhsLineNumber()
		}));
	}

	private removeEndOfLine(content: string) {
		return content.endsWith('\r\n') ? content.slice(0, -2) : content;
	}

	private addPlaceholderBlocks() {
		const placeholderBlock = (side: TwoWaySide) =>
			new UnchangedBlock({
				id: this.getId(),
				sidesData: { side, lines: [{ number: 1, content: '' }] }
			});
		if (!this.linesDiff.find((change) => change.lhs))
			this.blocks.push(placeholderBlock(TwoWaySide.lhs));
		if (!this.linesDiff.find((change) => change.ctr))
			this.blocks.push(placeholderBlock(TwoWaySide.ctr));
		if (!this.linesDiff.find((change) => change.rhs))
			this.blocks.push(placeholderBlock(TwoWaySide.rhs));
	}

	private generateMergeConflictBlocks() {
		const blocks: DiffBlock[] = [];
		let conflictBlocks: (AddedBlock | RemovedBlock)[] = [];
		for (const [index, block] of this.blocks.entries()) {
			if (block instanceof AddedBlock || block instanceof RemovedBlock) {
				conflictBlocks.push(block);
			}

			if (block instanceof UnchangedBlock || index == this.blocks.length - 1) {
				// Must have at least >= 2 blocks to be a conflict
				if (conflictBlocks.length == 1) {
					blocks.push(conflictBlocks[0]);
					conflictBlocks = [];
				} else if (conflictBlocks.length > 1) {
					const sidesData: (AddedSideData | RemovedSideData)[] = [];
					const lhs = TwoWaySide.lhs;
					const ctr = TwoWaySide.ctr;
					const rhs = TwoWaySide.rhs;
					const placeholderSides = new Set<TwoWaySide>([lhs, ctr, rhs]);
					for (const conflictBlock of conflictBlocks) {
						const blockSides = [conflictBlock.sidesData].flat();
						for (const blockSide of blockSides) {
							let currentSide;
							if ((currentSide = sidesData.find(({ side }) => side.eq(blockSide.side)))) {
								currentSide.lines.push(...blockSide.lines);
							} else {
								sidesData.push(blockSide);
							}
						}
						if (blockSides.find(({ side }) => side.eq(TwoWaySide.lhs)))
							placeholderSides.delete(lhs);
						if (blockSides.find(({ side }) => side.eq(TwoWaySide.ctr)))
							placeholderSides.delete(ctr);
						if (blockSides.find(({ side }) => side.eq(TwoWaySide.rhs)))
							placeholderSides.delete(rhs);
					}

					const conflictBlock = new MergeConflictBlock({
						id: this.getId(),
						sidesData,
						placeholderSide: Array.from(placeholderSides)
					});

					blocks.push(conflictBlock);
					conflictBlocks = [];
				}

				if (block instanceof UnchangedBlock) {
					blocks.push(block);
				}
			}
		}
		this.blocks = blocks;
	}

	private generateModifiedBlocks() {
		const blocks: DiffBlock[] = [];
		for (const block of this.blocks) {
			if (!(block instanceof MergeConflictBlock)) {
				blocks.push(block);
				continue;
			}

			const lhsContent =
				(block.sidesData.find(({ side }) => side.eq(TwoWaySide.lhs))?.lines ?? [])
					.map((change) => change.content)
					.join('\n') + '\n';
			const ctrContent =
				(block.sidesData.find(({ side }) => side.eq(TwoWaySide.ctr))?.lines ?? [])
					.map((change) => change.content)
					.join('\n') + '\n';
			const rhsContent =
				(block.sidesData.find(({ side }) => side.eq(TwoWaySide.rhs))?.lines ?? [])
					.map((change) => change.content)
					.join('\n') + '\n';

			if (lhsContent === ctrContent) {
				const diff = diff2Sides(ctrContent, rhsContent, {
					algorithm: this.options?.lineDiffAlgorithm
				});
				const modifiedBlock = new ModifiedBlock({
					modifiedSidesData: [
						{
							side: TwoWaySide.ctr,
							lines: diff.lhs
						},
						{
							side: TwoWaySide.rhs,
							lines: diff.rhs
						}
					],
					unchangedSideData: {
						side: TwoWaySide.lhs,
						lines: block.sidesData.find(({ side }) => side.eq(TwoWaySide.lhs))?.lines ?? []
					},
					id: this.getId()
				});
				blocks.push(modifiedBlock);
				continue;
			}

			if (ctrContent === rhsContent) {
				const diff = diff2Sides(lhsContent, ctrContent, {
					algorithm: this.options?.lineDiffAlgorithm
				});
				const modifiedBlock = new ModifiedBlock({
					modifiedSidesData: [
						{
							side: TwoWaySide.lhs,
							lines: diff.lhs
						},
						{
							side: TwoWaySide.ctr,
							lines: diff.rhs
						}
					],
					unchangedSideData: {
						side: TwoWaySide.rhs,
						lines: block.sidesData.find(({ side }) => side.eq(TwoWaySide.rhs))?.lines ?? []
					},
					id: this.getId()
				});
				blocks.push(modifiedBlock);
				continue;
			}

			blocks.push(block);
		}
		this.blocks = blocks;
	}
}

/**
 * Generate two-way diff blocks.
 * @param lhs Left hand side content.
 * @param lhs Center content.
 * @param rhs Right hand side content.
 * @param options Assemble options.
 * @returns Diff blocks to use in the View component.
 */
export function assembleTwoWay(
	lhs: string,
	ctr: string,
	rhs: string,
	options?: TwoWayAssemblerOptions
) {
	return new TwoWayAssembler(options).assemble(lhs, ctr, rhs);
}
