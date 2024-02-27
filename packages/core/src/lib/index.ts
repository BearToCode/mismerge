export { default as MisMerge3 } from './components/MisMerge3.svelte';
export { default as MisMerge2 } from './components/MisMerge2.svelte';
// Export editor colors options
export * from './internal/editor/colors';
export { type LineDiffAlgorithm } from './internal/diff/line-diff';
export type Highlighter = (text: string) => string | Promise<string>;
