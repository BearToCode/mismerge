import { type Line, LinkedComponentsBlock } from '.';
import { type Side, OneWaySide, TwoWaySide } from '../editor/side';
import type { MaybeArray } from '../utils';
import { BlockComponent } from '../editor/component';
import AddedBlockComponent from '$lib/components/blocks/AddedBlock.svelte';
import AddedBlockPlaceholderComponent from '$lib/components/blocks/AddedBlockPlaceholder.svelte';
import MergeChange from '$lib/components/actions/MergeChange.svelte';
import DeleteChange from '$lib/components/actions/DeleteChange.svelte';

export type AddedSideData<SideType extends Side> = {
	side: SideType;
	lines: Line[];
};

export class AddedBlock<SideType extends Side = Side> extends LinkedComponentsBlock<SideType> {
	public static readonly type = 'added';
	public type = AddedBlock.type;
	public placeholderType = 'added-placeholder';

	public readonly sidesData: MaybeArray<AddedSideData<SideType>>;
	public readonly placeholderSide: MaybeArray<Side>;

	constructor(params: {
		sidesData: MaybeArray<AddedSideData<SideType>>;
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
						component: AddedBlockComponent,
						blockId: this.id,
						sideAction:
							side instanceof OneWaySide
								? {
										component: MergeChange,
										props: {}
									}
								: side instanceof TwoWaySide && side.eq(TwoWaySide.ctr)
									? {
											component: DeleteChange,
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
						component: AddedBlockPlaceholderComponent,
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
