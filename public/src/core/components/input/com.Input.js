import BattleInputManager from '../../managers/battle/mgr.BattleInput.js';

export default class InputComponent {
	/**
	 * @param {BattleInputManager} inputManager
	 */
	constructor(inputManager) {
		this.inputManager = inputManager;
	}
}
