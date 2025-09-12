/**
 * @typedef {import('socket.io-client').Socket} _Socket
 * @typedef {import('../../../core/components/network/com.NetworkPosition.js').default} _NetworkPosition
 * @typedef {import('../../../core/managers/input/mgr.BattleInput.js').default} _BattleInputManager
 * @typedef {Map<string, { tankEID: number, inputManager: _BattleInputManager, networkPosition: _NetworkPosition }>} _PlayerRegistry
 * @typedef {{ [socketID: string]: { x: number, y: number } }} _PositionStates
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
		['dispatch:sync-mouse-state', syncMouseState],
		['dispatch:sync-action-state', syncActionState],
		['dispatch:sync-position-state', syncPositionState],
	];

	socketEvents.forEach(([event, handler]) => socket.on(event, handler));

	/**
	 * @param {Object} data
	 * @param {string} data.socketID
	 * @param {_BattleInputManager['mouseState']} data.mouseState
	 */
	function syncMouseState({ socketID, mouseState }) {
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
	function syncActionState({ socketID, actionState }) {
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

	/**
	 * @param {_PositionStates} positionStates
	 * @param {number} timestamp
	 */
	function syncPositionState(positionStates, timestamp) {
		for (const socketID in positionStates) {
			const playerState = playerRegistry.get(socketID);

			if (playerState) {
				const { x, y } = positionStates[socketID];
				// playerState.networkPosition.x = x;
				// playerState.networkPosition.y = y;

				// New handler
				playerState.networkPosition.setNetworkPosition(x, y, timestamp);
				continue;
			}

			console.warn(
				`> [BattleHandler] Network data problem, playerState with socketID:[${socketID}] does not exist in registry:`,
				playerRegistry
			);
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
