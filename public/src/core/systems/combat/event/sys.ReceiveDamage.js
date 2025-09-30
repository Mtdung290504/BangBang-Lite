// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import ReceivedDamageComponent from '../../../components/combat/state/com.ReceiveDamage.js';
import SurvivalComponent from '../../../components/combat/stats/com.Survival.js';
import DamagesDisplayComponent from '../../../components/combat/state/com.DamagesDisplay.js';
import TextEffect from '../../../../../../models/public/TextEffect.js';
import PositionComponent from '../../../components/physics/com.Position.js';
import { STATUS_BAR_COLORS } from '../../../../../configs/constants/domain_constants/sys.constants.js';

const ReceiveDamageSystem = defineSystemFactory([ReceivedDamageComponent])
	.withProcessor((context, eID, [{ damageQueue }]) => {
		const survival = context.getComponent(eID, SurvivalComponent, false);
		if (!survival) return (damageQueue.length = 0);
		const pos = context.getComponent(eID, PositionComponent);

		damageQueue.forEach(({ damageValue, damageType, displayType }) => {
			const defVal = (() => {
				switch (damageType) {
					case 'energy':
						return survival.shield;
					case 'true':
						return 0;
					case 'physical':
						return survival.armor;
					default:
						throw new Error('Invalid damage type');
				}
			})();

			// Tối thiểu gây 1 ST
			const calulatedDamage = Math.round(
				Math.max(1, (1 + survival.dmgReduction / 100) * damage(damageValue, defVal))
			);
			const damageDealt = survival.setCurrentHP(survival.currentHP - calulatedDamage);

			context
				.getComponent(eID, DamagesDisplayComponent)
				.damageEffects.push(new TextEffect(pos, damageDealt, STATUS_BAR_COLORS.damage, displayType));
		});

		// Xóa ST đã xử lý
		damageQueue.length = 0;
	})
	.build();

export default ReceiveDamageSystem;

/**
 * @param {number} rawValue
 * @param {number} defValue
 */
function damage(rawValue, defValue) {
	return (rawValue * 100) / (100 + defValue);
}
