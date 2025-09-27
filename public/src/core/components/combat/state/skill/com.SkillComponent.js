import BaseActionExecutor from '../../../../factory/battle/executors/base/executor.BaseAction.js';

export default class SkillComponent {
	/**
	 * Hành vi của skill
	 * @type {BaseActionExecutor[]}
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
