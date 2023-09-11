import { diffChars, diffWords, diffWordsWithSpace } from 'diff';

export type LineDiffAlgorithm = 'characters' | 'words' | 'words_with_space';

/**
 * Get the corresponding diff algorithm from its type.
 * @param type The algorithm type.
 * @returns The diff algorithm.
 */
export function getLineDiffAlgorithm(type: LineDiffAlgorithm) {
	switch (type) {
		case 'characters':
			return diffChars;
		case 'words':
			return diffWords;
		case 'words_with_space':
			return diffWordsWithSpace;
	}
}
