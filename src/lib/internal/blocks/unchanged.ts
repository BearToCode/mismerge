import UnchangedBlockComponent from '$lib/components/blocks/UnchangedBlock.svelte';
import { BlockComponent } from '../component';
import type { MaybeArray } from '../utils';
import type { Side } from '../side';
import type { Line } from '.';
import { DiffBlock } from '.';

type UnchangedSideData = {
	side: Side;
	lines: Line[];
};

export class UnchangedBlock extends DiffBlock {
	public type = 'unchanged';

	public readonly sidesData: MaybeArray<UnchangedSideData>;

	constructor(params: { id: string; sidesData: MaybeArray<UnchangedSideData> }) {
		super(params.id);
		this.sidesData = params.sidesData;
	}

	public render() {
		const components = [this.sidesData].flat().map(
			({ side, lines }) =>
				new BlockComponent({
					component: UnchangedBlockComponent,
					props: { lines },
					side,
					type: this.type
				})
		);
		return components;
	}
}
