import { diffChars, diffWords, diffWordsWithSpace } from 'diff';
import { get, writable, type Writable } from 'svelte/store';

export type LineDiffAlgorithm = 'characters' | 'words' | 'words_with_space';

type LinePart = {
	content: string;
	overlay: boolean;
};

export type LineDiff = {
	parts: LinePart[];
	number: number;
};

/**
 * Get the corresponding diff algorithm from its type.
 * @param type The algorithm type.
 * @returns The diff algorithm.
 */
export function getLineDiffAlgorithm(type: LineDiffAlgorithm) {
	switch (type) {
		case 'characters':
			return diffChars;
		case 'words':
			return diffWords;
		case 'words_with_space':
			return diffWordsWithSpace;
	}
}

export function diff2Sides(
	lhs: string,
	rhs: string,
	options?: {
		algorithm?: LineDiffAlgorithm;
		lhsLineNumber?: Writable<number>;
		rhsLineNumber?: Writable<number>;
	}
) {
	const lhsLineNumber = options?.lhsLineNumber ?? writable(1);
	const rhsLineNumber = options?.rhsLineNumber ?? writable(1);
	const diffAlgorithm = getLineDiffAlgorithm(options?.algorithm ?? 'words_with_space');

	const getAndUpdate = (store: Writable<number>) => {
		const value = get(store);
		store.update((value) => value + 1);
		return value;
	};

	const lhsLines: LineDiff[] = [{ number: getAndUpdate(lhsLineNumber), parts: [] }];
	const rhsLines: LineDiff[] = [{ number: getAndUpdate(rhsLineNumber), parts: [] }];

	const diff = diffAlgorithm(lhs, rhs)
		// Split diffs that include newlines into multiple diffs
		// For example:
		// "This \n is \n a change" => ["This \n" + "is \n", "a change"]
		.map((change) =>
			change.value.split('\n').map((line, index, lines) => ({
				...change,
				value: line + (index == lines.length - 1 ? '' : '\n')
			}))
		)
		.flat();

	for (const change of diff) {
		const lastLhsLine = lhsLines[lhsLines.length - 1];
		const lastRhsLine = rhsLines[rhsLines.length - 1];

		if (change.value == '') continue;

		if (!change.added) {
			lastLhsLine.parts.push({
				content: change.value,
				overlay: !!change.removed
			});
			if (change.value.endsWith('\n')) {
				lhsLines.push({ number: getAndUpdate(lhsLineNumber), parts: [] });
			}
		}
		if (!change.removed) {
			lastRhsLine.parts.push({
				content: change.value,
				overlay: !!change.added
			});
			if (change.value.endsWith('\n')) {
				rhsLines.push({ number: getAndUpdate(rhsLineNumber), parts: [] });
			}
		}
	}

	if (lhsLines[lhsLines.length - 1].parts.length == 0) {
		lhsLineNumber.update((v) => v - 1);
		lhsLines.pop();
	}
	if (rhsLines[rhsLines.length - 1].parts.length == 0) {
		rhsLineNumber.update((v) => v - 1);
		rhsLines.pop();
	}

	return {
		lhs: lhsLines,
		rhs: rhsLines
	};
}
