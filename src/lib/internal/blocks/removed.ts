import { type Line, LinkedComponentsBlock } from '.';
import type { Side } from '../side';
import type { MaybeArray } from '../utils';
import { BlockComponent } from '../component';
import RemovedBlockComponent from '$lib/components/blocks/RemovedBlock.svelte';
import RemovedBlockPlaceholderComponent from '$lib/components/blocks/RemovedBlockPlaceholder.svelte';

export type RemovedSideData<SideType extends Side> = {
	side: SideType;
	lines: Line[];
};

export class RemovedBlock<SideType extends Side = Side> extends LinkedComponentsBlock<SideType> {
	public type = 'removed';
	public placeholderType = 'removed_placeholder';

	public readonly sidesData: MaybeArray<RemovedSideData<SideType>>;
	public readonly placeholderSide: MaybeArray<Side>;

	constructor(params: {
		id: string;
		sidesData: MaybeArray<RemovedSideData<SideType>>;
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
						component: RemovedBlockComponent,
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