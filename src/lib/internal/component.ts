import type { SvelteComponent } from 'svelte';
import type { Side } from './blocks';
import { nanoid } from 'nanoid';

export class BlockComponent<T extends Record<string, unknown> = Record<string, unknown>> {
	public readonly id = nanoid(6);
	public readonly component: typeof SvelteComponent<{ component: BlockComponent<T> } & T>;
	public readonly side: Side;
	public readonly props: T;
	public readonly type: string;
	public readonly placeholder: boolean;
	constructor(params: {
		component: typeof SvelteComponent<{ component: BlockComponent<T> } & T>;
		props: T;
		side: Side;
		type: string;
		placeholder?: boolean;
	}) {
		this.component = params.component;
		this.side = params.side;
		this.props = params.props;
		this.type = params.type;
		this.placeholder = params.placeholder ?? false;
	}
}
