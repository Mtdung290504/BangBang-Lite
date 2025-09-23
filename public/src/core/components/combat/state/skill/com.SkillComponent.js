import BaseDSLExecutor from '../../../../factory/battle/executors/BaseExecutor.js';

export default class SkillComponent {
	/**
	 * Hành vi của skill
	 * @type {BaseDSLExecutor[]}
	 */
	actions = [];
	usable = false;

	/**
	 * @param {number} ownerEID
	 */
	constructor(ownerEID) {
		this.ownerEID = ownerEID;
	}
}
