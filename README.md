<div align="right">
<a href="https://www.npmjs.com/package/@mismerge/core"><img src="https://img.shields.io/npm/v/%40mismerge%2Fcore?color=6a7fec&labelColor=171d27&logo=npm&logoColor=white" alt="npm"></a>
<a href="https://bundlephobia.com/package/@mismerge/core"><img src="https://img.shields.io/bundlephobia/min/%40mismerge%2Fcore?color=6a7fec&labelColor=171d27&logo=javascript&logoColor=white" alt="bundle"></a>
<a href="https://github.com/BearToCode/mismerge/blob/master/LICENSE"><img src="https://img.shields.io/github/license/beartocode/mismerge?color=6a7fec&labelColor=171d27&logo=git&logoColor=white" alt="license"></a>
<a href="http://beartocode.github.io/mismerge/"><img src="https://img.shields.io/badge/available-red?label=demo&color=6a7fec&labelColor=171d27&logo=svelte&logoColor=white" alt="demo"></a>
</div>

<img alt="banner" src="https://raw.githubusercontent.com/BearToCode/mismerge/master/images/banner-light.png#gh-light-mode-only" />
<img alt="banner" src="https://raw.githubusercontent.com/BearToCode/mismerge/master/images/banner-dark.png#gh-dark-mode-only" />

## A web-based merge editor

Mismerge is a modern two-way and one-way merge editor for the web, built with Svelte. You can [visit the demo](https://beartocode.github.io/mismerge/) and start merging now, or use it as a component for your project.

## Features

- Two way merge editor
- One way merge editor
- Support lines wrapping
- Support syntax highlighting
- Can ignore whitespace
- Can ignore case
- Custom input history
- Blocks, words and chars counter
- Works in SvelteKit & TypeScript

## Installation

```
npm i @mismerge/core
```

## Usage

```svelte
<script>
	import { MisMerge3 } from '@mismerge/core';
	// Core styles, required for the editor to work properly
	import '@mismerge/core/styles.css';

	import '@mismerge/core/light.css';
	// Or  '@mismerge/core/dark.css';

	let lhs = 'foo';
	let ctr = 'bar';
	let rhs = 'baz';
</script>

<!-- Left-hand side and right-hand side constant text -->
<MisMerge3 {lhs} {rhs} bind:ctr />

<!-- All sides editable -->
<MisMerge3 bind:lhs bind:ctr bind:rhs lhsEditable rhsEditable >

<style>
  :global(.mismerge) {
    font-family: monospace;
    min-height: 600px;
  }
</style>
```

### Adding syntax highlighting

You need to provide your own syntax highlighter. Example and demo using [Speed-Highlight JS](https://github.com/speed-highlight/core). The highlighter can be either sync or async.

```svelte
<script>
	import { highlightText } from '@speed-highlight/core';
	// ...

	const highlight = async (text) => highlightText(text, 'js', true, { hideLineNumbers: true });
</script>

<MisMerge3 ... {highlight} />
```

### Changing connections colors

```svelte
<script>
	import { DefaultDarkColors } from '@mismerge/core';
	// ...
</script>

<MisMerge3 ... colors={DefaultDarkColors} />
```

### Styles

If you want to customize the editor styles, you can copy the default [light](https://github.com/BearToCode/mismerge/blob/master/packages/core/src/lib/styles/light.css) or [dark](https://github.com/BearToCode/mismerge/blob/master/packages/core/src/lib/styles/dark.css) theme and adapt it to your need.

Here is a basic explanation of how the the rendered html looks like:

```html
<div class="mismerge">
	<div>
		<!-- Main -->
		<div class="msm__main">
			<!-- View -->
			<div class="msm__view">
				<!-- Content -->
				<div class="msm__view-content">
					<!-- Blocks wrapper -->
					<div class="msm__wrapper">
						<!-- Blocks -->
						<div id="@abcdef" class="msm__block block-type">
							<!-- Lines -->
							<div class="msm__line">
								<!-- ... -->
							</div>
							<!-- ... -->
						</div>
						<!-- ... -->
					</div>

					<!-- Highlight overlay -->
					<div class="msm__highlight-overlay">
						<!-- ... -->
					</div>

					<!-- Input -->
					<textarea />
				</div>

				<!-- Side panel -->
				<div class="msm__side-panel">
					<!-- ... -->
				</div>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<div class="msm__footer">
		<!-- ... -->
	</div>
</div>
```

## API

A list of properties for `<MisMerge2>`(2), `<MisMerge3>`(3), or both.

| Property                | Type                                            | Default               | Description                                       | Component |
| ----------------------- | ----------------------------------------------- | --------------------- | ------------------------------------------------- | --------- |
| `lhs`                   | `string`                                        | `""`                  | Left-hand side text                               | Both      |
| `ctr`                   | `string`                                        | `""`                  | Center text                                       | 3         |
| `rhs`                   | `string`                                        | `""`                  | Right-hand side text                              | Both      |
| `colors`                | `EditorColors`                                  | `DefaultLightColors`  | Connections colors                                | Both      |
| `highlight`             | `(text: string) => string \| Promise<string>`   | `undefined`           | Syntax highlighter                                | Both      |
| `lhsEditable`           | `boolean`                                       | `true`(2), `false`(3) | Can edit left panel                               | Both      |
| `ctrEditable`           | `boolean`                                       | `true`                | Can edit center panel                             | 3         |
| `rhsEditable`           | `boolean`                                       | `true`(2), `false`(3) | Can edit right panel                              | Both      |
| `lineDiffAlgorithm`     | `'characters' \| 'words' \| 'words_with_space'` | `words_with_space`    | Diff algorithm for same line side by side diff    | Both      |
| `disableMerging`        | `boolean`                                       | `false`               | Disables merging                                  | Both      |
| `wrapLines`             | `boolean`                                       | `false`               | Enables lines wrapping                            | Both      |
| `disableWordsCounter`   | `boolean`                                       | `false`               | Disables words counter                            | Both      |
| `disableCharsCounter`   | `boolean`                                       | `false`               | Disables chars counter                            | Both      |
| `disableBlocksCounters` | `boolean`                                       | `false`               | Disables blocks counter                           | Both      |
| `disableFooter`         | `boolean`                                       | `false`               | Disables footer                                   | Both      |
| `ignoreWhitespace`      | `boolean`                                       | `false`               | Ignore whitespace in diff                         | Both      |
| `ignoreCase`            | `boolean`                                       | `false`               | Ignore case in diff                               | Both      |
| `conflictsResolved`     | `boolean`                                       | -                     | Binding for when all conflicts have been resolved | 3         |

Events:

| Name          | Description                                                   |
| ------------- | ------------------------------------------------------------- |
| `on:merge`    | Fired when a block is merged from one side to an adjacent one |
| `on:resolve`  | Fire when a conflict has its resolved status toggled          |
| `on:input`    | Default `textarea` event                                      |
| `on:keydown`  | Default `textarea` event                                      |
| `on:keypress` | Default `textarea` event                                      |
| `on:keyup`    | Default `textarea` event                                      |

## Contributing

### Project setup

Clone the repo:

```
git clone https://github.com/BearToCode/mismerge.git
cd mismerge
```

Download dependencies for all packages in the monorepo:

```
pnpm i
```

### The core package

The core package is inside `packages/core`. You can run the associated sveltekit app using `npm run core` or `cd packages/core` & `npm run dev`.

### The demo

The demo is inside the `demo` root folder. You can run it from root using `npm run demo` or `cd demo` & `npm run dev`.
It is automatically deployed to Github Pages with every push to master.

### Committing

This repository uses [commitizen](https://github.com/commitizen/cz-cli) to enforce similar commit messages. Commit using:

```
npm run commit
# or
git cz
```
