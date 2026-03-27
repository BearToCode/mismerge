import { LinkedComponentsBlock, type Line } from '.';
import { BlockComponent } from '../editor/component';
import type { LineDiff } from '../diff/line-diff';
import { Side, TwoWaySide } from '../editor/side';
import ModifiedBlockComponent from '$lib/components/blocks/ModifiedBlock.svelte';
import UnchangedBlockComponent from '$lib/components/blocks/UnchangedBlock.svelte';
import { UnchangedBlock } from './unchanged';
import type { Connection } from '../editor/connection';
import MergeChange from '$lib/components/actions/MergeChange.svelte';
import DeleteChange from '$lib/components/actions/DeleteChange.svelte';
import { endsWithSequence, startsWithSequence } from '$lib/internal/utils';

export class ModifiedBlock<SideType extends Side> extends LinkedComponentsBlock<SideType> {
	public static readonly type = 'modified';
	public type = ModifiedBlock.type;

	public readonly modifiedSidesData: {
		side: SideType;
		lines: LineDiff[];
	}[];
	public readonly unchangedSideData: { side: SideType; lines: Line[] } | undefined;

	constructor(params: {
		modifiedSidesData: {
			side: SideType;
			lines: LineDiff[];
		}[];
		unchangedSideData?: {
			side: SideType;
			lines: Line[];
		};
	}) {
		super();
		this.modifiedSidesData = params.modifiedSidesData;
		this.unchangedSideData = params.unchangedSideData;
	}

	public linesCount(side: SideType): number {
		return (
			[...this.modifiedSidesData, this.unchangedSideData ?? []]
				.flat()
				.find((sideData) => sideData.side.eq(side))?.lines.length ?? 0
		);
	}

	public connections(components: BlockComponent[]): Connection[] {
		const filteredComponents = components.filter(
			(component) => component.type !== UnchangedBlock.prototype.type
		);

		return LinkedComponentsBlock.prototype.connections.call(this, filteredComponents);
	}

	private getLines(side: Side): string[] {
		return (
			[...this.modifiedSidesData, ...(this.unchangedSideData ? [this.unchangedSideData] : [])]
				.find((sideData) => sideData.side.eq(side))?.lines ?? []
		).map((line) =>
			('parts' in line ? line.parts.map((part) => part.content).join('') : line.content)
				.replaceAll('\r', '')
				.replaceAll('\n', '')
		);
	}

	private hasMergedIntoCenter(side: SideType) {
		if (!(side instanceof TwoWaySide) || side.eq(TwoWaySide.ctr)) return false;

		const sourceLines = this.getLines(side);
		const centerLines = this.getLines(TwoWaySide.ctr);

		if (sourceLines.length === 0 || centerLines.length === 0) return false;

		if (side.eq(TwoWaySide.lhs)) {
			return startsWithSequence(centerLines, sourceLines);
		}

		return endsWithSequence(centerLines, sourceLines);
	}

	private centerIncludesMergedChange() {
		const candidateSides = this.modifiedSidesData
			.map(({ side }) => side)
			.concat(this.unchangedSideData ? [this.unchangedSideData.side] : []);

		return candidateSides.some(
			(side) => side instanceof TwoWaySide && !side.eq(TwoWaySide.ctr) && this.hasMergedIntoCenter(side)
		);
	}

	public render() {
		// Return two modified components for the sides where the line was modified
		// and one unchanged component for the side where the line wasn't.
		const modifiedComponents = this.modifiedSidesData.map(
			({ side, lines }) => {
				const acceptedInCenter =
					side instanceof TwoWaySide && side.eq(TwoWaySide.ctr) && this.centerIncludesMergedChange();

				return new BlockComponent({
					component: ModifiedBlockComponent,
					blockId: this.id,
					props: {
						block: this,
						lines,
						acceptedInCenter
					},
					linesCount: this.linesCount(side),
					side: side,
					type: this.type,
					sideAction:
						side instanceof TwoWaySide && side.eq(TwoWaySide.ctr)
							? undefined
							: {
									component: this.hasMergedIntoCenter(side) ? DeleteChange : MergeChange,
									props: {}
								}
				});
			}
		);
		if (!this.unchangedSideData) return modifiedComponents;
		return Array.prototype.concat(modifiedComponents, [
			new BlockComponent({
				component: UnchangedBlockComponent,
				blockId: this.id,
				props: { lines: this.unchangedSideData.lines },
				linesCount: this.linesCount(this.unchangedSideData.side),
				side: this.unchangedSideData.side,
				type: UnchangedBlock.type,
				sideAction: this.hasMergedIntoCenter(this.unchangedSideData.side)
					? {
						component: DeleteChange,
						props: {}
					}
					: undefined
			})
		]);
	}
}
