import { type LineDiffAlgorithm, threeWayDiff, type ThreeWayChange } from './diff';
import { type DiffBlock, AddedBlock, RemovedBlock, UnchangedBlock, ThreeWaySide } from './blocks';
import { nanoid } from 'nanoid';

export interface ThreeWayAssemblerOptions {
	lineDiffAlgorithm?: LineDiffAlgorithm;
}

class ThreeWayAssembler {
	constructor(private readonly options?: ThreeWayAssemblerOptions) {}

	public assemble(lhs: string, ctr: string, rhs: string): DiffBlock[] {
		this.lhs = lhs;
		this.ctr = ctr;
		this.rhs = rhs;

		this.blocks = [];

		this.lhsLineNumber = 1;
		this.ctrLineNumber = 1;
		this.rhsLineNumber = 1;

		this.linesDiff = threeWayDiff(this.lhs, this.ctr, this.rhs);

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

	private linesDiff: ThreeWayChange[] = [];
	private currentChange: ThreeWayChange | undefined;

	private getId = () => nanoid(6);
	private getLhsLineNumber = () => this.lhsLineNumber++;
	private getCtrLineNumber = () => this.ctrLineNumber++;
	private getRhsLineNumber = () => this.rhsLineNumber++;

	private advance() {
		return (this.currentChange = this.linesDiff.shift());
	}

	private assembleBlock(change: ThreeWayChange) {
		if (change.lhs && change.ctr && change.rhs) {
			this.assembleUnchangedBlock(change);
		} else if (change.ctr) {
			this.assembleAddedBlock(change);
		} else if (change.lhs || change.rhs) {
			this.assembleRemovedBlock(change);
		} else {
			console.error('Invalid combination of sides in change', change);
		}
	}

	private assembleAddedBlock(change: ThreeWayChange) {
		const side = change.lhs ? ThreeWaySide.lhs : change.ctr ? ThreeWaySide.ctr : ThreeWaySide.rhs;

		const block = new AddedBlock(
			this.getId(),
			this.intoLines(change.content, side),
			side,
			side.adjacentSides().filter((side) => {
				if (side.eq(ThreeWaySide.lhs)) return !change.lhs;
				if (side.eq(ThreeWaySide.ctr)) return !change.ctr;
				if (side.eq(ThreeWaySide.rhs)) return !change.rhs;
			})
		);

		this.blocks.push(block);
	}

	private assembleRemovedBlock(change: ThreeWayChange) {
		const side = change.lhs ? ThreeWaySide.lhs : change.ctr ? ThreeWaySide.ctr : ThreeWaySide.rhs;

		const block = new RemovedBlock(
			this.getId(),
			this.intoLines(change.content, side),
			side,
			side.adjacentSides().filter((side) => {
				if (side.eq(ThreeWaySide.lhs)) return !change.lhs;
				if (side.eq(ThreeWaySide.ctr)) return !change.ctr;
				if (side.eq(ThreeWaySide.rhs)) return !change.rhs;
			})
		);

		this.blocks.push(block);
	}

	private assembleUnchangedBlock(change: ThreeWayChange) {
		const block = new UnchangedBlock(
			this.getId(),
			(['lhs', 'ctr', 'rhs'] as const)
				.map((str) => new ThreeWaySide(str))
				.map((side) => ({
					side,
					lines: this.intoLines(change.content, side)
				}))
		);
		this.blocks.push(block);
	}

	private intoLines(content: string, side: ThreeWaySide) {
		const lines = this.removeEndOfLine(content, side).split('\n');
		return lines.map((line) => ({
			content: line,
			number: side.eq(ThreeWaySide.lhs)
				? this.getLhsLineNumber()
				: side.eq(ThreeWaySide.ctr)
				? this.getCtrLineNumber()
				: this.getRhsLineNumber()
		}));
	}

	private removeEndOfLine(content: string, side: ThreeWaySide) {
		const nextSideChange = this.linesDiff.find(
			(change) =>
				(side.eq(ThreeWaySide.lhs) && change.lhs) ||
				(side.eq(ThreeWaySide.ctr) && change.ctr) ||
				(side.eq(ThreeWaySide.rhs) && change.rhs)
		);
		if (!nextSideChange) return content;
		return content.endsWith('\n') ? content.slice(0, -1) : content;
	}

	private addPlaceholderBlocks() {
		const placeholderBlock = (side: ThreeWaySide) =>
			new UnchangedBlock(this.getId(), { side, lines: [{ number: 1, content: '' }] });
		if (!this.linesDiff.find((change) => change.lhs))
			this.blocks.push(placeholderBlock(ThreeWaySide.lhs));
		if (!this.linesDiff.find((change) => change.ctr))
			this.blocks.push(placeholderBlock(ThreeWaySide.ctr));
		if (!this.linesDiff.find((change) => change.rhs))
			this.blocks.push(placeholderBlock(ThreeWaySide.rhs));
	}
}

/**
 * Generate three-way diff blocks.
 * @param lhs Left hand side content.
 * @param lhs Center content.
 * @param rhs Right hand side content.
 * @param options Assemble options.
 * @returns Diff blocks to use in the View component.
 */
export function assembleThreeWay(
	lhs: string,
	ctr: string,
	rhs: string,
	options?: ThreeWayAssemblerOptions
) {
	return new ThreeWayAssembler(options).assemble(lhs, ctr, rhs);
}
