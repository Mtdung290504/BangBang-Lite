import EntityManager from '../../../../managers/combat/mgr.Entity.js';

/**
 * @abstract
 */
export default class BaseSkillHitExecutor {
	/**
	 * @param {EntityManager} context
	 */
	constructor(context) {
		this.context = context;
	}

	/**
	 * @abstract
	 * @param {number} sourceEID
	 * @param {number} impactorEID
	 * @param {number} targetEID
	 */
	exec(sourceEID, impactorEID, targetEID) {
		throw new Error('> [fac.executor.BaseSkillHitExecutor] `exec` not implemented yet');
	}
}
