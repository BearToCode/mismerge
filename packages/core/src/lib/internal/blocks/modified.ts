import { LinkedComponentsBlock, type Line } from '.';
import { BlockComponent } from '../editor/component';
import type { LineDiff } from '../diff/line-diff';
import { Side, TwoWaySide } from '../editor/side';
import ModifiedBlockComponent from '$lib/components/blocks/ModifiedBlock.svelte';
import UnchangedBlockComponent from '$lib/components/blocks/UnchangedBlock.svelte';
import { UnchangedBlock } from './unchanged';
import type { Connection } from '../editor/connection';
import MergeChange from '$lib/components/actions/MergeChange.svelte';

export class ModifiedBlock<SideType extends Side> extends LinkedComponentsBlock<SideType> {
	public static readonly type = 'modified';
	public type = ModifiedBlock.type;

	public readonly modifiedSidesData: {
		side: SideType;
		lines: LineDiff[];
	}[];
	public readonly unchangedSideData: { side: SideType; lines: Line[] } | undefined;

	constructor(params: {
		modifiedSidesData: {
			side: SideType;
			lines: LineDiff[];
		}[];
		unchangedSideData?: {
			side: SideType;
			lines: Line[];
		};
	}) {
		super();
		this.modifiedSidesData = params.modifiedSidesData;
		this.unchangedSideData = params.unchangedSideData;
	}

	public linesCount(side: SideType): number {
		return (
			[...this.modifiedSidesData, this.unchangedSideData ?? []]
				.flat()
				.find((sideData) => sideData.side.eq(side))?.lines.length ?? 0
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
		const modifiedComponents = this.modifiedSidesData.map(
			({ side, lines }) =>
				new BlockComponent({
					component: ModifiedBlockComponent,
					blockId: this.id,
					props: { block: this, lines },
					linesCount: this.linesCount(side),
					side: side,
					type: this.type,
					sideAction:
						side instanceof TwoWaySide && side.eq(TwoWaySide.ctr)
							? undefined
							: {
									component: MergeChange,
									props: {}
							  }
				})
		);
		if (!this.unchangedSideData) return modifiedComponents;
		return Array.prototype.concat(modifiedComponents, [
			new BlockComponent({
				component: UnchangedBlockComponent,
				blockId: this.id,
				props: { lines: this.unchangedSideData.lines },
				linesCount: this.linesCount(this.unchangedSideData.side),
				side: this.unchangedSideData.side,
				type: UnchangedBlock.prototype.type
			})
		]);
	}
}
