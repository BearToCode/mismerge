<script setup lang="ts">
import '@mismerge/core/web';
import type { EditorColors, Highlighter, LineDiffAlgorithm } from '@mismerge/core';
import { ref } from 'vue';

const elem = ref<any>(null);

const props = defineProps<{
	lhs: string;
	rhs: string;
	onLhsChange?: (value: string) => void;
	onRhsChange?: (value: string) => void;
	colors?: EditorColors;
	lhsEditable?: boolean;
	ctrEditable?: boolean;
	rhsEditable?: boolean;
	lineDiffAlgorithm?: LineDiffAlgorithm;
	className?: string;
	disableMerging?: boolean;
	wrapLines?: boolean;
	disableFooter?: boolean;
	disableWordsCounter?: boolean;
	disableBlocksCounter?: boolean;
	highlight?: Highlighter;
	ignoreWhitespace?: boolean;
	ignoreCase?: boolean;
}>();

function onInput() {
	if (!elem.value) {
		return;
	}

	if (props.onLhsChange) {
		props.onLhsChange(elem.value.lhs);
	}
	if (props.onRhsChange) {
		props.onRhsChange(elem.value.rhs);
	}
}
</script>

<template>
	<mis-merge2
		ref="elem"
		:lhs="props.lhs"
		:rhs="props.rhs"
		@input="onInput"
		:colors="props.colors"
		:lhsEditable="props.lhsEditable"
		:rhsEditable="props.rhsEditable"
		:lineDiffAlgorithm="props.lineDiffAlgorithm"
		:class="props.className"
		:disableMerging="props.disableMerging"
		:wrapLines="props.wrapLines"
		:disableFooter="props.disableFooter"
		:disableWordsCounter="props.disableWordsCounter"
		:disableBlocksCounter="props.disableBlocksCounter"
		:highlight="props.highlight"
		:ignoreWhitespace="props.ignoreWhitespace"
		:ignoreCase="props.ignoreCase"
	/>
</template>
