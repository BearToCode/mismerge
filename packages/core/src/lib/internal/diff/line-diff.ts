import { diffChars, diffWords, diffWordsWithSpace } from 'diff';

export type LineDiffAlgorithm = 'characters' | 'words' | 'words_with_space';

type LinePart = {
	content: string;
	overlay: boolean;
};

export type LineDiff = {
	parts: LinePart[];
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

/**
 * Computes the line diff between two strings.
 * @param lhs The left-hand side string to compare.
 * @param rhs The right-hand side string to compare.
 * @param options Optional configuration for the line diff algorithm.
 * @param options.algorithm The algorithm to use for the line diff. Defaults to 'words_with_space'.
 * @returns An object containing the line diff for the left-hand side and right-hand side strings.
 */
export function diff2Sides(
	lhs: string,
	rhs: string,
	options?: {
		algorithm?: LineDiffAlgorithm;
	}
) {
	const diffAlgorithm = getLineDiffAlgorithm(options?.algorithm ?? 'words_with_space');

	const lhsLines: LineDiff[] = [{ parts: [] }];
	const rhsLines: LineDiff[] = [{ parts: [] }];

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
				lhsLines.push({ parts: [] });
			}
		}
		if (!change.removed) {
			lastRhsLine.parts.push({
				content: change.value,
				overlay: !!change.added
			});
			if (change.value.endsWith('\n')) {
				rhsLines.push({ parts: [] });
			}
		}
	}

	if (lhsLines[lhsLines.length - 1].parts.length == 0) {
		lhsLines.pop();
	}
	if (rhsLines[rhsLines.length - 1].parts.length == 0) {
		rhsLines.pop();
	}

	return {
		lhs: lhsLines,
		rhs: rhsLines
	};
}

export function equalIgnoringWhitespace(a: string, b: string) {
	return a.replaceAll(/\s/g, '') == b.replaceAll(/\s/g, '');
}
