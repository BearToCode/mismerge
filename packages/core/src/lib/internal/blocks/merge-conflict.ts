import { type Line, LinkedComponentsBlock } from '.';
import { TwoWaySide, type Side } from '../editor/side';
import type { MaybeArray } from '../utils';
import { BlockComponent, type SideAction } from '../editor/component';
import MergeConflictBlockComponent from '$lib/components/blocks/MergeConflictBlock.svelte';
import MergeConflictPlaceholderComponent from '$lib/components/blocks/MergeConflictPlaceholder.svelte';
import ResolvedConflictBlockComponent from '$lib/components/blocks/ResolvedConflictBlock.svelte';
import ResolvedConflictPlaceholderComponent from '$lib/components/blocks/ResolvedConflictPlaceholder.svelte';
import MergeChange from '$lib/components/actions/MergeChange.svelte';
import ResolveConflict from '$lib/components/actions/ResolveConflict.svelte';
import DeleteChange from '$lib/components/actions/DeleteChange.svelte';
import { endsWithSequence, startsWithSequence } from '$lib/internal/utils';

type MergeConflictSideData<SideType extends Side> = {
	side: SideType;
	lines: Line[];
};

export class MergeConflictBlock extends LinkedComponentsBlock<TwoWaySide> {
	public static readonly type = 'merge-conflict';
	public type = MergeConflictBlock.type;
	public placeholderType = 'merge-conflict-placeholder';
	public resolvedType = 'resolved-merge-conflict';
	public resolvedPlaceholderType = 'resolved-merge-conflict-placeholder';

	public readonly sidesData: MergeConflictSideData<TwoWaySide>[];
	public readonly placeholderSide: MaybeArray<Side>;

	private resolved = false;
	public get isResolved() {
		return this.resolved;
	}

	constructor(params: {
		sidesData: MergeConflictSideData<TwoWaySide>[];
		placeholderSide?: MaybeArray<Side>;
	}) {
		super();
		this.sidesData = params.sidesData;
		this.placeholderSide = params.placeholderSide ?? [];
	}

	public linesCount(side: TwoWaySide): number {
		return [...this.sidesData].find((sideData) => sideData.side.eq(side))?.lines.length ?? 0;
	}

	private getLines(side: Side): string[] {
		return ([...this.sidesData].find((sideData) => sideData.side.eq(side))?.lines ?? []).map(
			(line) => line.content
		);
	}

	private hasMergedIntoCenter(side: Side) {
		if (!(side instanceof TwoWaySide) || side.eq(TwoWaySide.ctr)) return false;

		const sourceLines = this.getLines(side);
		const centerLines = this.getLines(TwoWaySide.ctr);

		if (sourceLines.length === 0 || centerLines.length === 0) return false;

		if (side.eq(TwoWaySide.lhs)) {
			return startsWithSequence(centerLines, sourceLines);
		}

		return endsWithSequence(centerLines, sourceLines);
	}

	private toggleResolved = () => (this.resolved = !this.resolved);

	private getSideAction(side: Side): SideAction {
		if (side instanceof TwoWaySide && side.eq(TwoWaySide.ctr))
			return {
				component: ResolveConflict,
				props: { toggleResolved: this.toggleResolved, resolved: this.resolved }
			};
		else {
			return {
				component: this.hasMergedIntoCenter(side) ? DeleteChange : MergeChange,
				props: {}
			};
		}
	}

	public render(): BlockComponent[] {
		if (this.resolved) return this.renderResolved();
		else return this.renderUnresolved();
	}

	private renderUnresolved() {
		return [
			...this.sidesData.map(({ side, lines }) => {
				return new BlockComponent({
					component: MergeConflictBlockComponent,
					blockId: this.id,
					props: {
						block: this,
						lines
					},
					linesCount: this.linesCount(side),
					side,
					type: this.type,
					sideAction: this.getSideAction(side)
				});
			}),
			...[this.placeholderSide].flat().map(
				(side) =>
					new BlockComponent({
						component: MergeConflictPlaceholderComponent,
						blockId: this.id,
						props: { block: this },
						linesCount: 0,
						side,
						placeholder: true,
						type: this.placeholderType
					})
			)
		];
	}

	private renderResolved() {
		return [
			...this.sidesData.map(({ side, lines }) => {
				return new BlockComponent({
					component: ResolvedConflictBlockComponent,
					blockId: this.id,
					props: {
						block: this,
						lines
					},
					linesCount: this.linesCount(side),
					side,
					type: this.resolvedType,
					sideAction: this.getSideAction(side)
				});
			}),
			...[this.placeholderSide].flat().map(
				(side) =>
					new BlockComponent({
						component: ResolvedConflictPlaceholderComponent,
						blockId: this.id,
						props: { block: this },
						linesCount: 0,
						side,
						placeholder: true,
						type: this.resolvedPlaceholderType
					})
			)
		];
	}
}
