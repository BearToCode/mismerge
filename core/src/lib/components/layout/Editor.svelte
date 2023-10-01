<script lang="ts">
	import { CodeInput } from '$lib/internal/input/code-input';
	import { onMount } from 'svelte';

	/* Exports */

	export let content: string;
	export let width: number;
	export const saveHistory = () => codeInput?.saveHistoryState();

	/* Local variables */

	let elem: HTMLTextAreaElement;
	let codeInput: CodeInput;

	onMount(() => (codeInput = new CodeInput(elem)));
</script>

<textarea
	spellcheck="false"
	style="--scroll-width: {width}px;"
	bind:value={content}
	bind:this={elem}
	on:scroll={() => (elem.scrollTop = 0)}
/>
