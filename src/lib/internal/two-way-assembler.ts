import { type LineDiffAlgorithm, TwoWayDiff, type TwoWayChange } from './diff';
import { type DiffBlock, AddedBlock, RemovedBlock, UnchangedBlock, TwoWaySide } from './blocks';
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
		} else if (change.lhs || change.rhs) {
			this.assembleAddedBlock(change);
		} else {
			console.error('Invalid combination of sides in change', change);
		}
	}

	private assembleAddedBlock(change: TwoWayChange) {
		const side = change.lhs ? TwoWaySide.lhs : change.ctr ? TwoWaySide.ctr : TwoWaySide.rhs;

		const block = new AddedBlock({
			id: this.getId(),
			lines: this.intoLines(change.content, side),
			side,
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

		if (change.lhs) this.assembleUnchangedBlock(change, [TwoWaySide.lhs]);
		if (change.rhs) this.assembleUnchangedBlock(change, [TwoWaySide.rhs]);

		const block = new RemovedBlock({
			id: this.getId(),
			lines: this.intoLines(change.content, side),
			side,
			placeholderSide: side.adjacentSides().filter((side) => {
				if (side.eq(TwoWaySide.lhs)) return !change.lhs;
				if (side.eq(TwoWaySide.ctr)) return !change.ctr;
				if (side.eq(TwoWaySide.rhs)) return !change.rhs;
			})
		});

		this.blocks.push(block);
	}

	private assembleUnchangedBlock(
		change: TwoWayChange,
		sides: TwoWaySide[] = [TwoWaySide.lhs, TwoWaySide.ctr, TwoWaySide.rhs]
	) {
		const block = new UnchangedBlock(
			this.getId(),
			sides.map((side) => ({ side, lines: this.intoLines(change.content, side) }))
		);
		this.blocks.push(block);
	}

	private intoLines(content: string, side: TwoWaySide) {
		const lines = this.removeEndOfLine(content, side).split('\n');
		return lines.map((line) => ({
			content: line,
			number: side.eq(TwoWaySide.lhs)
				? this.getLhsLineNumber()
				: side.eq(TwoWaySide.ctr)
				? this.getCtrLineNumber()
				: this.getRhsLineNumber()
		}));
	}

	private removeEndOfLine(content: string, side: TwoWaySide) {
		const nextSideChange = this.linesDiff.find(
			(change) =>
				(side.eq(TwoWaySide.lhs) && change.lhs) ||
				(side.eq(TwoWaySide.ctr) && change.ctr) ||
				(side.eq(TwoWaySide.rhs) && change.rhs)
		);
		if (!nextSideChange) return content;
		return content.endsWith('\n') ? content.slice(0, -1) : content;
	}

	private addPlaceholderBlocks() {
		const placeholderBlock = (side: TwoWaySide) =>
			new UnchangedBlock(this.getId(), { side, lines: [{ number: 1, content: '' }] });
		if (!this.linesDiff.find((change) => change.lhs))
			this.blocks.push(placeholderBlock(TwoWaySide.lhs));
		if (!this.linesDiff.find((change) => change.ctr))
			this.blocks.push(placeholderBlock(TwoWaySide.ctr));
		if (!this.linesDiff.find((change) => change.rhs))
			this.blocks.push(placeholderBlock(TwoWaySide.rhs));
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
