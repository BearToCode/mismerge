import { joinWithDefault } from '../utils';

interface HistoryState {
	timestamp: Date;
	value: string;
	cursor: number;
}

export interface HistoryOptions {
	/**
	 * Minimum interval between save states in ms.
	 * @default 300ms
	 */
	minInterval: number;
	/**
	 * Maximum history size in bytes.
	 * @default 1MB
	 */
	maxSize: number;
}

const DefaultHistoryOptions: HistoryOptions = {
	minInterval: 300,
	maxSize: 1_000_000
};

/**
 * Input undo/redo functionality.
 */
export class InputHistory {
	private states: HistoryState[] = [];
	private currentIndex = -1; // Only <= 0 numbers
	private readonly options: HistoryOptions;
	constructor(options?: Partial<HistoryOptions>) {
		this.options = joinWithDefault(options ?? {}, DefaultHistoryOptions);
	}

	/**
	 * Rollback to the previous state.
	 * @returns The previous state, if any.
	 */
	public undo(): HistoryState | undefined {
		if (-this.currentIndex > this.states.length) return; // Cannot go back
		const prev = this.states.at(this.currentIndex - 1);
		if (!prev) return undefined;
		this.currentIndex--;
		return prev;
	}

	/**
	 * Move forward one state.
	 * @returns The successive value, if any.
	 */
	public redo(): HistoryState | undefined {
		if (this.currentIndex >= -1) return; // Cannot go forward
		const next = this.states.at(this.currentIndex + 1);
		if (!next) return undefined;
		this.currentIndex++;
		return next;
	}

	/**
	 * Get current stored history in bytes.
	 */
	public getSize = () => this.states.reduce<number>((acc, curr) => acc + curr.value.length * 2, 0);

	/**
	 * Save a value into history.
	 * @param value The value to save.
	 * @param cursor Cursor position.
	 */
	public saveState(value: string, cursor: number) {
		const latest = this.states.at(-1);
		if (latest?.value === value && latest.cursor === cursor) return;

		if (this.currentIndex < -1) {
			// Remove history
			this.states = this.states.slice(0, this.currentIndex + 1);
		}
		this.currentIndex = -1;

		if (latest && Date.now() - latest.timestamp.getTime() <= this.options.minInterval) {
			this.states.pop();
		}

		let size = this.getSize();

		this.states.push({
			timestamp: new Date(),
			cursor,
			value
		});

		// every char is 2 bytes
		size += value.length * 2;

		while (size > this.options.maxSize) {
			const removed = this.states.shift();
			if (!removed) break; // This should never happen
			size -= removed.value.length * 2;
		}
	}
}
