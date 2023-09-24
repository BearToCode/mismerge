import { type Line, LinkedComponentsBlock } from '.';
import type { Side } from '../side';
import type { MaybeArray } from '../utils';
import { BlockComponent } from '../component';
import AddedBlockComponent from '$lib/components/blocks/AddedBlock.svelte';
import AddedBlockPlaceholderComponent from '$lib/components/blocks/AddedBlockPlaceholder.svelte';

type AddedSideData = {
	side: Side;
	lines: Line[];
};

export class AddedBlock extends LinkedComponentsBlock {
	public type = 'added';
	public placeholderType = 'added_placeholder';

	public readonly sidesData: MaybeArray<AddedSideData>;
	public readonly placeholderSide: MaybeArray<Side>;
	public readonly unchangedSide?: Side;

	constructor(params: {
		id: string;
		sidesData: MaybeArray<AddedSideData>;
		placeholderSide: MaybeArray<Side>;
	}) {
		super(params.id);
		this.sidesData = params.sidesData;
		this.placeholderSide = params.placeholderSide;
	}

	public render() {
		return [
			...[this.sidesData].flat().map(
				({ side, lines }) =>
					new BlockComponent({
						component: AddedBlockComponent,
						props: { block: this, lines },
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
						placeholder: true,
						type: this.placeholderType
					})
			)
		];
	}
}
