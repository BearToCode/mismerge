<script lang="ts">
	import { CodeInput } from '$lib/internal/input/code-input';
	import { onMount } from 'svelte';

	let {
		content = $bindable(),
		width
	}: {
		content: string;
		width: number;
	} = $props();

	let elem: HTMLTextAreaElement;
	let codeInput: CodeInput;

	onMount(() => (codeInput = new CodeInput(elem)));

	export function saveHistory() {
		codeInput?.saveHistoryState();
	}

	export function focus() {
		elem?.focus();
	}
</script>

<textarea
	spellcheck="false"
	style="--width: {width}px;"
	bind:value={content}
	bind:this={elem}
	onscroll={() => (elem.scrollTop = 0)}
></textarea>
