import { ACTIONS_KEYS, CONTROL_KEY } from '../../configs/action-keys.js';
import defineSystemFactory from '../../factory/factory_builders/defineSystemFactory.js';

// ================== TYPES ==================

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

/**
 * @typedef {Object} EventEmitter
 * @property {function(string, any): void} emit - Emit event function
 */

// ================== COMPONENTS ==================

/**
 * Component chứa thông tin di chuyển của player
 */
export class PlayerMoveAction {
	/**
	 * @type {boolean}
	 */
	left = false;

	/**
	 * @type {boolean}
	 */
	right = false;

	/**
	 * @type {boolean}
	 */
	up = false;

	/**
	 * @type {boolean}
	 */
	down = false;
}

/**
 * Component chứa thông tin chuột của player
 */
export class PlayerMouseDirection {
	/**
	 * @type {number}
	 */
	x = 0;

	/**
	 * @type {number}
	 */
	y = 0;

	/**
	 * @type {boolean}
	 */
	leftClick = false;

	/**
	 * @type {boolean}
	 */
	rightClick = false;
}

/**
 * Component chứa thông tin skill input của player
 */
export class PlayerSkillInput {
	/**
	 * @type {boolean}
	 */
	skillSP = false;

	/**
	 * @type {boolean}
	 */
	skill1 = false;

	/**
	 * @type {boolean}
	 */
	skill2 = false;

	/**
	 * @type {boolean}
	 */
	skillUltimate = false;
}

/**
 * Component đánh dấu player này được điều khiển bởi network
 */
export class NetworkPlayer {
	/**
	 * @param {string} socketId - Socket ID của player
	 */
	constructor(socketId) {
		/**
		 * @type {string}
		 */
		this.socketId = socketId;

		/**
		 * @type {false}
		 * @readonly
		 */
		this.isLocal = false;
	}
}

/**
 * Component đánh dấu player này là local player
 */
export class LocalPlayer {
	/**
	 * @type {boolean}
	 */
	isListening = false;
}

// ================== SYSTEMS ==================

/**
 * System xử lý input từ bàn phím/chuột cho local player
 */
export class LocalInputSystem {
	/**
	 * @param {import('./mgr.Entity.js').default} entityManager - Entity manager instance
	 * @param {EventEmitter | null} [eventEmitter=null] - Event emitter for network sync
	 * @param {number} [mouseSyncFPS=20] - Mouse sync rate in FPS
	 */
	constructor(entityManager, eventEmitter = null, mouseSyncFPS = 20) {
		/**
		 * @type {import('./mgr.Entity.js').default}
		 * @private
		 */
		this.entityManager = entityManager;

		/**
		 * @type {EventEmitter | null}
		 * @private
		 */
		this.eventEmitter = eventEmitter;

		// Mouse sync throttling
		/**
		 * @type {number}
		 * @private
		 */
		this.mouseSyncFPS = mouseSyncFPS;

		/**
		 * @type {number}
		 * @private
		 */
		this.mouseSyncInterval = 1000 / mouseSyncFPS;

		/**
		 * @type {number}
		 * @private
		 */
		this.lastMouseSyncTime = 0;

		/**
		 * @type {AbortController | null}
		 * @private
		 */
		this.abortController = null;

		/**
		 * @type {number | null}
		 * @private
		 */
		this.localPlayerId = null;
	}

	/**
	 * Khởi tạo system và tìm local player
	 * @returns {boolean} True nếu khởi tạo thành công
	 */
	start() {
		// Tìm local player entity
		const localPlayers = this.entityManager.getEntitiesWithComponent(LocalPlayer);
		if (localPlayers.size === 0) {
			console.warn('No local player found');
			return false;
		}

		// Giả sử chỉ có 1 local player
		const firstKey = localPlayers.keys().next();
		if (firstKey.done) {
			console.error('Local players iterator is empty');
			return false;
		}

		this.localPlayerId = firstKey.value;

		if (typeof this.localPlayerId !== 'number') {
			console.error('Invalid local player ID');
			return false;
		}

		this._setupEventListeners();

		// Đánh dấu đang listen
		const localPlayerComp = this.entityManager.getComponent(this.localPlayerId, LocalPlayer);
		localPlayerComp.isListening = true;

		return true;
	}

	/**
	 * Dừng system
	 * @returns {void}
	 */
	stop() {
		if (this.abortController) {
			this.abortController.abort();
			this.abortController = null;
		}

		if (this.localPlayerId !== null) {
			const localPlayerComp = this.entityManager.getComponent(this.localPlayerId, LocalPlayer, false);
			if (localPlayerComp) {
				localPlayerComp.isListening = false;
			}
		}

		this.localPlayerId = null;
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

/**
 * System xử lý input sync từ network cho remote players
 */
export class NetworkInputSystem {
	/**
	 * @param {import('./mgr.Entity.js').default} entityManager - Entity manager instance
	 */
	constructor(entityManager) {
		/**
		 * @type {import('./mgr.Entity.js').default}
		 * @private
		 */
		this.entityManager = entityManager;
	}

	/**
	 * Cập nhật input cho remote player
	 * @param {number} entityId - Entity ID của player
	 * @param {'keydown' | 'keyup' | 'mousemove' | 'mousedown' | 'mouseup'} eventType - Loại event
	 * @param {InputChangeData} changeData - Data thay đổi
	 * @returns {boolean} True nếu update thành công
	 */
	updateRemotePlayerInput(entityId, eventType, changeData) {
		// Kiểm tra entity có phải network player không
		if (!this.entityManager.hasComponent(entityId, NetworkPlayer)) {
			console.warn(`Entity ${entityId} is not a network player`);
			return false;
		}

		try {
			// Update mouse component
			if (
				changeData.x !== undefined ||
				changeData.y !== undefined ||
				changeData.leftClick !== undefined ||
				changeData.rightClick !== undefined
			) {
				const mouseComp = this.entityManager.getComponent(entityId, PlayerMouseDirection, false);
				if (mouseComp) {
					if (typeof changeData.x === 'number') mouseComp.x = changeData.x;
					if (typeof changeData.y === 'number') mouseComp.y = changeData.y;
					if (typeof changeData.leftClick === 'boolean') mouseComp.leftClick = changeData.leftClick;
					if (typeof changeData.rightClick === 'boolean') mouseComp.rightClick = changeData.rightClick;
				}
			}

			// Update move component
			if (
				changeData.left !== undefined ||
				changeData.right !== undefined ||
				changeData.up !== undefined ||
				changeData.down !== undefined
			) {
				const moveComp = this.entityManager.getComponent(entityId, PlayerMoveAction, false);
				if (moveComp) {
					if (typeof changeData.left === 'boolean') moveComp.left = changeData.left;
					if (typeof changeData.right === 'boolean') moveComp.right = changeData.right;
					if (typeof changeData.up === 'boolean') moveComp.up = changeData.up;
					if (typeof changeData.down === 'boolean') moveComp.down = changeData.down;
				}
			}

			// Update skill component
			if (
				changeData.skillSP !== undefined ||
				changeData.skill1 !== undefined ||
				changeData.skill2 !== undefined ||
				changeData.skillUltimate !== undefined
			) {
				const skillComp = this.entityManager.getComponent(entityId, PlayerSkillInput, false);
				if (skillComp) {
					if (typeof changeData.skillSP === 'boolean') skillComp.skillSP = changeData.skillSP;
					if (typeof changeData.skill1 === 'boolean') skillComp.skill1 = changeData.skill1;
					if (typeof changeData.skill2 === 'boolean') skillComp.skill2 = changeData.skill2;
					if (typeof changeData.skillUltimate === 'boolean')
						skillComp.skillUltimate = changeData.skillUltimate;
				}
			}

			return true;
		} catch (error) {
			console.error(`Error updating remote player input for entity ${entityId}:`, error);
			return false;
		}
	}

	/**
	 * Cập nhật input cho remote player từ InputChangeEvent
	 * @param {number} entityId - Entity ID của player
	 * @param {InputChangeEvent} inputEvent - Input event data
	 * @returns {boolean} True nếu update thành công
	 */
	updateRemotePlayerFromEvent(entityId, inputEvent) {
		return this.updateRemotePlayerInput(entityId, inputEvent.eventType, inputEvent.changeData);
	}
}

// ================== USAGE EXAMPLE ==================

/**
 * @typedef {Object} InputSystemSetup
 * @property {LocalInputSystem} localInputSystem - Local input system instance
 * @property {NetworkInputSystem} networkInputSystem - Network input system instance
 * @property {number} localPlayerId - Local player entity ID
 * @property {number[]} remotePlayerIds - Remote player entity IDs
 */

/**
 * Ví dụ cách sử dụng
 * @param {import('./mgr.Entity.js').default} entityManager - Entity manager instance
 * @param {EventEmitter | null} [eventEmitter=null] - Event emitter for network sync
 * @returns {InputSystemSetup} Setup result
 */
export function setupInputSystem(entityManager, eventEmitter = null) {
	// Tạo local player entity
	const localPlayerId = entityManager.createEntity();
	entityManager.addComponents(
		localPlayerId,
		new LocalPlayer(),
		new PlayerMoveAction(),
		new PlayerMouseDirection(),
		new PlayerSkillInput()
	);

	// Tạo remote player entities
	/** @type {number[]} */
	const remotePlayerIds = [];
	for (let i = 1; i <= 9; i++) {
		const remotePlayerId = entityManager.createEntity();
		entityManager.addComponents(
			remotePlayerId,
			new NetworkPlayer(`socket_${i}`),
			new PlayerMoveAction(),
			new PlayerMouseDirection(),
			new PlayerSkillInput()
		);
		remotePlayerIds.push(remotePlayerId);
	}

	// Khởi tạo systems
	const localInputSystem = new LocalInputSystem(entityManager, eventEmitter, 20);
	const networkInputSystem = new NetworkInputSystem(entityManager);

	// Start local input system
	localInputSystem.start();

	return {
		localInputSystem,
		networkInputSystem,
		localPlayerId,
		remotePlayerIds,
	};
}
