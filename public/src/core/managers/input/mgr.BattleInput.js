import { ACTIONS_KEYS, CONTROL_KEY } from '../../../../configs/action-keys.js';

/**
 * @typedef {'LEFT' | 'DOWN' | 'RIGHT' | 'UP' | 'SKILL_SP' | 'SKILL_1' | 'SKILL_2' | 'SKILL_ULTIMATE' | 'TOGGLE_AUTO_ATK'} ActionKey
 * @typedef {Exclude<ActionKey, 'TOGGLE_AUTO_ATK'>} BattleActionKey
 */

export default class BattleInputManager {
	/**
	 * Khởi tạo input manager cho local player (chính mình)
	 * @overload
	 * @param {{ emit: (event: string, ...data: any) => void }} emitter
	 * @param {import('../graphic/mgr.Camera.js').default} camera
	 */
	/**
	 * Khởi tạo input manager cho remote player (người chơi khác)
	 * @overload
	 */
	/**
	 * @param {{ emit: (event: string, ...data: any) => void }} [emitter]
	 * @param {import('../graphic/mgr.Camera.js').default} [camera]
	 */
	constructor(emitter, camera) {
		this.mouseState = { x: 0, y: 0, leftMouseDown: false, rightMouseDown: false };

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

		/**@type {'local' | 'remote'} */
		this.type = this.emitter && this.camera ? 'local' : 'remote';
		this.emitter = emitter;
		this.camera = camera;
	}

	/**
	 * @private
	 */
	_emitMouseState() {
		this.emitter?.emit('mouse-event', this.mouseState);
	}

	/**
	 * @private
	 */
	_emitActionState() {
		this.emitter?.emit('key-event', this.actionState);
	}

	/**
	 * @private
	 * @param {MouseEvent} event
	 */
	_onMouseMove(event) {
		let { clientX, clientY } = event;

		if (this.type === 'local' && this.camera) {
			const { x, y } = this.camera.screenToWorld(clientX, clientY);
			clientX = x;
			clientY = y;
		}

		this.mouseState.x = clientX;
		this.mouseState.y = clientY;

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
	 * @param {string} key
	 * @returns {ActionKey | undefined}
	 */
	_mapKeyToAction(key) {
		const upper = key.toUpperCase();

		// Ưu tiên map qua CONTROL_KEY nếu có
		if (CONTROL_KEY[upper]) {
			return CONTROL_KEY[upper];
		}

		// Map trực tiếp arrow keys
		const arrowMap = {
			ArrowUp: ACTIONS_KEYS['UP'],
			ArrowDown: ACTIONS_KEYS['DOWN'],
			ArrowLeft: ACTIONS_KEYS['LEFT'],
			ArrowRight: ACTIONS_KEYS['RIGHT'],
		};

		// @ts-expect-error: Type mismatch nhưng chắc chắn không lỗi
		return arrowMap[key];
	}

	/**
	 * @private
	 * @param {KeyboardEvent} event
	 */
	_onKeyDown(event) {
		const controlAction = this._mapKeyToAction(event.key);

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
		const controlAction = this._mapKeyToAction(event.key);

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
