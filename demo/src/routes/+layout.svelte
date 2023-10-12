<script class="ts">
	import { theme } from '$lib/stores';
	import { onMount } from 'svelte';

	let mounted = false;

	onMount(() => {
		mounted = true;
		document.body.classList.add($theme);
	});

	theme.subscribe((val) => {
		if (!mounted) return;
		document.body.classList.remove('light', 'dark');
		document.body.classList.add(val);
	});
</script>

<slot />
