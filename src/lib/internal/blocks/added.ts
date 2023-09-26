import { type Line, LinkedComponentsBlock } from '.';
import type { Side } from '../side';
import type { MaybeArray } from '../utils';
import { BlockComponent } from '../component';
import AddedBlockComponent from '$lib/components/blocks/AddedBlock.svelte';
import AddedBlockPlaceholderComponent from '$lib/components/blocks/AddedBlockPlaceholder.svelte';

export type AddedSideData<SideType extends Side> = {
	side: SideType;
	lines: Line[];
};

export class AddedBlock<SideType extends Side = Side> extends LinkedComponentsBlock<SideType> {
	public type = 'added';
	public placeholderType = 'added_placeholder';

	public readonly sidesData: MaybeArray<AddedSideData<SideType>>;
	public readonly placeholderSide: MaybeArray<Side>;
	public readonly unchangedSide?: Side;

	constructor(params: {
		id: string;
		sidesData: MaybeArray<AddedSideData<SideType>>;
		placeholderSide: MaybeArray<Side>;
	}) {
		super(params.id);
		this.sidesData = params.sidesData;
		this.placeholderSide = params.placeholderSide;
	}

	public linesCount(side: SideType): number {
		return [this.sidesData].flat().find((sideData) => sideData.side.eq(side))?.lines.length ?? 0;
	}

	public render() {
		return [
			...[this.sidesData].flat().map(
				({ side, lines }) =>
					new BlockComponent({
						component: AddedBlockComponent,
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
						props: { block: this },
						side,
						linesCount: 0,
						placeholder: true,
						type: this.placeholderType
					})
			)
		];
	}
}
