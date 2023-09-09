<script lang="ts">
	import type { RemovedBlockPlaceholder } from '$lib/internal/blocks';

	export let block: RemovedBlockPlaceholder;
</script>

<div class="block {block.type}" />
