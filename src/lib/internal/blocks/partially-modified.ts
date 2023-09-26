import { LinkedComponentsBlock } from '.';
import type { Side } from '../side';
import { BlockComponent } from '../component';
import PartiallyRemovedBlockComponent from '$lib/components/blocks/PartiallyRemovedBlock.svelte';
import PartiallyAddedBlockComponent from '$lib/components/blocks/PartiallyAddedBlock.svelte';
import type { LineDiff } from '../line-diff';

type PartiallyModifiedSideData<SideType extends Side> = {
	type: 'added' | 'removed';
	side: SideType;
	lines: LineDiff[];
};

export class PartiallyModifiedBlock<
	SideType extends Side = Side
> extends LinkedComponentsBlock<SideType> {
	public type = 'partially_modified';
	public addedType = 'partially_added';
	public removedType = 'partially_removed';

	public readonly sidesData: PartiallyModifiedSideData<SideType>[];

	constructor(params: { id: string; sidesData: PartiallyModifiedSideData<SideType>[] }) {
		super(params.id);
		this.sidesData = params.sidesData;
	}

	public linesCount(side: SideType): number {
		return this.sidesData.find((sideData) => sideData.side.eq(side))?.lines.length ?? 0;
	}

	public render() {
		return this.sidesData.map(({ type, side, lines }) => {
			const SvelteComponent = (function () {
				switch (type) {
					case 'added':
						return PartiallyAddedBlockComponent;
					case 'removed':
						return PartiallyRemovedBlockComponent;
				}
			})();
			return new BlockComponent({
				component: SvelteComponent,
				props: { block: this, lines },
				linesCount: this.linesCount(side),
				side,
				type: (() => {
					switch (type) {
						case 'added':
							return this.addedType;
						case 'removed':
							return this.removedType;
					}
				})()
			});
		});
	}
}
