import LhsPlaceholderText from '$lib/placeholder/lhs-quicksort.c?raw';
import CtrPlaceholderText from '$lib/placeholder/ctr-quicksort.c?raw';
import RhsPlaceholderText from '$lib/placeholder/rhs-quicksort.c?raw';
import type { ShjLanguage } from '@speed-highlight/core/index';
import { writable } from 'svelte/store';

export const lhs = writable(LhsPlaceholderText);
export const ctr = writable(CtrPlaceholderText);
export const rhs = writable(RhsPlaceholderText);
export const component = writable<'mismerge2' | 'mismerge3'>('mismerge3');
export const language = writable<ShjLanguage>('c');
export const wrapLines = writable<boolean>(false);
export const disableMerging = writable<boolean>(false);
export const disableFooter = writable<boolean>(false);
export const ignoreWhitespace = writable<boolean>(false);
export const ignoreCase = writable<boolean>(false);
