import type { MaybeArray } from './utils';
import type { Change } from 'diff';
import { BlockComponent } from './component';
import UnchangedBlockComponent from '$lib/components/blocks/UnchangedBlock.svelte';
import AddedBlockComponent from '$lib/components/blocks/AddedBlock.svelte';
import AddedBlockPlaceholderComponent from '$lib/components/blocks/AddedBlockPlaceholder.svelte';
import RemovedBlockComponent from '$lib/components/blocks/RemovedBlock.svelte';
import RemovedBlockPlaceholderComponent from '$lib/components/blocks/RemovedBlockPlaceholder.svelte';
import PartiallyRemovedBlockComponent from '$lib/components/blocks/PartiallyRemovedBlock.svelte';
import PartiallyAddedBlockComponent from '$lib/components/blocks/PartiallyAddedBlock.svelte';
import MergeModifiedComponent from '$lib/components/blocks/MergeModified.svelte';
import type { Connection } from './connection';

export abstract class Side {
	public abstract eq(side: typeof this): boolean;
	public abstract isOnTheRightOf(side: typeof this): boolean;
	public abstract isOnTheLeftOf(side: typeof this): boolean;
}

export class OneWaySide extends Side {
	public static get lhs(): OneWaySide {
		return new OneWaySide('lhs');
	}
	public static get rhs(): OneWaySide {
		return new OneWaySide('rhs');
	}

	constructor(private readonly side: 'lhs' | 'rhs') {
		super();
	}

	public eq(side: OneWaySide): boolean {
		return side.side == this.side;
	}

	public opposite() {
		if (this.side == 'lhs') return OneWaySide.rhs;
		return OneWaySide.lhs;
	}

	public isOnTheRightOf(side: this): boolean {
		return side.eq(OneWaySide.rhs) && this.eq(OneWaySide.lhs);
	}

	public isOnTheLeftOf(side: this): boolean {
		return side.eq(OneWaySide.lhs) && this.eq(OneWaySide.rhs);
	}
}

export class TwoWaySide extends Side {
	public static get lhs(): TwoWaySide {
		return new TwoWaySide('lhs');
	}
	public static get ctr(): TwoWaySide {
		return new TwoWaySide('ctr');
	}
	public static get rhs(): TwoWaySide {
		return new TwoWaySide('rhs');
	}

	constructor(private readonly side: 'lhs' | 'ctr' | 'rhs') {
		super();
	}

	public eq(side: TwoWaySide): boolean {
		return this.side == side.side;
	}

	public adjacentSides(): TwoWaySide[] {
		switch (this.side) {
			case 'lhs':
				return [new TwoWaySide('ctr')];
			case 'ctr':
				return [new TwoWaySide('lhs'), new TwoWaySide('rhs')];
			case 'rhs':
				return [new TwoWaySide('ctr')];
		}
	}

	public isOnTheRightOf(side: this): boolean {
		return (
			(this.eq(TwoWaySide.rhs) && side.eq(TwoWaySide.ctr)) ||
			(this.eq(TwoWaySide.ctr) && side.eq(TwoWaySide.lhs))
		);
	}

	public isOnTheLeftOf(side: this): boolean {
		return (
			(this.eq(TwoWaySide.lhs) && side.eq(TwoWaySide.ctr)) ||
			(this.eq(TwoWaySide.ctr) && side.eq(TwoWaySide.rhs))
		);
	}
}

export type Direction = 'left-to-right' | 'right-to-left';

export type Line = {
	number: number;
	content: string;
};

export type LineDiff = {
	diff: Change[];
	number: number;
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

type UnchangedSideData = {
	side: Side;
	lines: Line[];
};

export class UnchangedBlock extends DiffBlock {
	public type = 'unchanged';

	public readonly sidesData: MaybeArray<UnchangedSideData>;

	constructor(id: string, sidesData: MaybeArray<UnchangedSideData>) {
		super(id);
		this.sidesData = sidesData;
	}

	public render() {
		const components = [this.sidesData].flat().map(
			({ side, lines }) =>
				new BlockComponent({
					component: UnchangedBlockComponent,
					props: { block: this, lines },
					side,
					type: this.type
				})
		);
		return components;
	}
}

export class AddedBlock extends LinkedComponentsBlock {
	public type = 'added';
	public placeholderType = 'added_placeholder';

	public readonly lines: Line[];
	public readonly side: MaybeArray<Side>;
	public readonly placeholderSide: MaybeArray<Side>;
	public readonly unchangedSide?: Side;

	constructor(params: {
		id: string;
		lines: Line[];
		side: Side;
		placeholderSide: MaybeArray<Side>;
		unchangedSide?: Side;
	}) {
		super(params.id);
		this.lines = params.lines;
		this.side = params.side;
		this.placeholderSide = params.placeholderSide;
	}

	public render() {
		return [
			...[this.side].flat().map(
				(side) =>
					new BlockComponent({
						component: AddedBlockComponent,
						props: { block: this },
						side,
						type: this.type
					})
			),
			...[this.placeholderSide].flat().map(
				(side) =>
					new BlockComponent({
						component: AddedBlockPlaceholderComponent,
						props: { block: this },
						side,
						placeholder: true,
						type: this.placeholderType
					})
			)
		];
	}
}

export class RemovedBlock extends LinkedComponentsBlock {
	public type = 'removed';
	public placeholderType = 'removed_placeholder';

	public readonly lines: Line[];
	public readonly side: MaybeArray<Side>;
	public readonly placeholderSide: MaybeArray<Side>;

	constructor(params: {
		id: string;
		lines: Line[];
		side: MaybeArray<Side>;
		placeholderSide: MaybeArray<Side>;
	}) {
		super(params.id);
		this.lines = params.lines;
		this.side = params.side;
		this.placeholderSide = params.placeholderSide;
	}

	public render() {
		return [
			...[this.side].flat().map(
				(side) =>
					new BlockComponent({
						component: RemovedBlockComponent,
						props: { block: this },
						side,
						type: this.type
					})
			),
			...[this.placeholderSide].flat().map(
				(side) =>
					new BlockComponent({
						component: RemovedBlockPlaceholderComponent,
						props: { block: this },
						side,
						placeholder: true,
						type: this.placeholderType
					})
			)
		];
	}
}

type PartiallyModifiedSideData = {
	type: 'added' | 'removed' | 'modified';
	side: Side;
	lines: LineDiff[];
};

export class PartiallyModifiedBlock extends LinkedComponentsBlock {
	public type = 'partially_modified';
	public addedType = 'partially_added';
	public removedType = 'partially_removed';
	public modifiedType = 'partially_modified';

	public readonly sidesData: PartiallyModifiedSideData[];

	constructor(id: string, sidesData: PartiallyModifiedSideData[]) {
		super(id);
		this.sidesData = sidesData;
	}

	public render() {
		return this.sidesData.map(({ type, side, lines }) => {
			const SvelteComponent = (function () {
				switch (type) {
					case 'added':
						return PartiallyAddedBlockComponent;
					case 'removed':
						return PartiallyRemovedBlockComponent;
					case 'modified':
						return MergeModifiedComponent;
				}
			})();
			return new BlockComponent({
				component: SvelteComponent,
				props: { block: this, lines },
				side,
				type: (() => {
					switch (type) {
						case 'added':
							return this.addedType;
						case 'removed':
							return this.removedType;
						case 'modified':
							return this.modifiedType;
					}
				})()
			});
		});
	}
}
