import { type Line, LinkedComponentsBlock } from '.';
import { type Side, OneWaySide } from '../editor/side';
import type { MaybeArray } from '../utils';
import { BlockComponent } from '../editor/component';
import RemovedBlockComponent from '$lib/components/blocks/RemovedBlock.svelte';
import RemovedBlockPlaceholderComponent from '$lib/components/blocks/RemovedBlockPlaceholder.svelte';
import MergeChange from '$lib/components/actions/MergeChange.svelte';

export type RemovedSideData<SideType extends Side> = {
	side: SideType;
	lines: Line[];
};

export class RemovedBlock<SideType extends Side = Side> extends LinkedComponentsBlock<SideType> {
	public static readonly type = 'removed';
	public type = RemovedBlock.type;
	public placeholderType = 'removed-placeholder';

	public readonly sidesData: MaybeArray<RemovedSideData<SideType>>;
	public readonly placeholderSide: MaybeArray<Side>;

	constructor(params: {
		sidesData: MaybeArray<RemovedSideData<SideType>>;
		placeholderSide: MaybeArray<Side>;
	}) {
		super();
		this.sidesData = params.sidesData;
		this.placeholderSide = params.placeholderSide;
	}

	public linesCount(side: SideType): number {
		return [this.sidesData].flat().find((sideData) => sideData.side.eq(side))?.lines.length ?? 0;
	}

	public render(): BlockComponent[] {
		return [
			...[this.sidesData].flat().map(
				({ side, lines }) =>
					new BlockComponent({
						component: RemovedBlockComponent,
						blockId: this.id,
						sideAction:
							side instanceof OneWaySide
								? {
										component: MergeChange,
										props: {}
								  }
								: undefined,
						props: { block: this, lines },
						linesCount: this.linesCount(side),
						side,
						type: this.type
					})
			),
			...[this.placeholderSide].flat().map(
				(side) =>
					new BlockComponent({
						component: RemovedBlockPlaceholderComponent,
						blockId: this.id,
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
