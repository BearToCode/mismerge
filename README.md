<img src="./images/logo.svg" width=128 />

# MisMerge

<a href="https://www.npmjs.com/package/@mismerge/core"><img src="https://img.shields.io/npm/v/@mismerge/core?color=%234f7ce3" alt="npm"></a>
<a href="https://bundlephobia.com/package/@mismerge/core"><img src="https://img.shields.io/bundlephobia/min/@mismerge/core?color=%235db8fc" alt="bundle"></a>
<a href="https://github.com/BearToCode/mismerge/blob/master/LICENSE"><img src="https://img.shields.io/github/license/BearToCode/mismerge?color=%232cd1da" alt="license"></a>
<a href="http://beartocode.github.io/mismerge/"><img src="https://img.shields.io/badge/demo-available-16b57c" alt="demo"></a>

Mismerge is a modern two-way and one-way merge editor for the web, built with Svelte. You can [visit the demo](https://beartocode.github.io/mismerge/) and start merging now, or use it as a component for you project.

<img src="./images/demo-light.png#gh-light-mode-only" />
<img src="./images/demo-dark.png#gh-dark-mode-only" />

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
