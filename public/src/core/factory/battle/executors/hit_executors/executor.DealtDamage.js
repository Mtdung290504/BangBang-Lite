// Base/parser
import BaseSkillHitExecutor from '../base/executor.BaseSkillHit.js';
import parseDealtDamageManifest from './parser/parseDealtDamageManifest.js';

// Components
import ReceivedDamageComponent from '../../../../components/combat/state/com.ReceiveDamage.js';
import AdditionalAttributesComponent from '../../../../components/combat/stats/com.AdditionalAttributes.js';
import AttackPowerComponent from '../../../../components/combat/stats/com.AttackPower.js';
import SurvivalComponent from '../../../../components/combat/stats/com.Survival.js';

// Use type only
import EntityManager from '../../../../managers/combat/mgr.Entity.js';
import DamageModifierComponent from '../../../../components/combat/state/skill/com.DamageModifier.js';

export default class DealtDamageExecutor extends BaseSkillHitExecutor {
	/**
	 * @param {EntityManager} context
	 * @param {import('./parser/parseDealtDamageManifest.js').DealtDamageManifest} manifest
	 */
	constructor(context, manifest) {
		super(context);
		this.parsedManifest = parseDealtDamageManifest(manifest);
	}

	/**
	 * @override
	 * @param {number} sourceEID
	 * @param {number} impactorEID
	 * @param {number} targetEID
	 */
	exec(sourceEID, impactorEID, targetEID) {
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

		/** Loại ST (VL, NL hoặc ST Thực) */
		const damageType =
			parsedManifest.damageType !== 'inherit'
				? parsedManifest.damageType
				: context.getComponent(sourceEID, AttackPowerComponent).dmgType;

		/** Giá trị ST */
		let damageValue = (() => {
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
				throw new Error(`> [executor.DealtDamage] Invalid unit type::[${unit}]??`);
			}
		})();

		// Thay đổi main damage theo modifier
		if (parsedManifest.isMainDamage) {
			const modifier = context.getComponent(impactorEID, DamageModifierComponent, false);
			if (modifier) damageValue += modifier.value;
		}

		context
			.getComponent(targetEID, ReceivedDamageComponent)
			.damageQueue.push({ sourceEID, damageType, damageValue, displayType });
	}
}
