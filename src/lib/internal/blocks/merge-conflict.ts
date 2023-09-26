import { type Line, LinkedComponentsBlock } from '.';
import type { Side, TwoWaySide } from '../side';
import type { MaybeArray } from '../utils';
import { BlockComponent } from '../component';
import MergeConflictBlockComponent from '$lib/components/blocks/MergeConflictBlock.svelte';
import MergeConflictPlaceholderComponent from '$lib/components/blocks/MergeConflictPlaceholder.svelte';

type MergeConflictSideData<SideType extends Side> = {
	side: SideType;
	lines: Line[];
};

export class MergeConflictBlock extends LinkedComponentsBlock<TwoWaySide> {
	public type = 'merge_conflict';
	public placeholderType = 'merge_conflict_placeholder';

	public readonly sidesData: MergeConflictSideData<TwoWaySide>[];
	public readonly placeholderSide: MaybeArray<Side>;

	constructor(params: {
		id: string;
		sidesData: MergeConflictSideData<TwoWaySide>[];
		placeholderSide?: MaybeArray<Side>;
	}) {
		super(params.id);
		this.sidesData = params.sidesData;
		this.placeholderSide = params.placeholderSide ?? [];
	}

	public linesCount(side: TwoWaySide): number {
		return [...this.sidesData].find((sideData) => sideData.side.eq(side))?.lines.length ?? 0;
	}

	public render() {
		return [
			...this.sidesData.map(({ side, lines }) => {
				return new BlockComponent({
					component: MergeConflictBlockComponent,
					props: { block: this, lines },
					linesCount: this.linesCount(side),
					side,
					type: this.type
				});
			}),
			...[this.placeholderSide].flat().map(
				(side) =>
					new BlockComponent({
						component: MergeConflictPlaceholderComponent,
						props: { block: this },
						linesCount: 0,
						side,
						placeholder: true,
						type: this.placeholderType
					})
			)
		];
	}
}
