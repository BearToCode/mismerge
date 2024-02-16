<script lang="ts">
	import CheckBox from './CheckBox.svelte';
	import Radio from './Radio.svelte';
	import {
		component,
		ctr,
		disableFooter,
		disableMerging,
		ignoreCase,
		ignoreWhitespace,
		language,
		lhs,
		rhs,
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
		class="reset"
		on:click={() => {
			lhs.set('');
			rhs.set('');
			ctr.set('');
		}}
	>
		<iconify-icon icon="pajamas:clear-all" />
	</button>

	<button
		class="change-theme"
		on:click={() => {
			if ($theme == 'light') {
				theme.set('dark');
			} else {
				theme.set('light');
			}
		}}
	>
		<iconify-icon icon="mingcute:moon-fill" />
	</button>

	<Radio bind:value={$component}>
		<iconify-icon icon="bxs:component" />
		<span>Component</span>

		<ul slot="dropdown" let:RadioOption class="dropdown-list">
			<RadioOption bind:selectedValue={$component} value="mismerge2">MisMerge2</RadioOption>
			<RadioOption bind:selectedValue={$component} value="mismerge3">MisMerge3</RadioOption>
		</ul>
	</Radio>

	<Radio bind:value={$language}>
		<iconify-icon icon="tabler:code" />
		<span>Language</span>

		<ul slot="dropdown" let:RadioOption class="dropdown-list radio-languages">
			{#each languages as lang}
				<RadioOption bind:selectedValue={$language} value={lang.code}>
					<iconify-icon icon={lang.icon} />
					<span>{lang.name}</span>
				</RadioOption>
			{/each}
		</ul>
	</Radio>

	<CheckBox bind:checked={$wrapLines}>
		<iconify-icon icon="uis:wrap-text" />
		<span>Wrap lines</span>
	</CheckBox>

	<CheckBox bind:checked={$disableMerging}>
		<iconify-icon icon="jam:merge" />
		<span>Disable merging</span>
	</CheckBox>

	<CheckBox bind:checked={$disableFooter}>
		<iconify-icon icon="pixelarticons:layout-footer" />
		<span>Disable footer</span>
	</CheckBox>

	<CheckBox bind:checked={$ignoreWhitespace}>
		<iconify-icon icon="mingcute:space-fill" />
		<span>Ignore whitespace</span>
	</CheckBox>

	<CheckBox bind:checked={$ignoreCase}>
		<iconify-icon icon="fluent:text-case-title-16-filled" />
		<span>Ignore case</span>
	</CheckBox>
</div>

<style>
	.reset,
	.change-theme {
		width: fit-content;
		min-width: unset;
		padding: 0;
		width: 1.75rem;
	}

	.change-theme {
		font-size: 1.5rem;
	}
</style>
