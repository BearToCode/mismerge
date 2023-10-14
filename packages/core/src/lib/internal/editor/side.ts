/**
 * Represent one side of the editor.
 */
export abstract class Side {
	public abstract eq(side: typeof this): boolean;
	public abstract isOnTheRightOf(side: typeof this): boolean;
	public abstract isOnTheLeftOf(side: typeof this): boolean;
}

/**
 * Side of the editor in one-way mode (2 panes).
 */
export class OneWaySide extends Side {
	public static get lhs(): OneWaySide {
		return new OneWaySide('lhs');
	}
	public static get rhs(): OneWaySide {
		return new OneWaySide('rhs');
	}

	constructor(private readonly side: 'lhs' | 'rhs') {
		super();
	}

	public eq(side: OneWaySide): boolean {
		return side.side == this.side;
	}

	public opposite() {
		if (this.side == 'lhs') return OneWaySide.rhs;
		return OneWaySide.lhs;
	}

	public isOnTheRightOf(side: this): boolean {
		return this.eq(OneWaySide.rhs) && side.eq(OneWaySide.lhs);
	}

	public isOnTheLeftOf(side: this): boolean {
		return this.eq(OneWaySide.lhs) && side.eq(OneWaySide.rhs);
	}
}

/**
 * Side of the editor in two-way mode (3 panes).
 */
export class TwoWaySide extends Side {
	public static get lhs(): TwoWaySide {
		return new TwoWaySide('lhs');
	}
	public static get ctr(): TwoWaySide {
		return new TwoWaySide('ctr');
	}
	public static get rhs(): TwoWaySide {
		return new TwoWaySide('rhs');
	}

	constructor(private readonly side: 'lhs' | 'ctr' | 'rhs') {
		super();
	}

	public eq(side: TwoWaySide): boolean {
		return this.side == side.side;
	}

	public adjacentSides(): TwoWaySide[] {
		switch (this.side) {
			case 'lhs':
				return [new TwoWaySide('ctr')];
			case 'ctr':
				return [new TwoWaySide('lhs'), new TwoWaySide('rhs')];
			case 'rhs':
				return [new TwoWaySide('ctr')];
		}
	}

	public isOnTheRightOf(side: this): boolean {
		return (
			(this.eq(TwoWaySide.rhs) && side.eq(TwoWaySide.ctr)) ||
			(this.eq(TwoWaySide.ctr) && side.eq(TwoWaySide.lhs))
		);
	}

	public isOnTheLeftOf(side: this): boolean {
		return (
			(this.eq(TwoWaySide.lhs) && side.eq(TwoWaySide.ctr)) ||
			(this.eq(TwoWaySide.ctr) && side.eq(TwoWaySide.rhs))
		);
	}
}
