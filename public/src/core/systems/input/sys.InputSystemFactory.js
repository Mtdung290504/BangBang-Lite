import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';
import { PlayerMouseDirection, PlayerMoveAction, PlayerSkillInput } from '../../components/input/com.controls.js';

/**
 * @typedef {Object} EventEmitter
 * @property {(event: string, data: any) => void} emit - Emit event function
 */

/**
 * @typedef {Object} InputChangeEvent
 * @property {number} playerId - Entity ID của player
 * @property {'keydown' | 'keyup' | 'mousemove' | 'mousedown' | 'mouseup'} eventType - Loại event
 * @property {InputChangeData} changeData - Data thay đổi
 * @property {number} timestamp - Timestamp khi event xảy ra
 */

/**
 * @typedef {Object} InputChangeData
 * @property {number} [x] - Mouse X position
 * @property {number} [y] - Mouse Y position
 * @property {boolean} [leftClick] - Left mouse button state
 * @property {boolean} [rightClick] - Right mouse button state
 * @property {boolean} [left] - Left movement key state
 * @property {boolean} [right] - Right movement key state
 * @property {boolean} [up] - Up movement key state
 * @property {boolean} [down] - Down movement key state
 * @property {boolean} [skillSP] - Special skill state
 * @property {boolean} [skill1] - Skill 1 state
 * @property {boolean} [skill2] - Skill 2 state
 * @property {boolean} [skillUltimate] - Ultimate skill state
 */

class InputSystemContext {
	/**
	 *
	 * @param {EventEmitter} eventEmitter
	 * @param {number} [mouseSyncFPS=30]
	 */
	constructor(eventEmitter, mouseSyncFPS = 30) {
		/** @private */
		this.eventEmitter = eventEmitter;

		/**
		 * Mouse sync throttling
		 * @private
		 */
		this.mouseSyncFPS = mouseSyncFPS;

		/** @private */
		this.mouseSyncInterval = 1000 / mouseSyncFPS;

		/** @private */
		this.lastMouseSyncTime = 0;

		/**
		 * @type {AbortController | null}
		 * @private
		 */
		this.abortController = null;
	}

	/**
	 * Thiết lập event listeners
	 * @private
	 * @returns {void}
	 */
	_setupEventListeners() {
		this.abortController = new AbortController();
		const signal = this.abortController.signal;

		window.addEventListener('contextmenu', (event) => event.preventDefault(), { signal });
		document.addEventListener('mousemove', this._onMouseMove.bind(this), { signal });
		document.addEventListener('mousedown', this._onMouseDown.bind(this), { signal });
		document.addEventListener('mouseup', this._onMouseUp.bind(this), { signal });
		document.addEventListener('keydown', this._onKeyDown.bind(this), { signal });
		document.addEventListener('keyup', this._onKeyUp.bind(this), { signal });
	}

	/**
	 * @private
	 * @param {MouseEvent} event
	 * @returns {void}
	 */
	_onMouseMove(event) {
		if (this.localPlayerId === null) return;

		const mouseComp = this.entityManager.getComponent(this.localPlayerId, PlayerMouseDirection);
		const newX = event.clientX;
		const newY = event.clientY;

		// Cập nhật component
		mouseComp.x = newX;
		mouseComp.y = newY;

		// Throttle network sync
		const now = Date.now();
		if (now - this.lastMouseSyncTime >= this.mouseSyncInterval) {
			this.lastMouseSyncTime = now;
			this._emitInputChange('mousemove', { x: newX, y: newY });
		}
	}

	/**
	 * @private
	 * @param {MouseEvent} event
	 * @returns {void}
	 */
	_onMouseDown(event) {
		if (this.localPlayerId === null) return;

		const mouseComp = this.entityManager.getComponent(this.localPlayerId, PlayerMouseDirection);
		let changed = false;
		/** @type {InputChangeData} */
		const changeData = { x: mouseComp.x, y: mouseComp.y };

		if (event.button === 0 && !mouseComp.leftClick) {
			mouseComp.leftClick = true;
			changeData.leftClick = true;
			changed = true;
		} else if (event.button === 2 && !mouseComp.rightClick) {
			mouseComp.rightClick = true;
			changeData.rightClick = true;
			changed = true;
		}

		if (changed) {
			this._emitInputChange('mousedown', changeData);
		}
	}

	/**
	 * @private
	 * @param {MouseEvent} event
	 * @returns {void}
	 */
	_onMouseUp(event) {
		if (this.localPlayerId === null) return;

		const mouseComp = this.entityManager.getComponent(this.localPlayerId, PlayerMouseDirection);
		let changed = false;
		/** @type {InputChangeData} */
		const changeData = { x: mouseComp.x, y: mouseComp.y };

		if (event.button === 0 && mouseComp.leftClick) {
			mouseComp.leftClick = false;
			changeData.leftClick = false;
			changed = true;
		} else if (event.button === 2 && mouseComp.rightClick) {
			mouseComp.rightClick = false;
			changeData.rightClick = false;
			changed = true;
		}

		if (changed) {
			this._emitInputChange('mouseup', changeData);
		}
	}

	/**
	 * @private
	 * @param {KeyboardEvent} event
	 * @returns {void}
	 */
	_onKeyDown(event) {
		if (this.localPlayerId === null) return;

		const controlKey = CONTROL_KEY[event.key.toUpperCase()];
		if (!controlKey) return;

		const actionKey = ACTIONS_KEYS[controlKey];
		if (!actionKey) return;

		// Update move actions
		const moveComp = this.entityManager.getComponent(this.localPlayerId, PlayerMoveAction);
		const skillComp = this.entityManager.getComponent(this.localPlayerId, PlayerSkillInput);

		let changed = false;
		/** @type {InputChangeData} */
		const changeData = {};

		// Movement keys
		if (actionKey === ACTIONS_KEYS['LEFT'] && !moveComp.left) {
			moveComp.left = true;
			changeData.left = true;
			changed = true;
		} else if (actionKey === ACTIONS_KEYS['RIGHT'] && !moveComp.right) {
			moveComp.right = true;
			changeData.right = true;
			changed = true;
		} else if (actionKey === ACTIONS_KEYS['UP'] && !moveComp.up) {
			moveComp.up = true;
			changeData.up = true;
			changed = true;
		} else if (actionKey === ACTIONS_KEYS['DOWN'] && !moveComp.down) {
			moveComp.down = true;
			changeData.down = true;
			changed = true;
		}
		// Skill keys
		else if (actionKey === ACTIONS_KEYS['SKILL_SP'] && !skillComp.skillSP) {
			skillComp.skillSP = true;
			changeData.skillSP = true;
			changed = true;
		} else if (actionKey === ACTIONS_KEYS['SKILL_1'] && !skillComp.skill1) {
			skillComp.skill1 = true;
			changeData.skill1 = true;
			changed = true;
		} else if (actionKey === ACTIONS_KEYS['SKILL_2'] && !skillComp.skill2) {
			skillComp.skill2 = true;
			changeData.skill2 = true;
			changed = true;
		} else if (actionKey === ACTIONS_KEYS['SKILL_ULTIMATE'] && !skillComp.skillUltimate) {
			skillComp.skillUltimate = true;
			changeData.skillUltimate = true;
			changed = true;
		}

		if (changed) {
			this._emitInputChange('keydown', changeData);
		}
	}

	/**
	 * @private
	 * @param {KeyboardEvent} event
	 * @returns {void}
	 */
	_onKeyUp(event) {
		if (this.localPlayerId === null) return;

		const controlKey = CONTROL_KEY[event.key.toUpperCase()];
		if (!controlKey) return;

		const actionKey = ACTIONS_KEYS[controlKey];
		if (!actionKey) return;

		const moveComp = this.entityManager.getComponent(this.localPlayerId, PlayerMoveAction);
		const skillComp = this.entityManager.getComponent(this.localPlayerId, PlayerSkillInput);

		let changed = false;
		/** @type {InputChangeData} */
		const changeData = {};

		// Movement keys
		if (actionKey === ACTIONS_KEYS['LEFT'] && moveComp.left) {
			moveComp.left = false;
			changeData.left = false;
			changed = true;
		} else if (actionKey === ACTIONS_KEYS['RIGHT'] && moveComp.right) {
			moveComp.right = false;
			changeData.right = false;
			changed = true;
		} else if (actionKey === ACTIONS_KEYS['UP'] && moveComp.up) {
			moveComp.up = false;
			changeData.up = false;
			changed = true;
		} else if (actionKey === ACTIONS_KEYS['DOWN'] && moveComp.down) {
			moveComp.down = false;
			changeData.down = false;
			changed = true;
		}

		// Skill keys
		else if (actionKey === ACTIONS_KEYS['SKILL_SP'] && skillComp.skillSP) {
			skillComp.skillSP = false;
			changeData.skillSP = false;
			changed = true;
		} else if (actionKey === ACTIONS_KEYS['SKILL_1'] && skillComp.skill1) {
			skillComp.skill1 = false;
			changeData.skill1 = false;
			changed = true;
		} else if (actionKey === ACTIONS_KEYS['SKILL_2'] && skillComp.skill2) {
			skillComp.skill2 = false;
			changeData.skill2 = false;
			changed = true;
		} else if (actionKey === ACTIONS_KEYS['SKILL_ULTIMATE'] && skillComp.skillUltimate) {
			skillComp.skillUltimate = false;
			changeData.skillUltimate = false;
			changed = true;
		}

		if (changed) {
			this._emitInputChange('keyup', changeData);
		}
	}

	/**
	 * Emit input change event
	 * @private
	 * @param {'keydown' | 'keyup' | 'mousemove' | 'mousedown' | 'mouseup'} eventType
	 * @param {InputChangeData} changeData
	 * @returns {void}
	 */
	_emitInputChange(eventType, changeData) {
		if (this.eventEmitter && this.localPlayerId !== null) {
			/** @type {InputChangeEvent} */
			const event = {
				playerId: this.localPlayerId,
				eventType,
				changeData,
				timestamp: Date.now(),
			};
			this.eventEmitter.emit('input:change', event);
		}
	}
}

const InputSystemFactory = defineSystemFactory(
	[PlayerMoveAction, PlayerMouseDirection, PlayerSkillInput],
	InputSystemContext
)
	.withInit((context) => {})
	.withProcessor((eID, [moveAction, mouseDirection, skillInput], context) => {})
	.withTeardown((context) => {})
	.build();

export default InputSystemFactory;
