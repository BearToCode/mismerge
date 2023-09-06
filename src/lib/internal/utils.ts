/**
 * Joins two objects, but only if the value in the partial object is undefined
 * @param partial Partial object to join
 * @param defaults Default object to join
 * @returns The joined object
 */
export function joinOnUndefined<T extends object>(partial: Partial<T>, defaults: T): T {
	return Object.assign({}, defaults, partial);
}
