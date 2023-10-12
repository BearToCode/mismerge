import LhsPlaceholderText from '$lib/placeholder/lhs-quicksort.c?raw';
import CtrPlaceholderText from '$lib/placeholder/ctr-quicksort.c?raw';
import RhsPlaceholderText from '$lib/placeholder/rhs-quicksort.c?raw';
import type { ShjLanguage } from '@speed-highlight/core/index';
import { writable, type Writable } from 'svelte/store';

type ComponentType = 'mismerge2' | 'mismerge3';

function writableWithLocalStorage<T>(key: string, defaultValue: T) {
	if (typeof localStorage === 'undefined') {
		return writable<T>(defaultValue);
	}

	let store: Writable<T>;
	const value = localStorage.getItem(key);
	if (value) {
		try {
			const parsed = JSON.parse(value) as T;
			store = writable<T>(parsed);
		} catch {
			store = writable<T>(defaultValue);
		}
	} else {
		store = writable<T>(defaultValue);
	}

	store.subscribe((value) => localStorage.setItem(key, JSON.stringify(value)));
	return store;
}

export const lhs = writableWithLocalStorage('lhs', LhsPlaceholderText);
export const ctr = writableWithLocalStorage('ctr', CtrPlaceholderText);
export const rhs = writableWithLocalStorage('rhs', RhsPlaceholderText);
export const component = writableWithLocalStorage<ComponentType>('component', 'mismerge3');
export const language = writableWithLocalStorage<ShjLanguage>('language', 'c');
export const wrapLines = writableWithLocalStorage<boolean>('wrapLines', false);
export const disableMerging = writableWithLocalStorage<boolean>('disableMerging', false);
export const disableFooter = writableWithLocalStorage<boolean>('disableFooter', false);
export const ignoreWhitespace = writableWithLocalStorage<boolean>('ignoreWhitespace', false);
export const ignoreCase = writableWithLocalStorage<boolean>('ignoreCase', false);
export const theme = writableWithLocalStorage<'light' | 'dark'>('theme', 'light');
