// @vitest-environment jsdom

import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
import AddedBlockComponent from '$lib/components/blocks/AddedBlock.svelte';
import { BlockComponent } from '$lib/internal/editor/component';
import { TwoWaySide } from '$lib/internal/editor/side';
import ViewUpdateHost from './fixtures/ViewUpdateHost.svelte';

class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

beforeAll(() => {
	vi.stubGlobal('ResizeObserver', ResizeObserverMock);
});

afterAll(() => {
	vi.unstubAllGlobals();
});

afterEach(() => {
	cleanup();
});

test('view update does not re-trigger the parent height callback', async () => {
	const onheightchange = vi.fn();
	const { getByRole } = render(ViewUpdateHost, { onheightchange });
	onheightchange.mockClear();

	await fireEvent.click(getByRole('button', { name: 'trigger update' }));

	expect(onheightchange).not.toHaveBeenCalled();
});

test('added block renderer uses the rendered component type for styling', () => {
	const component = new BlockComponent({
		component: AddedBlockComponent,
		blockId: 'accepted-source',
		props: {},
		side: TwoWaySide.lhs,
		type: 'added',
		linesCount: 1
	});

	const { container } = render(AddedBlockComponent, {
		component,
		lines: [{ content: 'accepted change' }]
	});

	const block = container.querySelector('.msm__block');

	expect(block?.classList.contains('added')).toBe(true);
	expect(block?.classList.contains('modified')).toBe(false);
});