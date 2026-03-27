// @vitest-environment jsdom

import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
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