import { LinkedComponentsBlock } from '.';
import type { Side } from '../side';
import { BlockComponent } from '../component';
import PartiallyRemovedBlockComponent from '$lib/components/blocks/PartiallyRemovedBlock.svelte';
import PartiallyAddedBlockComponent from '$lib/components/blocks/PartiallyAddedBlock.svelte';
import type { LineDiff } from '../line-diff';

type PartiallyModifiedSideData = {
	type: 'added' | 'removed';
	side: Side;
	lines: LineDiff[];
};

export class PartiallyModifiedBlock extends LinkedComponentsBlock {
	public type = 'partially_modified';
	public addedType = 'partially_added';
	public removedType = 'partially_removed';

	public readonly sidesData: PartiallyModifiedSideData[];

	constructor(params: { id: string; sidesData: PartiallyModifiedSideData[] }) {
		super(params.id);
		this.sidesData = params.sidesData;
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
