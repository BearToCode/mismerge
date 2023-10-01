<script lang="ts">
	import type { BlockComponent } from '$lib/internal/editor/component';
	import type { createEventDispatcher } from 'svelte';
	import PenIcon from '../icons/PenIcon.svelte';
	import PencilOffIcon from '../icons/PencilOffIcon.svelte';
	import type { SidePanelEvents } from '$lib/internal/events';

	export let component: BlockComponent;
	export let dispatch: ReturnType<typeof createEventDispatcher<SidePanelEvents>>;
	export let toggleResolved: () => void;
	export let resolved: boolean;
</script>

<button
	class="msm__resolve-button"
	on:click={() => {
		toggleResolved();
		dispatch('resolve', { component });
	}}
>
	{#if resolved}
		<PencilOffIcon />
	{:else}
		<PenIcon />
	{/if}
</button>
