// @vitest-environment jsdom

import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { afterEach, expect, test, vi } from 'vitest';
import Header from '$lib/components/layout/Header.svelte';

afterEach(() => {
	cleanup();
});

test('global accept buttons stay enabled without a selected block', async () => {
	const onacceptleft = vi.fn();
	const onacceptright = vi.fn();
	const { container, getByRole } = render(Header, {
		blocks: [],
		components: [],
		container: undefined,
		acceptMode: 'all',
		onacceptleft,
		onacceptright
	});

	const acceptLeft = getByRole('button', { name: 'Accept left' });
	const acceptRight = getByRole('button', { name: 'Accept right' });
	const leftPane = container.querySelector('.msm__header-content-pane-start');
	const rightPane = container.querySelector('.msm__header-content-pane-end');

	expect((acceptLeft as HTMLButtonElement).disabled).toBe(false);
	expect((acceptRight as HTMLButtonElement).disabled).toBe(false);
	expect(leftPane?.contains(acceptLeft)).toBe(true);
	expect(rightPane?.contains(acceptRight)).toBe(true);

	await fireEvent.click(acceptLeft);
	await fireEvent.click(acceptRight);

	expect(onacceptleft).toHaveBeenCalledOnce();
	expect(onacceptright).toHaveBeenCalledOnce();
});