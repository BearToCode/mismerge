import UnchangedBlockComponent from '$lib/components/blocks/UnchangedBlock.svelte';
import { BlockComponent } from '../component';
import type { Line } from '.';
import { DiffBlock } from '.';
import type { Side } from '../side';

export class UnchangedBlock<SideType extends Side = Side> extends DiffBlock<SideType> {
	public type = 'unchanged';

	public readonly lines: Line[];
	public readonly sides: SideType[];

	constructor(params: { id: string; lines: Line[]; sides: SideType[] }) {
		super(params.id);
		this.lines = params.lines;
		this.sides = params.sides;
	}

	public linesCount(): number {
		return this.lines.length;
	}

	public render() {
		const components = this.sides.map(
			(side) =>
				new BlockComponent({
					component: UnchangedBlockComponent,
					props: { lines: this.lines },
					linesCount: this.linesCount(),
					side,
					type: this.type
				})
		);
		return components;
	}
}
