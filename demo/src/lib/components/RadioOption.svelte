<script lang="ts">
	export let value: string;
	export let selectedValue: string;
	let checked = false;

	$: checked = value == selectedValue;
</script>

<button
	on:click|stopPropagation={() => {
		selectedValue = value;
	}}
>
	<div class="checkbox">
		<iconify-icon class="checkbox-icon" icon="mdi:checkbox-blank-outline" />

		{#if checked}
			<iconify-icon class="tick-icon" icon="mdi:tick" />
		{/if}
	</div>

	<slot />
</button>

<style>
	button {
		display: inline-flex;
		align-items: center;
		font-size: 0.95rem;
		cursor: pointer;
	}

	button:nth-child(odd) {
		background: #121212;
	}

	.checkbox {
		font-size: 1.4rem;
		opacity: 0.5;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;

		margin-right: 0.25rem;

		transition: opacity 0.2s ease-in-out;
	}

	button:hover .checkbox {
		opacity: 0.75;
	}

	.tick-icon {
		position: absolute;
		left: 50%;
		top: 50%;
		font-size: 1.5rem;
		transform: translate(-50%, -50%);
		color: #e8a1c0;

		filter: drop-shadow(-1px -1px 0px #0e0e0e) drop-shadow(1px -1px 0px #0e0e0e)
			drop-shadow(1px 1px 0px #0e0e0e) drop-shadow(-1px 1px 0px #0e0e0e);
	}
</style>
