import { twoWayDiff, oneWayDiff } from '$lib/internal/diff';
import { expect, test } from 'vitest';
import dedent from 'dedent';

test('one-way-diff empty', () => {
	const diff = oneWayDiff('', '');
	expect(diff.at(0)).toMatchObject({ content: '\r\n', lhs: true, rhs: true });
});

test('one-way-diff lhs addition', () => {
	const diff = oneWayDiff(
		dedent`1
           2
           3`,
		dedent`1
           2`
	);
	expect(diff.at(0)).toMatchObject({ content: '1\r\n2\r\n', lhs: true, rhs: true });
	expect(diff.at(1)).toMatchObject({ content: '3\r\n', lhs: true, rhs: false });
});

test('one-way-diff rhs addition', () => {
	const diff = oneWayDiff(
		dedent`1
           2`,
		dedent`1
           2
           3`
	);
	expect(diff.at(0)).toMatchObject({ content: '1\r\n2\r\n', lhs: true, rhs: true });
	expect(diff.at(1)).toMatchObject({ content: '3\r\n', lhs: false, rhs: true });
});

test('one-way-diff edit', () => {
	const diff = oneWayDiff(
		dedent`1
           a
           3`,
		dedent`1
           b
           3`
	);
	expect(diff.at(0)).toMatchObject({ content: '1\r\n', lhs: true, rhs: true });
	expect(diff.at(1)).toMatchObject({ content: 'a\r\n', lhs: true, rhs: false });
	expect(diff.at(2)).toMatchObject({ content: 'b\r\n', lhs: false, rhs: true });
	expect(diff.at(3)).toMatchObject({ content: '3\r\n', lhs: true, rhs: true });
});

test('one-way-diff unchanged', () => {
	const diff = oneWayDiff(
		dedent`1
           2
           3`,
		dedent`1
           2
           3`
	);
	expect(diff.at(0)).toMatchObject({ content: '1\r\n2\r\n3\r\n', lhs: true, rhs: true });
});

test('one-way-diff starting lhs newline', () => {
	const diff = oneWayDiff(
		`
1`,
		dedent`1`
	);
	expect(diff.at(0)).toMatchObject({ content: '\r\n', lhs: true, rhs: false });
	expect(diff.at(1)).toMatchObject({ content: '1\r\n', lhs: true, rhs: true });
});

test('one-way-diff starting rhs newline', () => {
	const diff = oneWayDiff(
		dedent`1`,
		`
1`
	);
	expect(diff.at(0)).toMatchObject({ content: '\r\n', lhs: false, rhs: true });
	expect(diff.at(1)).toMatchObject({ content: '1\r\n', lhs: true, rhs: true });
});

test('two-way-diff empty', () => {
	const diff = twoWayDiff('', '', '');
	expect(diff.at(0)).toMatchObject({ content: '\r\n', lhs: true, ctr: true, rhs: true });
});

test('two-way-diff addition lhs', () => {
	const diff = twoWayDiff(
		dedent`1
           2
           3`,
		dedent`1
           2`,
		dedent`1
           2`
	);
	expect(diff.at(0)).toMatchObject({ content: '1\r\n2\r\n', lhs: true, ctr: true, rhs: true });
	expect(diff.at(1)).toMatchObject({ content: '3\r\n', lhs: true, ctr: false, rhs: false });
});

test('two-way-diff addition ctr', () => {
	const diff = twoWayDiff(
		dedent`1
					 2`,
		dedent`1
					 2
					 3`,
		dedent`1
					 2`
	);
	expect(diff.at(0)).toMatchObject({ content: '1\r\n2\r\n', lhs: true, ctr: true, rhs: true });
	expect(diff.at(1)).toMatchObject({ content: '3\r\n', lhs: false, ctr: true, rhs: false });
});

test('two-way-diff addition rhs', () => {
	const diff = twoWayDiff(
		dedent`1
					 2`,
		dedent`1
					 2`,
		dedent`1
					 2
					 3`
	);
	expect(diff.at(0)).toMatchObject({ content: '1\r\n2\r\n', lhs: true, ctr: true, rhs: true });
	expect(diff.at(1)).toMatchObject({ content: '3\r\n', lhs: false, ctr: false, rhs: true });
});

test('two-way-diff edit', () => {
	const diff = twoWayDiff(
		dedent`1
					 a
					 3`,
		dedent`1
					 b
					 3`,
		dedent`1
					 c
					 3`
	);
	expect(diff.at(0)).toMatchObject({ content: '1\r\n', lhs: true, ctr: true, rhs: true });
	expect(diff.at(1)).toMatchObject({ content: 'a\r\n', lhs: true, ctr: false, rhs: false });
	expect(diff.at(2)).toMatchObject({ content: 'b\r\n', lhs: false, ctr: true, rhs: false });
	expect(diff.at(3)).toMatchObject({ content: 'c\r\n', lhs: false, ctr: false, rhs: true });
	expect(diff.at(4)).toMatchObject({ content: '3\r\n', lhs: true, ctr: true, rhs: true });
});

test('two-way-diff unchanged', () => {
	const diff = twoWayDiff(
		dedent`1
					 2
					 3`,
		dedent`1
					 2
					 3`,
		dedent`1
					 2
					 3`
	);
	expect(diff.at(0)).toMatchObject({ content: '1\r\n2\r\n3\r\n', lhs: true, ctr: true, rhs: true });
});
