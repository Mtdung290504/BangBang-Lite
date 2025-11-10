// Base/parser
import BaseSkillHitExecutor from '../base/executor.BaseSkillHit.js';

// Components
import AdditionalAttributesComponent from '../../../../components/combat/stats/com.AdditionalAttributes.js';

// Use type only
import EntityManager from '../../../../managers/combat/mgr.Entity.js';

export default class ModifyEnergyExecutor extends BaseSkillHitExecutor {
	/**
	 * @param {EntityManager} context
	 * @param {import('.types-system/dsl/skills/actions/apply_effect/modify-energy').ModifyEnergyAction} manifest
	 */
	constructor(context, manifest) {
		super(context);
		this.parsedManifest = manifest;
	}

	/**
	 * @override
	 * @param {number} _sourceEID - Ngữ cảnh này không cần sử dụng
	 * @param {number} _impactorEID - Ngữ cảnh này không cần sử dụng
	 * @param {number} targetEID
	 */
	exec(_sourceEID, _impactorEID, targetEID) {
		const { context, parsedManifest } = this;
		const { value } = parsedManifest;
		const additional = context.getComponent(targetEID, AdditionalAttributesComponent);

		/** Giá trị ST */
		let recoverValue = (() => {
			return toValue(additional.limitEnergyPoint);
			function toValue(statValue = 0) {
				const { unit = 'unit', amount } = value;

				if (unit === 'unit') return amount;
				else if (unit === '%') return (statValue * amount) / 100;
				throw new Error(`> [executor.RecoverEnergy] Invalid unit type::[${unit}]??`);
			}
		})();

		additional.currentEnergyPoint += recoverValue;
	}
}
