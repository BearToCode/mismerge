/**
 * Join a partial object with its default values.
 * @param partial The partial object.
 * @param defaults Its default values.
 * @returns The joined values.
 */
export function joinWithDefault<T extends object>(partial: Partial<T>, defaults: T): T {
	return Object.assign({}, defaults, partial);
}

/**
 * Returns the type of the elements of an array.
 */
export type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type MaybeArray<T> = T | T[];

/**
 * Get whether the two sets contain the same elements.
 * @param a First set.
 * @param b Second set.
 * @returns Whether the two sets are equal.
 */
export const eqSet = <T>(a: Set<T>, b: Set<T>) =>
	a.size === b.size && [...a].every((x) => b.has(x));
