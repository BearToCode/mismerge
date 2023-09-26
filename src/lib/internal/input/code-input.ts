import { eqSet } from '../utils';
import { InputHistory } from './history';

export class CodeInput {
	public readonly textarea: HTMLTextAreaElement;
	public readonly history: InputHistory;

	private pressedKeys = new Set<string>();
	private shouldSave = false;

	constructor(textarea: HTMLTextAreaElement) {
		this.textarea = textarea;
		this.history = new InputHistory();
		this.history.saveState(this.textarea.value, this.textarea.selectionStart);

		this.textarea.addEventListener('keyup', this.handleKeyUp.bind(this));
		this.textarea.addEventListener('keydown', this.handleKeyDown.bind(this));
		this.textarea.addEventListener('blur', this.clearPressedKeys.bind(this));
		this.textarea.addEventListener('focus', this.clearPressedKeys.bind(this));
	}

	public dispose() {
		this.textarea.removeEventListener('keyup', this.handleKeyUp);
		this.textarea.removeEventListener('keydown', this.handleKeyDown);
		this.textarea.removeEventListener('blur', this.clearPressedKeys);
		this.textarea.removeEventListener('focus', this.clearPressedKeys);
	}

	private clearPressedKeys = () => this.pressedKeys.clear();

	private handleKeyUp(e: KeyboardEvent) {
		const key = e.key.toLowerCase();
		this.pressedKeys.delete(key);

		if (this.shouldSave) this.history.saveState(this.textarea.value, this.textarea.selectionStart);
	}

	private handleKeyDown(e: KeyboardEvent) {
		const key = e.key.toLowerCase();
		this.pressedKeys.add(key);
		this.shouldSave = true;

		if (eqSet(this.pressedKeys, new Set(['control', 'z']))) {
			e.preventDefault();
			this.shouldSave = false;
			return this.undo();
		}

		if (eqSet(this.pressedKeys, new Set(['control', 'y']))) {
			e.preventDefault();
			this.shouldSave = false;
			return this.redo();
		}

		if (eqSet(this.pressedKeys, new Set(['tab']))) {
			e.preventDefault();
			return this.indent();
		}

		if (eqSet(this.pressedKeys, new Set(['shift', 'tab']))) {
			e.preventDefault();
			return this.removeIndentation();
		}
	}

	private undo() {
		const previousState = this.history.undo();
		if (!previousState) return;
		this.textarea.value = previousState.value;
		this.textarea.selectionStart = previousState.cursor;
		this.textarea.selectionEnd = previousState.cursor;
	}

	private redo() {
		const nextState = this.history.redo();
		if (!nextState) return;
		this.textarea.value = nextState.value;
		this.textarea.selectionStart = nextState.cursor;
		this.textarea.selectionEnd = nextState.cursor;
	}

	private indent() {
		const start = this.textarea.selectionStart;
		const end = this.textarea.selectionEnd;

		this.textarea.value =
			this.textarea.value.substring(0, start) + '\t' + this.textarea.value.substring(end);

		this.textarea.selectionStart = this.textarea.selectionEnd = start + 1;
	}

	private removeIndentation() {
		const cursor = this.textarea.selectionStart;

		let lineStartingIndex: number;
		for (
			lineStartingIndex = cursor;
			lineStartingIndex > 0 && this.textarea.value.at(lineStartingIndex - 1) !== '\n';
			lineStartingIndex--
		);

		const char = this.textarea.value[lineStartingIndex];
		if (char != '\t') return;

		this.textarea.value =
			this.textarea.value.substring(0, lineStartingIndex) +
			this.textarea.value.substring(lineStartingIndex + 1);

		this.textarea.selectionStart = cursor - 1;
		this.textarea.selectionEnd = cursor - 1;
	}
}
