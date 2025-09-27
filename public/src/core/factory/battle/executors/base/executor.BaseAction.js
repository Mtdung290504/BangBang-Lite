import EntityManager from '../../../../managers/combat/mgr.Entity.js';

/**
 * @abstract
 */
export default class BaseActionExecutor {
	/**
	 * @param {EntityManager} context
	 */
	constructor(context) {
		this.context = context;
	}

	/**
	 * @abstract
	 * @param {number} selfTankEID
	 */
	exec(selfTankEID) {
		throw new Error('> [fac.executor.BaseActionExecutor] `exec` not implemented yet');
	}
}
