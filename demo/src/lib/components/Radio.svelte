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

<style>
	.radio {
		position: relative;
		padding: 0;
	}

	button {
		font-family: inherit;
		font-size: inherit;
		color: inherit;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		width: 100%;

		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.radio.open {
		opacity: 1;
	}

	.radio .dropdown {
		position: absolute;
		top: calc(100% + 1rem);
		left: 0;
		right: 0;
		display: none;
		z-index: 1;

		background: #0e0e0e;
		border: 1px solid #444344;
		border-radius: 6px;

		overflow: hidden;
	}

	.radio.open .dropdown {
		display: block;
	}

	.arrow-down {
		opacity: 0.5;
	}
</style>
