import type { DiffBlock } from '../blocks';
import type { Side } from '../editor/side';
import { cyrb53 } from './hash';

export class BlocksHashTable<SideType extends Side> {
	private _blocks: Map<number, DiffBlock<SideType>> = new Map();
	private _oldBlocks: Map<number, DiffBlock<SideType>> = new Map();

	public startGeneration() {
		this._oldBlocks = new Map(this._blocks);
		this._blocks = new Map();
	}

	public endGeneration() {
		this._oldBlocks = new Map();
	}

	private hashObject(obj: Record<string, unknown>): number {
		return cyrb53(JSON.stringify(obj));
	}

	public new<Block extends DiffBlock<SideType>, Params extends Record<string, unknown>>(
		BlockConstructor: new (data: Params) => Block,
		params: Params
	): Block {
		// Check if there is also a block with the same hash in the new blocks map.
		// In that case, add a property to the data to generate a different hash.
		// This has some limitations, but should work in most cases.
		// It may cause some issues when the are a lot of blocks with the same data
		// and one is removed, but it is not a big deal.
		let $gen = 0;
		let hash: number;
		const paramsObj = params as Record<string, unknown>;
		do {
			paramsObj['$name'] = BlockConstructor.name;
			paramsObj['$gen'] = $gen++;
			hash = this.hashObject(paramsObj);
		} while (this._blocks.get(hash));

		// Retrieve an already stored value, if any.
		const stored = this._oldBlocks.get(hash);

		if (stored) {
			if (stored instanceof BlockConstructor) {
				this._blocks.set(hash, stored);
				return stored as Block;
			} else {
				throw new Error(`Block with hash ${hash} is not an instance of ${BlockConstructor.name}`);
			}
		} else {
			const newBlock = new BlockConstructor(params);
			this._blocks.set(hash, newBlock);
			return newBlock;
		}
	}
}
