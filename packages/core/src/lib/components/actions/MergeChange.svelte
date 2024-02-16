<script lang="ts">
	import type { BlockComponent } from '$lib/internal/editor/component';
	import type { createEventDispatcher } from 'svelte';
	import ArrowIcon from '../icons/ArrowIcon.svelte';
	import type { SidePanelEvents } from '$lib/internal/events';

	export let component: BlockComponent;
	export let dispatch: ReturnType<typeof createEventDispatcher<SidePanelEvents>>;
</script>

<button
	class="msm__merge-button"
	aria-label="merge change"
	on:click={() => dispatch('merge', { component })}
>
	<ArrowIcon />
</button>
