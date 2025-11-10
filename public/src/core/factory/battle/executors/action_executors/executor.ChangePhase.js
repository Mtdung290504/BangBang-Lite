// Type only
import TankActiveSkillsComponent from '../../../../components/combat/state/skill/com.TankActiveSkillsComponent.js';
import EntityManager from '../../../../managers/combat/mgr.Entity.js';

// Base & parser
import BaseActionExecutor from '../base/executor.BaseAction.js';

export default class ChangePhaseExecutor extends BaseActionExecutor {
	/**
	 * @param {EntityManager} context
	 * @param {import('.types-system/dsl/skills/actions/apply_effect/change-phase').ChangePhase} manifest
	 */
	constructor(context, manifest) {
		if (manifest.action !== '@do:change-phase') throw new TypeError('Invalid action manifest');

		super(context);
		this.parsedManifest = manifest;
	}

	/**
	 * @override
	 * @param {number} selfTankEID
	 */
	exec(selfTankEID) {
		const { context } = this;
		const { method, duration } = this.parsedManifest;

		const activeSkills = context.getComponent(selfTankEID, TankActiveSkillsComponent);
		activeSkills.setPhase(method, duration);
	}
}
