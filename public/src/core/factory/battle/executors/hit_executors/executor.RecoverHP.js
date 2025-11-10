// Base/parser
import BaseSkillHitExecutor from '../base/executor.BaseSkillHit.js';
import parseRecoverHPManifest from './parser/parseRecoverHPManifest.js';

// Components
import AdditionalAttributesComponent from '../../../../components/combat/stats/com.AdditionalAttributes.js';
import AttackPowerComponent from '../../../../components/combat/stats/com.AttackPower.js';
import SurvivalComponent from '../../../../components/combat/stats/com.Survival.js';

// Use type only
import EntityManager from '../../../../managers/combat/mgr.Entity.js';
import HealsComponent from '../../../../components/combat/state/com.Heals.js';

export default class RecoverHPExecutor extends BaseSkillHitExecutor {
	/**
	 * @param {EntityManager} context
	 * @param {import('./parser/parseRecoverHPManifest.js').RecoverHPManifest} manifest
	 */
	constructor(context, manifest) {
		super(context);
		this.parsedManifest = parseRecoverHPManifest(manifest);
	}

	/**
	 * @override
	 * @param {number} sourceEID
	 * @param {number} _impactorEID - Ngữ cảnh này không cần sử dụng
	 * @param {number} targetEID
	 */
	exec(sourceEID, _impactorEID, targetEID) {
		const { context, parsedManifest } = this;
		const { source, value, displayType } = parsedManifest;

		/** Chọn xem tính sát thương từ chỉ số của ai */
		const calcFromEID = (() => {
			switch (source.of) {
				case 'self':
					return sourceEID;
				case 'target':
					return targetEID;
				default:
					throw new Error(`> [executor.DealtDamage] Invalid calc target::${source.of}`);
			}
		})();

		/** Giá trị ST */
		let recoverValue = (() => {
			switch (source.attribute) {
				case 'attack-power':
					return toValue(context.getComponent(calcFromEID, AttackPowerComponent).value);
				case 'penetration':
					return toValue(context.getComponent(calcFromEID, AttackPowerComponent).penetration);
				case 'crit-damage':
					return toValue(context.getComponent(calcFromEID, AttackPowerComponent).critDmg);
				case 'limit-HP':
					return toValue(context.getComponent(calcFromEID, SurvivalComponent).limitHP);
				case 'physical-armor':
					return toValue(context.getComponent(calcFromEID, SurvivalComponent).armor);
				case 'energy-shield':
					return toValue(context.getComponent(calcFromEID, SurvivalComponent).shield);
				case 'current-HP':
					return toValue(context.getComponent(calcFromEID, SurvivalComponent).currentHP);
				case 'lost-HP':
					return toValue(context.getComponent(calcFromEID, SurvivalComponent).lostHP);
				case 'energy-point':
					return toValue(context.getComponent(calcFromEID, AdditionalAttributesComponent).limitEnergyPoint);
				case 'current-energy-point':
					return toValue(context.getComponent(calcFromEID, AdditionalAttributesComponent).currentEnergyPoint);
				default:
					throw new Error(`> [executor.DealtDamage] Invalid source attribute::[${source.attribute}]??`);
			}

			function toValue(statValue = 0) {
				const { unit = 'unit', amount } = value;

				if (unit === 'unit') return amount;
				else if (unit === '%') return (statValue * amount) / 100;
				throw new Error(`> [executor.RecoverHP] Invalid unit type::[${unit}]??`);
			}
		})();

		context.getComponent(targetEID, HealsComponent).heals.push({ value: recoverValue, displayType });
	}
}
