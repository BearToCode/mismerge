import { LinkedComponentsBlock, type Line } from '.';
import { BlockComponent } from '../editor/component';
import type { LineDiff } from '../diff/line-diff';
import type { TwoWaySide } from '../editor/side';
import ModifiedBlockComponent from '$lib/components/blocks/ModifiedBlock.svelte';
import UnchangedBlockComponent from '$lib/components/blocks/UnchangedBlock.svelte';
import { UnchangedBlock } from './unchanged';
import type { Connection } from '../editor/connection';

export class ModifiedBlock extends LinkedComponentsBlock<TwoWaySide> {
	public static readonly type = 'modified';
	public type = ModifiedBlock.type;

	public readonly modifiedSidesData: {
		side: TwoWaySide;
		lines: LineDiff[];
	}[];
	public readonly unchangedSideData: { side: TwoWaySide; lines: Line[] };

	constructor(params: {
		modifiedSidesData: {
			side: TwoWaySide;
			lines: LineDiff[];
		}[];
		unchangedSideData: {
			side: TwoWaySide;
			lines: Line[];
		};
	}) {
		super();
		this.modifiedSidesData = params.modifiedSidesData;
		this.unchangedSideData = params.unchangedSideData;
	}

	public linesCount(side: TwoWaySide): number {
		return (
			[...this.modifiedSidesData, this.unchangedSideData].find((sideData) => sideData.side.eq(side))
				?.lines.length ?? 0
		);
	}

	public connections(components: BlockComponent<Record<string, unknown>>[]): Connection[] {
		const filteredComponents = components.filter(
			(component) => component.type !== UnchangedBlock.prototype.type
		);

		return LinkedComponentsBlock.prototype.connections.call(this, filteredComponents);
	}

	public render() {
		// Return two modified components for the sides where the line was modified
		// and one unchanged component for the side where the line wasn't.
		return [
			...this.modifiedSidesData.map(
				(sideData) =>
					new BlockComponent({
						component: ModifiedBlockComponent,
						blockId: this.id,
						props: { block: this, lines: sideData.lines },
						linesCount: this.linesCount(sideData.side),
						side: sideData.side,
						type: this.type,
						mergeActions: true
					})
			),
			new BlockComponent({
				component: UnchangedBlockComponent,
				blockId: this.id,
				props: { lines: this.unchangedSideData.lines },
				linesCount: this.linesCount(this.unchangedSideData.side),
				side: this.unchangedSideData.side,
				type: UnchangedBlock.prototype.type
			})
		];
	}
}
