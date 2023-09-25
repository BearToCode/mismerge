import type { BlockComponent } from '../component';
import type { MaybeArray } from '../utils';
import type { Connection } from '../connection';

export type Line = {
	number: number;
	content: string;
};

export abstract class DiffBlock {
	public readonly id: string;
	public abstract type: string;

	constructor(id: string) {
		this.id = id;
	}

	public abstract render(): MaybeArray<BlockComponent>;
}

export abstract class LinkedComponentsBlock extends DiffBlock {
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
