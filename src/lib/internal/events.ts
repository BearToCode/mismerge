import type { BlockComponent } from './editor/component';

export type SidePanelEvents = {
	merge: { component: BlockComponent };
	resolve: { component: BlockComponent };
};
