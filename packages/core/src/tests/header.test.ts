// @vitest-environment jsdom

import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { afterEach, expect, test, vi } from 'vitest';
import Header from '$lib/components/layout/Header.svelte';
import { AddedBlock } from '$lib/internal/blocks/added';
import { OneWaySide } from '$lib/internal/editor/side';

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

	const acceptLeft = getByRole('button', { name: 'Accept All Incoming Changes from Left' });
	const acceptRight = getByRole('button', { name: 'Accept All Incoming Changes from Right' });
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

test('navigating highlights the active diff block', async () => {
	const firstBlock = new AddedBlock({
		sidesData: [{ side: OneWaySide.lhs, lines: [{ content: 'left one' }] }],
		placeholderSide: OneWaySide.rhs
	});
	const secondBlock = new AddedBlock({
		sidesData: [{ side: OneWaySide.lhs, lines: [{ content: 'left two' }] }],
		placeholderSide: OneWaySide.rhs
	});
	const firstComponents = [firstBlock.render()].flat();
	const secondComponents = [secondBlock.render()].flat();
	const components = [...firstComponents, ...secondComponents];
	const host = document.createElement('div');

	for (const component of components.filter((entry) => !entry.placeholder)) {
		const block = document.createElement('div');
		block.dataset.componentId = component.id;
		block.scrollIntoView = () => {};
		host.append(block);

		const gutter = document.createElement('div');
		gutter.dataset.componentId = component.id;
		host.append(gutter);
	}

	const { getByRole } = render(Header, {
		blocks: [firstBlock, secondBlock],
		components,
		container: host,
		acceptMode: 'current'
	});

	const nextButton = getByRole('button', { name: 'Next change' });

	await fireEvent.click(nextButton);

	expect(
		Array.from(host.querySelectorAll(`[data-component-id="${firstComponents[0].id}"]`)).every((element) =>
			element.classList.contains('msm__active-diff')
		)
	).toBe(true);
	expect(
		Array.from(host.querySelectorAll(`[data-component-id="${secondComponents[0].id}"]`)).every((element) =>
			!element.classList.contains('msm__active-diff')
		)
	).toBe(true);

	await fireEvent.click(nextButton);

	expect(
		Array.from(host.querySelectorAll(`[data-component-id="${firstComponents[0].id}"]`)).every((element) =>
			!element.classList.contains('msm__active-diff')
		)
	).toBe(true);
	expect(
		Array.from(host.querySelectorAll(`[data-component-id="${secondComponents[0].id}"]`)).every((element) =>
			element.classList.contains('msm__active-diff')
		)
	).toBe(true);
});