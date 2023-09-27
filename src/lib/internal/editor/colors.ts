/**
 * Colors used by the diff visualizer (one-way).
 */
export type DiffColors = {
	added: `#${string}`;
	addedOverlay: `#${string}`;
	removed: `#${string}`;
	removedOverlay: `#${string}`;
};

/**
 * Colors used by the editor (two-way).
 */
export type EditorColors = {
	added: `#${string}`;
	removed: `#${string}`;
	conflict: `#${string}`;
	modified: `#${string}`;
	modifiedOverlay: `#${string}`;
};

export const DefaultDiffColors: DiffColors = {
	added: '#d4eed4',
	addedOverlay: '#bee6bd',
	removed: '#fff2f0',
	removedOverlay: '#ffdfd8'
};

export const DefaultEditorColors: EditorColors = {
	added: '#d4eed4',
	removed: '#edeceb',
	conflict: '#fff2f0',
	modified: '#e4f4f5',
	modifiedOverlay: '#d3f0f2'
};