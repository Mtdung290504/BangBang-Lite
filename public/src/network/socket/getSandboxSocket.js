import { SANDBOX_SOCKET_ID } from '../../../configs/constants/game-system-configs.js';
import { elapsedSeconds } from '../../../utils/utils.js';

/**
 * Tạo một fake socket để mô phỏng hành vi trong môi trường sandbox
 */
export default function getSandboxSocket() {
	let lastLogTime = Date.now();

	return {
		/**
		 * @param {string} event
		 * @param {...any} data
		 */
		emit(event, ...data) {
			if (elapsedSeconds(lastLogTime) > 3) {
				console.log(`> [SandboxSocket] Emit event:[${event}], data:`, data);
				lastLogTime = Date.now();
			}
		},

		/**
		 * @param {string} event
		 * @param {(...data: any[]) => void} handler
		 */
		on(event, handler) {
			console.log(`> [SandboxSocket] On event:[${event}]`);
		},

		id: SANDBOX_SOCKET_ID,
	};
}
