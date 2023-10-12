<script lang="ts">
	export let checked = false;
</script>

<button class="checkbox-btn" on:click={() => (checked = !checked)}>
	<div class="checkbox">
		<iconify-icon class="checkbox-icon" icon="mdi:checkbox-blank-outline" />

		{#if checked}
			<iconify-icon class="tick-icon" icon="mdi:tick" />
		{/if}
	</div>

	<slot />
</button>
