/**
 * @typedef {import('socket.io-client').Socket} _Socket
 * @typedef {import('../../../core/components/network/com.NetworkPosition.js').default} _NetworkPosition
 * @typedef {import('../../../core/components/network/com.NetworkStats.js').default} _NetworkStats
 * @typedef {import('../../../core/managers/input/mgr.BattleInput.js').default} _BattleInputManager
 * @typedef {Map<string, {
 * 		tankEID: number
 * 		inputManager: _BattleInputManager
 * 		networkPosition: _NetworkPosition
 * 		networkStats: _NetworkStats
 * }>} _PlayerRegistry
 * @typedef {{ [socketID: string]: { x: number, y: number } }} _PositionStates
 * @typedef {{ [socketID: string]: { currentHP: number, currentEnergy?: number } }} _StatStates
 */

/**
 * @param {_Socket} socket
 * @param {_PlayerRegistry} playerRegistry
 *
 * @returns Hàm giải phóng các battle event
 */
export function setup(socket, playerRegistry) {
	/**
	 * @type {[event: string, handler: (...args: any[]) => void][]}
	 */
	const socketEvents = [
		['dispatch:sync-mouse-state', syncMouseStateHandler],
		['dispatch:sync-action-state', syncActionStateHandler],
		['dispatch:sync-position-state', syncPositionStateHandler],
		['dispatch:sync-stats-state', syncStatStateHandler],
	];

	socketEvents.forEach(([event, handler]) => socket.on(event, handler));

	/**
	 * @param {Object} data
	 * @param {string} data.socketID
	 * @param {_BattleInputManager['mouseState']} data.mouseState
	 */
	function syncMouseStateHandler({ socketID, mouseState }) {
		const playerState = playerRegistry.get(socketID);

		if (playerState) {
			shallowMerge(playerState.inputManager.mouseState, mouseState);
			return;
		}

		console.warn(
			`> [BattleHandler] Network data problem, playerState with socketID:[${socketID}] does not exist in registry:`,
			playerRegistry
		);
	}

	/**
	 * @param {Object} data
	 * @param {string} data.socketID
	 * @param {_BattleInputManager['actionState']} data.actionState
	 */
	function syncActionStateHandler({ socketID, actionState }) {
		const playerState = playerRegistry.get(socketID);

		if (playerState) {
			shallowMerge(playerState.inputManager.actionState, actionState);
			return;
		}

		console.warn(
			`> [BattleHandler] Network data problem, playerState with socketID:[${socketID}] does not exist in registry:`,
			playerRegistry
		);
	}

	let lastPosSyncTime = 0;
	let lastStatSyncTime = 0;

	/**
	 * @param {_PositionStates} positionStates
	 * @param {number} timestamp
	 */
	function syncPositionStateHandler(positionStates, timestamp) {
		if (lastPosSyncTime > timestamp) return;

		lastPosSyncTime = timestamp;
		for (const socketID in positionStates) {
			const playerState = playerRegistry.get(socketID);

			if (!playerState) {
				console.warn(
					`> [BattleHandler] Network data problem, playerState with socketID:[${socketID}] does not exist in registry:`,
					playerRegistry
				);
				continue;
			}

			const { timestamp: netPosTimestamp } = playerState.networkPosition;
			if (netPosTimestamp !== null) continue;

			const { x, y } = positionStates[socketID];
			playerState.networkPosition.setNetworkPosition(x, y, timestamp);
		}
	}

	/**
	 * @param {_StatStates} statStates
	 * @param {number} timestamp
	 */
	function syncStatStateHandler(statStates, timestamp) {
		if (lastStatSyncTime > timestamp) return;

		lastStatSyncTime = timestamp;
		for (const socketID in statStates) {
			const playerState = playerRegistry.get(socketID);

			if (!playerState) {
				console.warn(
					`> [BattleHandler] Network data problem, playerState with socketID:[${socketID}] does not exist in registry:`,
					playerRegistry
				);
				continue;
			}

			const { networkStats } = playerState;
			const { currentHP, currentEnergy } = statStates[socketID];
			if (networkStats.timestamp !== null) continue;

			networkStats.timestamp = timestamp;
			networkStats.currentHP = currentHP;
			if (currentEnergy) networkStats.currentEnergy = currentEnergy;
		}
	}

	return () => socketEvents.forEach(([event, handler]) => socket.off(event, handler));
}

/**
 * @param {_Socket} socket
 * @param {_PositionStates} positionStates
 */
export function syncPositionState(socket, positionStates) {
	// Bổ sung timestamp
	socket.emit('request-sync:position-state', positionStates, Date.now());
}

/**
 * @param {_Socket} socket
 * @param {_StatStates} states
 */
export function syncStatState(socket, states) {
	socket.emit('request-sync:stat-state', states, Date.now());
}

/**
 * Shallow merge từ source vào target.
 *
 * Lưu ý:
 * - Hàm này chỉ thực hiện merge một cấp (shallow), không xử lý nested object
 * - Nếu object có cấu trúc lồng nhau, giá trị ở key sẽ bị ghi đè trực tiếp.
 *
 * @template {Record<string, any>} T
 * @param {T} target - Object cần được cập nhật (sẽ bị mutate).
 * @param {Partial<T>} source - Object chứa dữ liệu mới.
 * @returns {T} Trả về target sau khi merge.
 */
function shallowMerge(target, source) {
	for (const key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			if (source[key] === undefined)
				console.warn(`> [BattleHandler.shallowMerge] Source at key:[${key}] is undefined???`);

			// @ts-expect-error: source[key] đã được check hasOwnProperty nên không thể undefined
			target[key] = source[key];
		}
	}

	return target;
}
