import LhsPlaceholderText from '$lib/placeholder/lhs-quicksort.c?raw';
import CtrPlaceholderText from '$lib/placeholder/ctr-quicksort.c?raw';
import RhsPlaceholderText from '$lib/placeholder/rhs-quicksort.c?raw';
import { writable, type Writable } from 'svelte/store';
import type { BundledLanguage } from 'shiki';

type ComponentType = 'mismerge2' | 'mismerge3';

const defaultComponent = 'mismerge3' as const;
const defaultLanguage = 'c' as const satisfies BundledLanguage;
const defaultWrapLines = false;
const defaultFixedHeight = false;
const defaultSyncHorizontalScroll = false;
const defaultDisableMerging = false;
const defaultDisableFooter = false;
const defaultDisableHeader = false;
const defaultDisableSyntaxHighlighting = false;
const defaultIgnoreWhitespace = false;
const defaultIgnoreCase = false;
const defaultTheme = 'light' as const;
const demoStorageKeys = [
	'lhs',
	'ctr',
	'rhs',
	'component',
	'language',
	'wrapLines',
	'fixedHeight',
	'syncHorizontalScroll',
	'disableMerging',
	'disableFooter',
	'disableHeader',
	'disableSyntaxHighlighting',
	'ignoreWhitespace',
	'ignoreCase',
	'theme'
] as const;

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

export const lhsPlaceholder = LhsPlaceholderText;
export const ctrPlaceholder = CtrPlaceholderText;
export const rhsPlaceholder = RhsPlaceholderText;

export const lhs = writableWithLocalStorage('lhs', lhsPlaceholder);
export const ctr = writableWithLocalStorage('ctr', ctrPlaceholder);
export const rhs = writableWithLocalStorage('rhs', rhsPlaceholder);
export const component = writableWithLocalStorage<ComponentType>('component', defaultComponent);
export const language = writableWithLocalStorage<BundledLanguage>('language', defaultLanguage);
export const wrapLines = writableWithLocalStorage<boolean>('wrapLines', defaultWrapLines);
export const fixedHeight = writableWithLocalStorage<boolean>('fixedHeight', defaultFixedHeight);
export const syncHorizontalScroll = writableWithLocalStorage<boolean>(
	'syncHorizontalScroll',
	defaultSyncHorizontalScroll
);
export const disableMerging = writableWithLocalStorage<boolean>(
	'disableMerging',
	defaultDisableMerging
);
export const disableFooter = writableWithLocalStorage<boolean>('disableFooter', defaultDisableFooter);
export const disableHeader = writableWithLocalStorage<boolean>('disableHeader', defaultDisableHeader);
export const disableSyntaxHighlighting = writableWithLocalStorage<boolean>(
	'disableSyntaxHighlighting',
	defaultDisableSyntaxHighlighting
);
export const ignoreWhitespace = writableWithLocalStorage<boolean>(
	'ignoreWhitespace',
	defaultIgnoreWhitespace
);
export const ignoreCase = writableWithLocalStorage<boolean>('ignoreCase', defaultIgnoreCase);
export const theme = writableWithLocalStorage<'light' | 'dark'>('theme', defaultTheme);

export function clearDemoLocalStorage() {
	if (typeof localStorage === 'undefined') return;
	for (const key of demoStorageKeys) {
		localStorage.removeItem(key);
	}
}

export function resetDemoState() {
	lhs.set(lhsPlaceholder);
	ctr.set(ctrPlaceholder);
	rhs.set(rhsPlaceholder);
	component.set(defaultComponent);
	language.set(defaultLanguage);
	wrapLines.set(defaultWrapLines);
	fixedHeight.set(defaultFixedHeight);
	syncHorizontalScroll.set(defaultSyncHorizontalScroll);
	disableMerging.set(defaultDisableMerging);
	disableFooter.set(defaultDisableFooter);
	disableHeader.set(defaultDisableHeader);
	disableSyntaxHighlighting.set(defaultDisableSyntaxHighlighting);
	ignoreWhitespace.set(defaultIgnoreWhitespace);
	ignoreCase.set(defaultIgnoreCase);
	theme.set(defaultTheme);
}
