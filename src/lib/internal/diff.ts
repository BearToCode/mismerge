import { diffLines } from 'diff';
import { TwoWaySide } from './side';

export type OneWayChange = {
	content: string;
	lhs: boolean;
	rhs: boolean;
};

export type TwoWayChange = {
	content: string;
	lhs: boolean;
	ctr: boolean;
	rhs: boolean;
};

export function sidesFromOneWayChange(change: OneWayChange): TwoWaySide[] {
	const sides: TwoWaySide[] = [];
	if (change.lhs) sides.push(TwoWaySide.lhs);
	if (change.rhs) sides.push(TwoWaySide.rhs);
	return sides;
}

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

export function OneWayDiff(lhs: string, rhs: string): OneWayChange[] {
	const lhsRemapped = remapEoF(lhs);
	const rhsRemapped = remapEoF(rhs);

	const baseDiff = diffLines(lhsRemapped, rhsRemapped);

	const diff = baseDiff.map((change) => ({
		content: change.value,
		lhs: change.removed || !change.added,
		rhs: change.added || !change.removed
	}));

	return diff;
}

export function TwoWayDiff(lhs: string, ctr: string, rhs: string): TwoWayChange[] {
	const lhsBaseDiff = OneWayDiff(lhs, ctr);
	const rhsBaseDiff = OneWayDiff(ctr, rhs);

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
