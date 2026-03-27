<div align="right">
<a href="https://github.com/vostej/mismerge/blob/master/LICENSE"><img src="https://img.shields.io/github/license/vostej/mismerge?color=6a7fec&labelColor=171d27&logo=git&logoColor=white" alt="license"></a>
<a href="http://vostej.github.io/mismerge/"><img src="https://img.shields.io/badge/available-red?label=demo&color=6a7fec&labelColor=171d27&logo=svelte&logoColor=white" alt="demo"></a>
</div>

<img alt="banner" src="https://raw.githubusercontent.com/vostej/mismerge/master/images/banner-light.png#gh-light-mode-only" />
<img alt="banner" src="https://raw.githubusercontent.com/vostej/mismerge/master/images/banner-dark.png#gh-dark-mode-only" />

## A web-based merge editor

Mismerge is a modern one-way and two-way merge editor for the web, built with **Svelte**. You can [visit the demo](https://vostej.github.io/mismerge/) and start merging now, or use it as a component in your own project. The current adapters in this repo target **React** and **Solid**.

## Features

- ▶️ One way merge editor
- 🔀 Two way merge editor
- 📑 Optional line wrapping
- 🌈 Optional syntax highlighting
- ➖ Can ignore whitespace
- 🔠 Can ignore case
- ↔️ Optional synced horizontal scrolling
- 🧱 Header, footer and counters can be toggled
- 🔢 Words, chars and blocks counters
- ✅ Works in SvelteKit & TypeScript
- 🌎 Available in React & Solid

## Installation

The packages in this repo are currently configured for the `@vostej` scope and publish to GitHub Packages.

```sh
npm config set @vostej:registry https://npm.pkg.github.com
npm i @vostej/core
```

## Usage

### Svelte

```svelte
<script>
	import { MisMerge3 } from '@vostej/core';
	// Core styles, required for the editor to work properly
	import '@vostej/core/styles.css';

	import '@vostej/core/light.css';
	// Or '@vostej/core/dark.css';

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

### React

Install the **additional** adapter package:

```sh
npm config set @vostej:registry https://npm.pkg.github.com
npm i @vostej/react
```

```jsx
import { DefaultDarkColors, MisMerge3 } from '@vostej/react';
import { useEffect, useState } from 'react';
import '@vostej/core/styles.css';
import '@vostej/core/dark.css';

function App() {
	const [ctr, setCtr] = useState('Hello world!');

	useEffect(() => {
		console.log(ctr);
	}, [ctr]);

	return (
		<>
			<MisMerge3
				lhs="Hello world!"
				ctr={ctr}
				rhs="Hello world!"
				onCtrChange={setCtr}
				colors={DefaultDarkColors}
				wrapLines={true}
			/>
		</>
	);
}
```

### Solid

Install the **additional** adapter package:

```sh
npm config set @vostej:registry https://npm.pkg.github.com
npm i @vostej/solid
```

```tsx
import { createSignal } from 'solid-js';
import { DefaultDarkColors, MisMerge3 } from '@vostej/solid';
import '@vostej/core/styles.css';
import '@vostej/core/dark.css';

export default function App() {
	const [ctr, setCtr] = createSignal('World');

	return (
		<MisMerge3
			lhs="Hello"
			ctr={ctr()}
			rhs="!"
			onCtrChange={setCtr}
			colors={DefaultDarkColors}
			wrapLines={true}
		/>
	);
}
```

## Customization

### Adding syntax highlighting

You need to provide your own syntax highlighter. Example and demo using [Shiki-JS](https://github.com/shikijs/shiki). The highlighter can be either sync or async.

```svelte
<script>
	import { codeToHtml } from 'shiki';
	// ...

	const highlight = async (text: string) =>
		await codeToHtml(text, {
			lang: 'js',
			theme: 'min-dark'
		});
</script>

<MisMerge3 ... {highlight} />
```

### Changing connections colors

```svelte
<script>
	import { DefaultDarkColors } from '@vostej/core';
	// ...
</script>

<MisMerge3 ... colors={DefaultDarkColors} />
```

### Styles

If you want to customize the editor styles, you can copy the default [light](https://github.com/vostej/mismerge/blob/master/packages/core/src/lib/styles/light.css) or [dark](https://github.com/vostej/mismerge/blob/master/packages/core/src/lib/styles/dark.css) theme and adapt it to your needs.

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
						<div data-component-id="abcdefgh" class="msm__block block-type">
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
| `syncHorizontalScroll`  | `boolean`                                       | `false`               | Synchronizes horizontal scrolling between panels  | Both      |
| `disableWordsCounter`   | `boolean`                                       | `false`               | Disables words counter                            | Both      |
| `disableCharsCounter`   | `boolean`                                       | `false`               | Disables chars counter                            | Both      |
| `disableBlocksCounters` | `boolean`                                       | `false`               | Disables blocks counter                           | Both      |
| `disableFooter`         | `boolean`                                       | `false`               | Disables footer                                   | Both      |
| `disableHeader`         | `boolean`                                       | `false`               | Disables header                                   | Both      |
| `ignoreWhitespace`      | `boolean`                                       | `false`               | Ignore whitespace in diff                         | Both      |
| `ignoreCase`            | `boolean`                                       | `false`               | Ignore case in diff                               | Both      |
| `conflictsResolved`     | `boolean`                                       | `false`               | Binding for when all conflicts have been resolved | 3         |

Events (available for Svelte):

| Name          | Description                                                   |
| ------------- | ------------------------------------------------------------- |
| `on:merge`    | Fired when a block is merged from one side to an adjacent one |
| `on:resolve`  | Fired when a conflict has its resolved status toggled         |
| `on:delete`   | Fired when a block is deleted in the center side              |
| `on:input`    | Default `textarea` event                                      |
| `on:keydown`  | Default `textarea` event                                      |
| `on:keypress` | Default `textarea` event                                      |
| `on:keyup`    | Default `textarea` event                                      |

## Contributing

### Project setup

Clone the repo:

```
git clone https://github.com/vostej/mismerge.git
cd mismerge
```

Download dependencies for all packages in the monorepo:

```
npm install
```

### The core package

The core package is inside `packages/core`. You can run the associated sveltekit app using `npm run core` or `cd packages/core` & `npm run dev`.

### The demo

The demo is inside the `demo` root folder. You can run it from root using `npm run demo` or `cd demo` & `npm run dev`.
It is automatically deployed to Github Pages with every push to master.
