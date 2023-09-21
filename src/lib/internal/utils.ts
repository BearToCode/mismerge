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
