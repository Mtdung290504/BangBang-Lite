import { ACTIONS_KEYS, CONTROL_KEY } from '../../configs/action-keys.js';

export default class BattleInputManager {
	constructor() {
		this.mouseState = {
			mouseX: 0,
			mouseY: 0,
			leftMouseDown: false,
			rightMouseDown: false,
		};

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
	}

	/**
	 * @private
	 * @param {MouseEvent} event
	 */
	_onMouseMove(event) {
		this.mouseState.mouseX = event.clientX;
		this.mouseState.mouseY = event.clientY;
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
		} else if (event.button === 2) {
			this.mouseState.rightMouseDown = true;
		}
	}

	/**
	 * @private
	 * @param {MouseEvent} event
	 */
	_onMouseUp(event) {
		if (event.button === 0) {
			this.mouseState.leftMouseDown = false;
		} else if (event.button === 2) {
			this.mouseState.rightMouseDown = false;
		}
	}

	/**
	 * @private
	 * @param {KeyboardEvent} event
	 */
	_onKeyDown(event) {
		const actionKey = ACTIONS_KEYS[CONTROL_KEY[event.key.toUpperCase()]];
		if (actionKey) {
			this.actionState[actionKey] = true;
		}
	}

	/**
	 * @private
	 * @param {KeyboardEvent} event
	 */
	_onKeyUp(event) {
		const actionKey = ACTIONS_KEYS[CONTROL_KEY[event.key.toUpperCase()]];
		if (actionKey) {
			this.actionState[actionKey] = false;
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
