<script lang="ts">
	import CheckBox from './CheckBox.svelte';
	import Radio from './Radio.svelte';
	import {
		clearDemoLocalStorage,
		component,
		ctrPlaceholder,
		disableFooter,
		disableMerging,
		fixedHeight,
		ignoreCase,
		ignoreWhitespace,
		language,
		lhsPlaceholder,
		resetDemoState,
		rhsPlaceholder,
		syncHorizontalScroll,
		theme,
		wrapLines
	} from '$lib/stores';
	import type { BundledLanguage, SpecialLanguage } from 'shiki';

	const languages: {
		name: string;
		code: BundledLanguage | SpecialLanguage;
		icon: string;
	}[] = [
		{ name: 'Plain', code: 'plaintext', icon: 'majesticons:text' },
		{ name: 'Bash', code: 'bash', icon: 'codicon:terminal-bash' },
		{ name: 'CSS', code: 'css', icon: 'ri:css3-fill' },
		{ name: 'CSV', code: 'csv', icon: 'eos-icons:csv-file' },
		{ name: 'HTML', code: 'html', icon: 'ri:html5-fill' },
		{ name: 'HTTP', code: 'http', icon: 'ic:twotone-http' },
		{ name: 'JavaScript', code: 'js', icon: 'bxl:javascript' },
		{ name: 'JSON', code: 'json', icon: 'nonicons:json-16' },
		{ name: 'Markdown', code: 'md', icon: 'pajamas:markdown-mark-solid' },
		{ name: 'Perl', code: 'perl', icon: 'nonicons:perl-16' },
		{ name: 'Lua', code: 'lua', icon: 'nonicons:lua-16' },
		{ name: 'Python', code: 'py', icon: 'nonicons:python-16' },
		{ name: 'SQL', code: 'sql', icon: 'tabler:file-type-sql' },
		{ name: 'TypeScript', code: 'ts', icon: 'bxl:typescript' },
		{ name: 'Yaml', code: 'yaml', icon: 'file-icons:yaml-alt1' },
		{ name: 'Docker', code: 'docker', icon: 'fontisto:docker' },
		{ name: 'C', code: 'c', icon: 'devicon-plain:c' },
		{ name: 'C++', code: 'cpp', icon: 'tabler:brand-cpp' },
		{ name: 'C#', code: 'c#', icon: 'tabler:brand-c-sharp' },
		{ name: 'XML', code: 'xml', icon: 'carbon:xml' },
		{ name: 'Rust', code: 'rs', icon: 'nonicons:rust-16' },
		{ name: 'Go', code: 'go', icon: 'file-icons:go' },
		{ name: 'Java', code: 'java', icon: 'nonicons:java-16' },
		{ name: 'Assembly', code: 'asm', icon: 'heroicons:cpu-chip-20-solid' }
	];
</script>

<div class="toolbar">
	<button
		class="toolbar-icon-button reset"
		aria-label="Reset sample"
		title="Reset sample"
		on:click={() => {
			clearDemoLocalStorage();
			resetDemoState();
		}}
	>
		<iconify-icon icon="pajamas:clear-all"></iconify-icon>
	</button>

	<button
		class="toolbar-icon-button change-theme"
		aria-label="Toggle theme"
		on:click={() => {
			if ($theme == 'light') {
				theme.set('dark');
			} else {
				theme.set('light');
			}
		}}
	>
		<iconify-icon icon="mingcute:moon-fill"></iconify-icon>
	</button>

	<Radio bind:value={$component}>
		<iconify-icon icon="bxs:component"></iconify-icon>
		<span>Component</span>

		<ul slot="dropdown" let:RadioOption class="dropdown-list">
			<RadioOption bind:selectedValue={$component} value="mismerge2">MisMerge2</RadioOption>
			<RadioOption bind:selectedValue={$component} value="mismerge3">MisMerge3</RadioOption>
		</ul>
	</Radio>

	<Radio bind:value={$language}>
		<iconify-icon icon="tabler:code"></iconify-icon>
		<span>Language</span>

		<ul slot="dropdown" let:RadioOption class="dropdown-list radio-languages">
			{#each languages as lang}
				<RadioOption bind:selectedValue={$language} value={lang.code}>
					<iconify-icon icon={lang.icon}></iconify-icon>
					<span>{lang.name}</span>
				</RadioOption>
			{/each}
		</ul>
	</Radio>

	<CheckBox bind:checked={$wrapLines}>
		<iconify-icon icon="uis:wrap-text"></iconify-icon>
		<span>Wrap lines</span>
	</CheckBox>

	<CheckBox bind:checked={$fixedHeight}>
		<iconify-icon icon="material-symbols:height-rounded"></iconify-icon>
		<span>Fixed height</span>
	</CheckBox>

	<CheckBox bind:checked={$syncHorizontalScroll}>
		<iconify-icon icon="material-symbols:sync-alt-rounded"></iconify-icon>
		<span>Sync horizontal scroll</span>
	</CheckBox>

	<CheckBox bind:checked={$disableMerging}>
		<iconify-icon icon="jam:merge"></iconify-icon>
		<span>Disable merging</span>
	</CheckBox>

	<CheckBox bind:checked={$disableFooter}>
		<iconify-icon icon="pixelarticons:layout-footer"></iconify-icon>
		<span>Disable footer</span>
	</CheckBox>

	<CheckBox bind:checked={$ignoreWhitespace}>
		<iconify-icon icon="mingcute:space-fill"></iconify-icon>
		<span>Ignore whitespace</span>
	</CheckBox>

	<CheckBox bind:checked={$ignoreCase}>
		<iconify-icon icon="fluent:text-case-title-16-filled"></iconify-icon>
		<span>Ignore case</span>
	</CheckBox>
</div>

<style>
	.toolbar-icon-button {
		justify-content: center;
		padding: 0.25rem;
		width: 2rem;
		height: 2rem;
		min-width: 2rem;
	}

	.toolbar-icon-button iconify-icon {
		font-size: 1.1rem;
	}

	.change-theme {
		font-size: 1rem;
	}

	.change-theme iconify-icon {
		font-size: 1.35rem;
	}
</style>
