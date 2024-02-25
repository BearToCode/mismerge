<script setup lang="ts">
import { MisMerge3, DefaultDarkColors } from './lib';
import '@mismerge/core/styles.css';
import '@mismerge/core/dark.css';
</script>

<template>
	<MisMerge3
		lhs="Hello"
		ctr="World"
		rhs="!"
		ctr-editable
		:colors="DefaultDarkColors"
		:on-ctr-change="console.log"
	/>
</template>
