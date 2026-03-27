<script lang="ts">
	import View from '$lib/components/layout/View.svelte';
	import { BlockComponent } from '$lib/internal/editor/component';
	import { TwoWaySide } from '$lib/internal/editor/side';
	import TestBlock from './TestBlock.svelte';

	let { onheightchange }: { onheightchange?: () => void } = $props();

	let viewRef = $state<View | undefined>(undefined);
	const container = document.createElement('div');
	const components = [
		new BlockComponent({
			blockId: 'test-block',
			component: TestBlock,
			props: {},
			side: TwoWaySide.lhs,
			type: 'unchanged',
			linesCount: 2
		})
	];

	function triggerUpdate() {
		viewRef?.update();
	}
</script>

<View
	bind:this={viewRef}
	{container}
	{components}
	editable={false}
	content={'line 1\nline 2'}
	side={TwoWaySide.lhs}
	disableMerging={true}
	{onheightchange}
/>

<button onclick={triggerUpdate}>trigger update</button>