<script lang="ts">
	import type { BlockComponent } from '$lib/internal/editor/component';
	import type { createEventDispatcher } from 'svelte';
	import CrossIcon from '../icons/CrossIcon.svelte';
	import type { SidePanelEvents } from '$lib/internal/events';

	export let component: BlockComponent;
	export let dispatch: ReturnType<typeof createEventDispatcher<SidePanelEvents>>;
</script>

<button
	class="msm__delete-button"
	aria-label="delete change"
	on:click={() => dispatch('delete', { component })}
>
	<CrossIcon />
</button>
