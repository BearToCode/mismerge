import { diffChars, diffLines, diffWords, diffWordsWithSpace } from 'diff';

export type LineDiffAlgorithm = 'characters' | 'words' | 'words_with_space';

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

export type TwoWayChange = {
	content: string;
	lhs?: boolean;
	rhs?: boolean;
};

export type ThreeWayChange = {
	content: string;
	lhs?: boolean;
	ctr?: boolean;
	rhs?: boolean;
};

function remapEoF(str: string) {
	return str.replaceAll('\r\n', '\n').replaceAll('\n', '\r\n') + '\r\n';
}

export function twoWayDiff(lhs: string, rhs: string): TwoWayChange[] {
	const baseDiff = diffLines(remapEoF(lhs), remapEoF(rhs));
	return baseDiff.map((change) => ({
		content: change.value,
		lhs: change.removed || !change.added,
		rhs: change.added || !change.removed
	}));
}

export function threeWayDiff(lhs: string, ctr: string, rhs: string): ThreeWayChange[] {
	const lhsBaseDiff = twoWayDiff(lhs, ctr);
	const rhsBaseDiff = twoWayDiff(ctr, rhs);

	const changes: ThreeWayChange[] = [];

	const lhsLinesChanges = splitChangesIntoLines(lhsBaseDiff);
	const rhsLinesChanges = splitChangesIntoLines(rhsBaseDiff);

	let lhsIndex = 0;
	let rhsIndex = 0;
	while (lhsIndex < lhsLinesChanges.length || rhsIndex < rhsLinesChanges.length) {
		let lhsChange: TwoWayChange | undefined;
		let rhsChange: TwoWayChange | undefined;

		for (; (lhsChange = lhsLinesChanges.at(lhsIndex)) && !lhsChange.rhs; lhsIndex++) {
			// LHS added changes
			changes.push({
				content: lhsChange.content,
				lhs: true
			});
		}

		for (; (rhsChange = rhsLinesChanges.at(rhsIndex)) && !rhsChange.lhs; rhsIndex++) {
			// RHS added change
			changes.push({
				content: rhsChange.content,
				rhs: true
			});
		}

		// Common CTR change
		const lhsCenterChange = lhsLinesChanges.at(lhsIndex++);
		const rhsCenterChange = rhsLinesChanges.at(rhsIndex++);

		if (!lhsCenterChange || !rhsCenterChange) {
			console.assert(!lhsCenterChange && !rhsCenterChange, 'Unexpected center line');
			break;
		}

		console.assert(
			lhsCenterChange.content == rhsCenterChange.content,
			`Center changes content do not match`
		);

		changes.push({
			content: lhsCenterChange.content,
			lhs: lhsCenterChange.lhs,
			ctr: true,
			rhs: rhsCenterChange.rhs
		});
	}

	// Merge sequential
	for (let i = changes.length - 1; i > 0; i--) {
		const next = changes[i];
		const prev = changes[i - 1];
		if (
			JSON.stringify({ lhs: next.lhs, ctr: next.ctr, rhs: next.rhs }) ==
			JSON.stringify({ lhs: prev.lhs, ctr: prev.ctr, rhs: prev.rhs })
		) {
			prev.content += next.content;
			changes.splice(i, 1);
		}
	}

	return changes;
}

function splitChangesIntoLines(changes: TwoWayChange[]): TwoWayChange[] {
	return changes
		.map((change) =>
			removeEndOfLine(change.content)
				.split('\n')
				.map((line) => ({
					content: line + '\n',
					lhs: change.lhs,
					rhs: change.rhs
				}))
		)
		.flat();
}

function removeEndOfLine(string: string) {
	return string.endsWith('\n') ? string.slice(0, -1) : string;
}
