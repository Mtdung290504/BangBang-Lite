import BattleInputManager from '../../managers/input/mgr.BattleInput.js';

export default class InputComponent {
	/**
	 * @param {BattleInputManager} inputManager
	 */
	constructor(inputManager) {
		this.inputManager = inputManager;
	}
}
