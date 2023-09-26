import type { BlockComponent } from '../component';
import type { MaybeArray } from '../utils';
import type { Connection } from '../connection';
import type { Side } from '../side';

export type Line = {
	content: string;
};

export abstract class DiffBlock<SideType extends Side> {
	public readonly id: string;
	public abstract type: string;

	constructor(id: string) {
		this.id = id;
	}

	public abstract render(): MaybeArray<BlockComponent>;
	public abstract linesCount(side: SideType): number;
}

export abstract class LinkedComponentsBlock<SideType extends Side> extends DiffBlock<SideType> {
	public connections(components: BlockComponent[]): Connection[] {
		const connections: Connection[] = [];
		for (const [leftIndex, leftComponent] of components.entries()) {
			for (const [rightIndex, rightComponent] of components.entries()) {
				if (leftIndex == rightIndex) continue;
				if (!rightComponent.side.isOnTheRightOf(leftComponent.side)) continue;
				connections.push({
					from: leftComponent,
					to: rightComponent
				});
			}
		}
		return connections;
	}
}
