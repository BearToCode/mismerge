/**
 * Join a partial object with its default values.
 * @param partial The partial object.
 * @param defaults Its default values.
 * @returns The joined values.
 */
export function joinWithDefault<T extends object>(partial: Partial<T>, defaults: T): T {
	return Object.assign({}, defaults, partial);
}
