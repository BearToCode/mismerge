import { LinkedComponentsBlock, type Line } from '.';
import { BlockComponent } from '../component';
import type { LineDiff } from '../line-diff';
import type { TwoWaySide } from '../side';
import ModifiedBlockComponent from '$lib/components/blocks/ModifiedBlock.svelte';
import UnchangedBlockComponent from '$lib/components/blocks/UnchangedBlock.svelte';
import { UnchangedBlock } from './unchanged';
import type { Connection } from '../connection';

export class ModifiedBlock extends LinkedComponentsBlock {
	public type = 'modified';

	public readonly modifiedSidesData: {
		side: TwoWaySide;
		lines: LineDiff[];
	}[];
	public readonly unchangedSideData: { side: TwoWaySide; lines: Line[] };

	constructor(params: {
		id: string;
		modifiedSidesData: {
			side: TwoWaySide;
			lines: LineDiff[];
		}[];
		unchangedSideData: {
			side: TwoWaySide;
			lines: Line[];
		};
	}) {
		super(params.id);
		this.modifiedSidesData = params.modifiedSidesData;
		this.unchangedSideData = params.unchangedSideData;
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
						props: { block: this, lines: sideData.lines },
						side: sideData.side,
						type: this.type
					})
			),
			new BlockComponent({
				component: UnchangedBlockComponent,
				props: { block: this, lines: this.unchangedSideData.lines },
				side: this.unchangedSideData.side,
				type: UnchangedBlock.prototype.type
			})
		];
	}
}
