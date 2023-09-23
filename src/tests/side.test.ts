import { ThreeWaySide, TwoWaySide } from '$lib/internal/blocks';
import { test, expect } from 'vitest';

test('two-way-side relative positions', () => {
	const lhs = TwoWaySide.lhs;
	const rhs = TwoWaySide.rhs;

	expect(lhs.isOnTheLeftOf(rhs));
	expect(rhs.isOnTheRightOf(lhs));

	expect(!lhs.isOnTheLeftOf(lhs));
	expect(!rhs.isOnTheLeftOf(rhs));

	expect(!lhs.isOnTheRightOf(lhs));
	expect(!rhs.isOnTheRightOf(rhs));
});

test('two-way-side eq', () => {
	expect(TwoWaySide.lhs.eq(TwoWaySide.lhs));
	expect(!TwoWaySide.rhs.eq(TwoWaySide.lhs));
	expect(TwoWaySide.rhs.eq(TwoWaySide.rhs));
	expect(!TwoWaySide.lhs.eq(TwoWaySide.rhs));
});

test('three-way-side relative positions', () => {
	const lhs = ThreeWaySide.lhs;
	const ctr = ThreeWaySide.ctr;
	const rhs = ThreeWaySide.rhs;

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

test('three-way-side eq', () => {
	expect(ThreeWaySide.lhs.eq(ThreeWaySide.lhs));
	expect(!ThreeWaySide.ctr.eq(ThreeWaySide.lhs));
	expect(ThreeWaySide.ctr.eq(ThreeWaySide.ctr));
	expect(!ThreeWaySide.lhs.eq(ThreeWaySide.ctr));
	expect(!ThreeWaySide.rhs.eq(ThreeWaySide.lhs));
	expect(!ThreeWaySide.rhs.eq(ThreeWaySide.ctr));
	expect(ThreeWaySide.rhs.eq(ThreeWaySide.rhs));
	expect(!ThreeWaySide.lhs.eq(ThreeWaySide.rhs));
});
