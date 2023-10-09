<script lang="ts">
	import CheckBox from './CheckBox.svelte';
	import Radio from './Radio.svelte';
	import {
		component,
		disableFooter,
		disableMerging,
		ignoreCase,
		ignoreWhitespace,
		language,
		wrapLines
	} from '$lib/stores';
</script>

<div class="toolbar">
	<button class="reset">
		<iconify-icon icon="pajamas:clear-all" />
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

		<ul slot="dropdown" let:RadioOption class="dropdown-list">
			<RadioOption bind:selectedValue={$language} value="bash">
				<iconify-icon icon="codicon:terminal-bash" />
				<span>Bash</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="css">
				<iconify-icon icon="ri:css3-fill" />
				<span>CSS</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="csv">
				<iconify-icon icon="eos-icons:csv-file" />
				<span>CSV</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="html">
				<iconify-icon icon="ri:html5-fill" />
				<span>HTML</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="http">
				<iconify-icon icon="ic:twotone-http" />
				<span>HTTP</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="js">
				<iconify-icon icon="bxl:javascript" />
				<span>JavaScript</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="json">
				<iconify-icon icon="nonicons:json-16" />
				<span>JSON</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="md">
				<iconify-icon icon="pajamas:markdown-mark-solid" />
				<span>Markdown</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="perl">
				<iconify-icon icon="nonicons:perl-16" />
				<span>Perl</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="py">
				<iconify-icon icon="nonicons:python-16" />
				<span>Python</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="sql">
				<iconify-icon icon="tabler:file-type-sql" />
				<span>SQL</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="ts">
				<iconify-icon icon="bxl:typescript" />
				<span>TypeScript</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="yaml">
				<iconify-icon icon="file-icons:yaml-alt1" />
				<span>Yaml</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="docker">
				<iconify-icon icon="fontisto:docker" />
				<span>Docker</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="c">
				<iconify-icon icon="devicon-plain:c" />
				<span>C</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="xml">
				<iconify-icon icon="carbon:xml" />
				<span>XML</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="rs">
				<iconify-icon icon="nonicons:rust-16" />
				<span>Rust</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="go">
				<iconify-icon icon="file-icons:go" />
				<span>GO</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="java">
				<iconify-icon icon="nonicons:java-16" />
				<span>Java</span>
			</RadioOption>

			<RadioOption bind:selectedValue={$language} value="asm">
				<iconify-icon icon="heroicons:cpu-chip-20-solid" />
				<span>Assembly</span>
			</RadioOption>
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
	.reset {
		width: fit-content;
		min-width: unset;
		padding: 0;
		width: 1.5rem;
	}
</style>
