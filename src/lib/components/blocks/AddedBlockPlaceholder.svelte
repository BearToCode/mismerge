<script lang="ts">
	import type { AddedBlockPlaceholder } from '$lib/internal/blocks';

	export let block: AddedBlockPlaceholder;
</script>

<div class="block {block.type}" />
