<script lang="ts">
	export let value: string;
	export let selectedValue: string;
	let checked = false;

	$: checked = value == selectedValue;
</script>

<button
	class="radio-btn checkbox-btn"
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
</style>
