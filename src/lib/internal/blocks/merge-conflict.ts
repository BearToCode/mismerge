import { type Line, LinkedComponentsBlock } from '.';
import type { Side } from '../side';
import type { MaybeArray } from '../utils';
import { BlockComponent } from '../component';
import MergeConflictBlockComponent from '$lib/components/blocks/MergeConflictBlock.svelte';
import MergeConflictPlaceholderComponent from '$lib/components/blocks/MergeConflictPlaceholder.svelte';

type MergeConflictSideData = {
	side: Side;
	lines: Line[];
};

export class MergeConflictBlock extends LinkedComponentsBlock {
	public type = 'merge_conflict';
	public placeholderType = 'merge_conflict_placeholder';

	public readonly sidesData: MergeConflictSideData[];
	public readonly placeholderSide: MaybeArray<Side>;

	constructor(params: {
		id: string;
		sidesData: MergeConflictSideData[];
		placeholderSide?: MaybeArray<Side>;
	}) {
		super(params.id);
		this.sidesData = params.sidesData;
		this.placeholderSide = params.placeholderSide ?? [];
	}

	public render() {
		return [
			...this.sidesData.map(({ side, lines }) => {
				return new BlockComponent({
					component: MergeConflictBlockComponent,
					props: { block: this, lines },
					side,
					type: this.type
				});
			}),
			...[this.placeholderSide].flat().map(
				(side) =>
					new BlockComponent({
						component: MergeConflictPlaceholderComponent,
						props: { block: this },
						side,
						placeholder: true,
						type: this.placeholderType
					})
			)
		];
	}
}
