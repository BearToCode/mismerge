<script lang="ts">
	export let checked = false;
</script>

<button on:click={() => (checked = !checked)}>
	<div class="checkbox">
		<iconify-icon class="checkbox-icon" icon="mdi:checkbox-blank-outline" />

		{#if checked}
			<iconify-icon class="tick-icon" icon="mdi:tick" />
		{/if}
	</div>

	<slot />
</button>

<style>
	.checkbox {
		font-size: 1.4rem;
		opacity: 0.5;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;

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
