import { ACTIONS_KEYS } from '../../configs/action-keys.js';

export default class InputManager {
	constructor() {
		this.mouseState = {
			mouseX: 0,
			mouseY: 0,
			mouseDown: false,
			contextMenuState: false,
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

	listen() {}

	destroy() {}
}
