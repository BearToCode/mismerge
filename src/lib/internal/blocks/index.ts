import type { BlockComponent } from '../editor/component';
import type { MaybeArray } from '../utils';
import type { Connection } from '../editor/connection';
import type { Side } from '../editor/side';
import { nanoid } from 'nanoid';

export type Line = {
	content: string;
};

export abstract class DiffBlock<SideType extends Side> {
	public readonly id = '$' + nanoid(6);
	public abstract type: string;
	/**
	 * This property is used to differentiate blocks with the same
	 * data but that lay in different places of the editor. It is
	 * handled by the BlocksHashTable class.
	 */
	public $gen = 0;

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
