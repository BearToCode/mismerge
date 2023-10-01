import { TwoWaySide, OneWaySide } from '$lib/internal/editor/side';
import { test, expect } from 'vitest';

test('one-way-side relative positions', () => {
	const lhs = OneWaySide.lhs;
	const rhs = OneWaySide.rhs;

	expect(lhs.isOnTheLeftOf(rhs));
	expect(rhs.isOnTheRightOf(lhs));

	expect(!lhs.isOnTheLeftOf(lhs));
	expect(!rhs.isOnTheLeftOf(rhs));

	expect(!lhs.isOnTheRightOf(lhs));
	expect(!rhs.isOnTheRightOf(rhs));
});

test('one-way-side eq', () => {
	expect(OneWaySide.lhs.eq(OneWaySide.lhs));
	expect(!OneWaySide.rhs.eq(OneWaySide.lhs));
	expect(OneWaySide.rhs.eq(OneWaySide.rhs));
	expect(!OneWaySide.lhs.eq(OneWaySide.rhs));
});

test('two-way-side relative positions', () => {
	const lhs = TwoWaySide.lhs;
	const ctr = TwoWaySide.ctr;
	const rhs = TwoWaySide.rhs;

	expect(lhs.isOnTheLeftOf(ctr));
	expect(!lhs.isOnTheLeftOf(rhs));
	expect(ctr.isOnTheLeftOf(rhs));
	expect(!ctr.isOnTheLeftOf(lhs));
	expect(!rhs.isOnTheLeftOf(ctr));
	expect(!rhs.isOnTheLeftOf(lhs));

	expect(!lhs.isOnTheLeftOf(lhs));
	expect(!ctr.isOnTheLeftOf(ctr));
	expect(!rhs.isOnTheLeftOf(rhs));

	expect(rhs.isOnTheRightOf(ctr));
	expect(!rhs.isOnTheRightOf(lhs));
	expect(ctr.isOnTheRightOf(lhs));
	expect(!ctr.isOnTheLeftOf(rhs));
	expect(!lhs.isOnTheRightOf(ctr));
	expect(!lhs.isOnTheRightOf(lhs));

	expect(!lhs.isOnTheRightOf(lhs));
	expect(!ctr.isOnTheRightOf(ctr));
	expect(!rhs.isOnTheRightOf(rhs));
});

test('two-way-side eq', () => {
	expect(TwoWaySide.lhs.eq(TwoWaySide.lhs));
	expect(!TwoWaySide.ctr.eq(TwoWaySide.lhs));
	expect(TwoWaySide.ctr.eq(TwoWaySide.ctr));
	expect(!TwoWaySide.lhs.eq(TwoWaySide.ctr));
	expect(!TwoWaySide.rhs.eq(TwoWaySide.lhs));
	expect(!TwoWaySide.rhs.eq(TwoWaySide.ctr));
	expect(TwoWaySide.rhs.eq(TwoWaySide.rhs));
	expect(!TwoWaySide.lhs.eq(TwoWaySide.rhs));
});
