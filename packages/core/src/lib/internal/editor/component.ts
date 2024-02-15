import type { SvelteComponent, createEventDispatcher } from 'svelte';
import type { Side } from './side';
import { nanoid } from 'nanoid';
import type { SidePanelEvents } from '../events';

export type SideAction<
	BlockProps extends Record<string, unknown> = Record<string, unknown>,
	SideActionProps extends Record<string, unknown> = Record<string, unknown>
> = {
	component: typeof SvelteComponent<
		{
			component: BlockComponent<BlockProps, SideActionProps>;
			dispatch: ReturnType<typeof createEventDispatcher<SidePanelEvents>>;
		} & SideActionProps
	>;
	props: Record<string, unknown>;
};

/**
 * Data to render a diff block.
 */
export class BlockComponent<
	BlockProps extends Record<string, unknown> = Record<string, unknown>,
	SideActionProps extends Record<string, unknown> = Record<string, unknown>
> {
	public readonly id = nanoid(8);
	public readonly blockId: string;
	public readonly component: typeof SvelteComponent<
		{ component: BlockComponent<BlockProps> } & BlockProps
	>;
	public readonly side: Side;
	public readonly props: BlockProps;
	public readonly type: string;
	public readonly linesCount: number;
	public readonly placeholder: boolean;
	public readonly sideAction?: SideAction<BlockProps, SideActionProps>;
	constructor(params: {
		component: typeof SvelteComponent<
			{ component: BlockComponent<BlockProps, SideActionProps> } & BlockProps
		>;
		sideAction?: SideAction<BlockProps, SideActionProps>;
		blockId: string;
		props: BlockProps;
		side: Side;
		type: string;
		linesCount: number;
		placeholder?: boolean;
	}) {
		this.blockId = params.blockId;
		this.component = params.component;
		this.side = params.side;
		this.props = params.props;
		this.type = params.type;
		this.linesCount = params.linesCount;
		this.placeholder = params.placeholder ?? false;
		this.sideAction = params.sideAction;
	}
}
