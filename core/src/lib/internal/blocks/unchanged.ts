import UnchangedBlockComponent from '$lib/components/blocks/UnchangedBlock.svelte';
import { BlockComponent } from '../editor/component';
import type { Line } from '.';
import { DiffBlock } from '.';
import type { Side } from '../editor/side';
import type { MaybeArray } from '../utils';

export type UnchangedSideData<SideType extends Side> = {
	side: SideType;
	lines: Line[];
};

export class UnchangedBlock<SideType extends Side = Side> extends DiffBlock<SideType> {
	public static readonly type = 'unchanged';
	public type = UnchangedBlock.type;

	public readonly sidesData: MaybeArray<UnchangedSideData<SideType>>;

	constructor(params: { sidesData: MaybeArray<UnchangedSideData<SideType>> }) {
		super();
		this.sidesData = params.sidesData;
	}

	public linesCount(side: SideType): number {
		return [this.sidesData].flat().find((sideData) => sideData.side.eq(side))?.lines.length ?? 0;
	}

	public render() {
		const components = [this.sidesData].flat().map(
			({ side, lines }) =>
				new BlockComponent({
					component: UnchangedBlockComponent,
					blockId: this.id,
					props: { lines },
					linesCount: this.linesCount(side),
					side,
					type: this.type
				})
		);
		return components;
	}
}
