import type { ShjLanguage } from '@speed-highlight/core/index';
import { writable } from 'svelte/store';

export const component = writable<'mismerge2' | 'mismerge3'>('mismerge3');
export const language = writable<ShjLanguage>('c');
export const wrapLines = writable<boolean>(false);
export const disableMerging = writable<boolean>(false);
export const disableFooter = writable<boolean>(false);
export const ignoreWhitespace = writable<boolean>(false);
export const ignoreCase = writable<boolean>(false);
