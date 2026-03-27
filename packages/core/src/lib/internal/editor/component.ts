import type { Component } from 'svelte';
import type { Side } from './side';
import { nanoid } from 'nanoid';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = Component<any>;

export type SideAction = {
	component: AnyComponent;
	props: Record<string, unknown>;
};

/**
 * Data to render a diff block.
 */
export class BlockComponent {
	public readonly id = nanoid(8);
	public readonly blockId: string;
	public readonly component: AnyComponent;
	public readonly side: Side;
	public readonly props: Record<string, unknown>;
	public readonly type: string;
	public readonly visualType: string;
	public readonly linesCount: number;
	public readonly placeholder: boolean;
	public readonly sideAction?: SideAction;
	constructor(params: {
		component: AnyComponent;
		sideAction?: SideAction;
		blockId: string;
		props: Record<string, unknown>;
		side: Side;
		type: string;
		visualType?: string;
		linesCount: number;
		placeholder?: boolean;
	}) {
		this.blockId = params.blockId;
		this.component = params.component;
		this.side = params.side;
		this.props = params.props;
		this.type = params.type;
		this.visualType = params.visualType ?? params.type;
		this.linesCount = params.linesCount;
		this.placeholder = params.placeholder ?? false;
		this.sideAction = params.sideAction;
	}
}
