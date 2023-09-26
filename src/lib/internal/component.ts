import type { SvelteComponent } from 'svelte';
import type { Side } from './side';
import { nanoid } from 'nanoid';

/**
 * Data to render a diff block.
 */
export class BlockComponent<T extends Record<string, unknown> = Record<string, unknown>> {
	public readonly id = '@' + nanoid(6);
	public readonly component: typeof SvelteComponent<{ component: BlockComponent<T> } & T>;
	public readonly side: Side;
	public readonly props: T;
	public readonly type: string;
	public readonly linesCount: number;
	public readonly placeholder: boolean;
	constructor(params: {
		component: typeof SvelteComponent<{ component: BlockComponent<T> } & T>;
		props: T;
		side: Side;
		type: string;
		linesCount: number;
		placeholder?: boolean;
	}) {
		this.component = params.component;
		this.side = params.side;
		this.props = params.props;
		this.type = params.type;
		this.linesCount = params.linesCount;
		this.placeholder = params.placeholder ?? false;
	}
}
