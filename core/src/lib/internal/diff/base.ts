import { diffLines, type LinesOptions } from 'diff';
import { TwoWaySide } from '../editor/side';

/**
 * A line content along with the lines where it is present.
 * One-way mode.
 */
export type OneWayChange = {
	content: string;
	lhs: boolean;
	rhs: boolean;
};

/**
 * A line content along with the lines where it is present.
 * Two-way mode.
 */
export type TwoWayChange = {
	content: string;
	lhs: boolean;
	ctr: boolean;
	rhs: boolean;
};

/**
 * Get the sides where the change is present.
 * @param change The one-way change.
 * @returns An array of sides that have changed.
 */
export function sidesFromOneWayChange(change: OneWayChange): TwoWaySide[] {
	const sides: TwoWaySide[] = [];
	if (change.lhs) sides.push(TwoWaySide.lhs);
	if (change.rhs) sides.push(TwoWaySide.rhs);
	return sides;
}

/**
 * Get the sides where the change is present.
 * @param change The two-way change.
 * @returns An array of sides that have changed.
 */
export function sidesFromTwoWayChange(change: TwoWayChange): TwoWaySide[] {
	const sides: TwoWaySide[] = [];
	if (change.lhs) sides.push(TwoWaySide.lhs);
	if (change.ctr) sides.push(TwoWaySide.ctr);
	if (change.rhs) sides.push(TwoWaySide.rhs);
	return sides;
}

function remapEoF(str: string) {
	return str.replaceAll('\r\n', '\n').replaceAll('\n', '\r\n') + '\r\n';
}

/**
 * Generate lines diff between two strings.
 * @param lhs Left hand side content.
 * @param rhs Right hand side content.
 * @param opts Diff options.
 * @returns Diff between the two strings.
 */
export function oneWayDiff(lhs: string, rhs: string, opts?: LinesOptions): OneWayChange[] {
	const lhsRemapped = remapEoF(lhs);
	const rhsRemapped = remapEoF(rhs);

	// Using the ignore whitespace option of diff.js just remove the whitespace
	// from the changes, instead we keep it and ignore modified blocks that
	// are the same after removing the whitespace.
	const baseDiff = diffLines(lhsRemapped, rhsRemapped, {
		ignoreCase: opts?.ignoreCase
	});

	const diff = baseDiff.map((change) => ({
		content: change.value,
		lhs: change.removed || !change.added,
		rhs: change.added || !change.removed
	}));

	return diff;
}

/**
 * Generate lines diff between three strings.
 * @param lhs Left hand side content.
 * @param ctr Center content.
 * @param rhs Right hand side content.
 * @param opts Diff options.
 * @returns Diff between the three strings.
 */
export function twoWayDiff(
	lhs: string,
	ctr: string,
	rhs: string,
	opts?: LinesOptions
): TwoWayChange[] {
	const lhsBaseDiff = oneWayDiff(lhs, ctr, opts);
	const rhsBaseDiff = oneWayDiff(ctr, rhs, opts);

	const changes: TwoWayChange[] = [];

	const lhsLinesChanges = splitChangesIntoLines(lhsBaseDiff);
	const rhsLinesChanges = splitChangesIntoLines(rhsBaseDiff);

	let lhsIndex = 0;
	let rhsIndex = 0;
	while (lhsIndex < lhsLinesChanges.length || rhsIndex < rhsLinesChanges.length) {
		let lhsChange: OneWayChange | undefined;
		let rhsChange: OneWayChange | undefined;

		for (; (lhsChange = lhsLinesChanges.at(lhsIndex)) && !lhsChange.rhs; lhsIndex++) {
			// LHS added changes
			changes.push({
				content: lhsChange.content,
				lhs: true,
				ctr: false,
				rhs: false
			});
		}

		for (; (rhsChange = rhsLinesChanges.at(rhsIndex)) && !rhsChange.lhs; rhsIndex++) {
			// RHS added change
			changes.push({
				content: rhsChange.content,
				rhs: true,
				ctr: false,
				lhs: false
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

function splitChangesIntoLines(changes: OneWayChange[]): OneWayChange[] {
	return changes
		.map((change) =>
			removeEndOfLine(change.content)
				.split('\r\n')
				.map((line) => ({
					content: line + '\r\n',
					lhs: change.lhs,
					rhs: change.rhs
				}))
		)
		.flat();
}

function removeEndOfLine(string: string) {
	return string.endsWith('\r\n') ? string.slice(0, -2) : string;
}
