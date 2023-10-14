/**
 * Colors used by the editor (two-way).
 */
export type EditorColors = {
	added: `#${string}`;
	removed: `#${string}`;
	removedBothSides: `#${string}`;
	conflict: `#${string}`;
	resolvedConflict: `#${string}`;
	modified: `#${string}`;
	modifiedOverlay: `#${string}`;
};

export const DefaultLightColors: EditorColors = {
	added: '#d4eed4',
	removed: '#edeceb',
	removedBothSides: '#eae9e9',
	conflict: '#fff2f0',
	modified: '#e4f4f5',
	resolvedConflict: '#cfdcfa',
	modifiedOverlay: '#d3f0f2'
};

export const DefaultDarkColors: EditorColors = {
	added: '#314f33',
	removed: '#461717',
	removedBothSides: '#262222',
	conflict: '#461717',
	modified: '#2a3f4d',
	resolvedConflict: '#2c3e69',
	modifiedOverlay: '#30556e'
};
