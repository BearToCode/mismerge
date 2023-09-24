import type { MaybeArray } from './utils';
import type { Change } from 'diff';
import type { Connection } from './connection';
import type { Side } from './side';
import { BlockComponent } from './component';
import UnchangedBlockComponent from '$lib/components/blocks/UnchangedBlock.svelte';
import AddedBlockComponent from '$lib/components/blocks/AddedBlock.svelte';
import AddedBlockPlaceholderComponent from '$lib/components/blocks/AddedBlockPlaceholder.svelte';
import RemovedBlockComponent from '$lib/components/blocks/RemovedBlock.svelte';
import RemovedBlockPlaceholderComponent from '$lib/components/blocks/RemovedBlockPlaceholder.svelte';
import PartiallyRemovedBlockComponent from '$lib/components/blocks/PartiallyRemovedBlock.svelte';
import PartiallyAddedBlockComponent from '$lib/components/blocks/PartiallyAddedBlock.svelte';
import MergeConflictBlockComponent from '$lib/components/blocks/MergeConflictBlock.svelte';
import MergeConflictPlaceholderComponent from '$lib/components/blocks/MergeConflictPlaceholder.svelte';

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

	constructor(params: { id: string; sidesData: MaybeArray<UnchangedSideData> }) {
		super(params.id);
		this.sidesData = params.sidesData;
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

type AddedSideData = {
	side: Side;
	lines: Line[];
};

export class AddedBlock extends LinkedComponentsBlock {
	public type = 'added';
	public placeholderType = 'added_placeholder';

	public readonly sidesData: MaybeArray<AddedSideData>;
	public readonly placeholderSide: MaybeArray<Side>;
	public readonly unchangedSide?: Side;

	constructor(params: {
		id: string;
		sidesData: MaybeArray<AddedSideData>;
		placeholderSide: MaybeArray<Side>;
	}) {
		super(params.id);
		this.sidesData = params.sidesData;
		this.placeholderSide = params.placeholderSide;
	}

	public render() {
		return [
			...[this.sidesData].flat().map(
				({ side, lines }) =>
					new BlockComponent({
						component: AddedBlockComponent,
						props: { block: this, lines },
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

type RemovedSideData = {
	side: Side;
	lines: Line[];
};

export class RemovedBlock extends LinkedComponentsBlock {
	public type = 'removed';
	public placeholderType = 'removed_placeholder';

	public readonly sidesData: MaybeArray<RemovedSideData>;
	public readonly placeholderSide: MaybeArray<Side>;

	constructor(params: {
		id: string;
		sidesData: MaybeArray<RemovedSideData>;
		placeholderSide: MaybeArray<Side>;
	}) {
		super(params.id);
		this.sidesData = params.sidesData;
		this.placeholderSide = params.placeholderSide;
	}

	public render() {
		return [
			...[this.sidesData].flat().map(
				({ side, lines }) =>
					new BlockComponent({
						component: RemovedBlockComponent,
						props: { block: this, lines },
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
	type: 'added' | 'removed';
	side: Side;
	lines: LineDiff[];
};

export class PartiallyModifiedBlock extends LinkedComponentsBlock {
	public type = 'partially_modified';
	public addedType = 'partially_added';
	public removedType = 'partially_removed';

	public readonly sidesData: PartiallyModifiedSideData[];

	constructor(params: { id: string; sidesData: PartiallyModifiedSideData[] }) {
		super(params.id);
		this.sidesData = params.sidesData;
	}

	public render() {
		return this.sidesData.map(({ type, side, lines }) => {
			const SvelteComponent = (function () {
				switch (type) {
					case 'added':
						return PartiallyAddedBlockComponent;
					case 'removed':
						return PartiallyRemovedBlockComponent;
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
					}
				})()
			});
		});
	}
}

type MergeConflictSideData = {
	side: Side;
	lines: Line[];
};

export class MergeConflictBlock extends LinkedComponentsBlock {
	public type = 'merge_conflict';
	public placeholderType = 'merge_conflict_placeholder';

	public readonly sidesData: MergeConflictSideData[];
	public readonly placeholderSide: MaybeArray<Side>;

	constructor(params: {
		id: string;
		sidesData: MergeConflictSideData[];
		placeholderSide?: MaybeArray<Side>;
	}) {
		super(params.id);
		this.sidesData = params.sidesData;
		this.placeholderSide = params.placeholderSide ?? [];
	}

	public render() {
		return [
			...this.sidesData.map(({ side, lines }) => {
				return new BlockComponent({
					component: MergeConflictBlockComponent,
					props: { block: this, lines },
					side,
					type: this.type
				});
			}),
			...[this.placeholderSide].flat().map(
				(side) =>
					new BlockComponent({
						component: MergeConflictPlaceholderComponent,
						props: { block: this },
						side,
						placeholder: true,
						type: this.placeholderType
					})
			)
		];
	}
}
