import { ACTIONS_KEYS, CONTROL_KEY } from '../../../configs/action-keys.js';

/**
 * @typedef {'LEFT' | 'DOWN' | 'RIGHT' | 'UP' | 'SKILL_SP' | 'SKILL_1' | 'SKILL_2' | 'SKILL_ULTIMATE' | 'TOGGLE_AUTO_ATK'} ActionKey
 * @typedef {Exclude<ActionKey, 'TOGGLE_AUTO_ATK'>} BattleActionKey
 */

export default class BattleInputManager {
	/**
	 * @param {{ emit: (event: 'mouse-event' | 'key-event', ...data: any) => void }} [emitter]
	 */
	constructor(emitter) {
		/** @type {{ mouseX: number, mouseY: number, leftMouseDown: boolean, rightMouseDown: boolean }} */
		this.mouseState = {
			mouseX: 0,
			mouseY: 0,
			leftMouseDown: false,
			rightMouseDown: false,
		};

		/** @type {Record<BattleActionKey, boolean>} */
		this.actionState = {
			[ACTIONS_KEYS['LEFT']]: false,
			[ACTIONS_KEYS['DOWN']]: false,
			[ACTIONS_KEYS['RIGHT']]: false,
			[ACTIONS_KEYS['UP']]: false,
			[ACTIONS_KEYS['SKILL_SP']]: false,
			[ACTIONS_KEYS['SKILL_1']]: false,
			[ACTIONS_KEYS['SKILL_2']]: false,
			[ACTIONS_KEYS['SKILL_ULTIMATE']]: false,
		};

		/** @type {AbortController | null} */
		this.abortController = null;
		this.emitter = emitter;
	}

	/**@private */
	_emitMouseState() {
		this.emitter?.emit('mouse-event', this.mouseState);
	}

	/**@private */
	_emitActionState() {
		this.emitter?.emit('key-event', this.actionState);
	}

	/**
	 * @private
	 * @param {MouseEvent} event
	 */
	_onMouseMove(event) {
		this.mouseState.mouseX = event.clientX;
		this.mouseState.mouseY = event.clientY;
		this._emitMouseState();
	}

	/**
	 * - ***Note***: event.button values:
	 *   - 0: Left mouse button
	 *   - 1: Middle mouse button (usually the scroll wheel)
	 *   - 2: Right mouse button
	 *
	 * @private
	 * @param {MouseEvent} event
	 */
	_onMouseDown(event) {
		if (event.button === 0) {
			this.mouseState.leftMouseDown = true;
			this._emitMouseState();
		} else if (event.button === 2) {
			this.mouseState.rightMouseDown = true;
			this._emitMouseState();
		}
	}

	/**
	 * @private
	 * @param {MouseEvent} event
	 */
	_onMouseUp(event) {
		if (event.button === 0) {
			this.mouseState.leftMouseDown = false;
			this._emitMouseState();
		} else if (event.button === 2) {
			this.mouseState.rightMouseDown = false;
			this._emitMouseState();
		}
	}

	/**
	 * @private
	 * @param {KeyboardEvent} event
	 */
	_onKeyDown(event) {
		const controlAction = CONTROL_KEY[event.key.toUpperCase()];
		if (controlAction && controlAction in this.actionState) {
			// controlAction is guaranteed to be a BattleActionKey since it exists in actionState
			this.actionState[/** @type {BattleActionKey} */ (controlAction)] = true;
			this._emitActionState();
		}
	}

	/**
	 * @private
	 * @param {KeyboardEvent} event
	 */
	_onKeyUp(event) {
		const controlAction = CONTROL_KEY[event.key.toUpperCase()];
		if (controlAction && controlAction in this.actionState) {
			// controlAction is guaranteed to be a BattleActionKey since it exists in actionState
			this.actionState[/** @type {BattleActionKey} */ (controlAction)] = false;
			this._emitActionState();
		}
	}

	listen() {
		this.abortController = new AbortController();
		const signal = this.abortController.signal;

		window.addEventListener('contextmenu', (event) => event.preventDefault(), { signal });
		document.addEventListener('mousemove', this._onMouseMove.bind(this), { signal });
		document.addEventListener('mousedown', this._onMouseDown.bind(this), { signal });
		document.addEventListener('mouseup', this._onMouseUp.bind(this), { signal });
		document.addEventListener('keydown', this._onKeyDown.bind(this), { signal });
		document.addEventListener('keyup', this._onKeyUp.bind(this), { signal });
	}

	destroy() {
		this.abortController?.abort();
		this.abortController = null;
	}
}
