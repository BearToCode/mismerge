<script lang="ts">
	import RadioOption from './RadioOption.svelte';

	export let value: string;

	let btn: HTMLButtonElement;
	let dropdown: HTMLDivElement;
	let open = false;

	function toggle(e: MouseEvent) {
		if (!(e.target instanceof HTMLElement)) return;
		if (btn == e.target || btn.contains(e.target)) return (open = !open);
		if (dropdown == e.target || dropdown.contains(e.target)) return;
		open = false;
	}
</script>

<svelte:window on:click={toggle} />

<div class="radio {open ? 'open' : ''}">
	<button bind:this={btn}>
		<slot />
		<iconify-icon class="arrow-down" icon="iconamoon:arrow-down-2-bold" />
	</button>

	<div bind:this={dropdown} class="dropdown">
		<slot name="dropdown" {RadioOption} selectedValue={value} />
	</div>
</div>
