export const countWords = (text: string) =>
	text.trim() == '' ? 0 : text.trim().split(/\s+/).length;
export const countChars = (text: string) => text.length;
