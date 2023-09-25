import { type Line, LinkedComponentsBlock } from '.';
import type { Side } from '../side';
import type { MaybeArray } from '../utils';
import { BlockComponent } from '../component';
import RemovedBlockComponent from '$lib/components/blocks/RemovedBlock.svelte';
import RemovedBlockPlaceholderComponent from '$lib/components/blocks/RemovedBlockPlaceholder.svelte';

export type RemovedSideData = {
	side: Side;
	lines: Line[];
};

export class RemovedBlock extends LinkedComponentsBlock {
	public type = 'removed';
	public placeholderType = 'removed_placeholder';

	public readonly sidesData: MaybeArray<RemovedSideData>;
	public readonly placeholderSide: MaybeArray<Side>;

	constructor(params: {
		id: string;
		sidesData: MaybeArray<RemovedSideData>;
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
						component: RemovedBlockComponent,
						props: { block: this, lines },
						side,
						type: this.type
					})
			),
			...[this.placeholderSide].flat().map(
				(side) =>
					new BlockComponent({
						component: RemovedBlockPlaceholderComponent,
						props: { block: this },
						side,
						placeholder: true,
						type: this.placeholderType
					})
			)
		];
	}
}
