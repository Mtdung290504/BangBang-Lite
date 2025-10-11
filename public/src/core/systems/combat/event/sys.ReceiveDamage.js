// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import AttackPowerComponent from '../../../components/combat/stats/com.AttackPower.js';
import SurvivalComponent from '../../../components/combat/stats/com.Survival.js';
import ReceivedDamageComponent from '../../../components/combat/state/com.ReceiveDamage.js';
import TextEffectDisplayComponent from '../../../components/combat/state/com.DamagesDisplay.js';
import PositionComponent from '../../../components/physics/com.Position.js';
import StatsHistoryComponent from '../../../components/network/com.StatsHistory.js';

// Constants / Models
import TextEffect from '../../../../../../models/public/TextEffect.js';
import { STATUS_BAR_COLORS } from '../../../../../configs/constants/domain_constants/sys.constants.js';

/**
 * System xử lý trừ HP và thêm hiển thị damage khi chịu ST
 */
const ReceiveDamageSystem = defineSystemFactory([ReceivedDamageComponent])
	.withProcessor((context, eID, [{ damageQueue }]) => {
		const survival = context.getComponent(eID, SurvivalComponent, false);
		if (!survival) return (damageQueue.length = 0);
		const pos = context.getComponent(eID, PositionComponent);

		damageQueue.forEach(({ damageValue, damageType, displayType, sourceEID }) => {
			const calcDef = () => {
				const pen = context.getComponent(sourceEID, AttackPowerComponent).penetration;
				switch (damageType) {
					case 'energy':
						return survival.shield - pen;
					case 'true':
						return 0;
					case 'physical':
						return survival.armor - pen;
					default:
						throw new Error('Invalid damage type');
				}
			};

			// Tối thiểu gây 1 ST
			const calulatedDamage = Math.round(
				Math.max(1, (1 + survival.dmgReduction * 0.01) * damage(damageValue, calcDef()))
			);

			// Lượng ST thực sự gây ra, nếu > 0, hiển thị
			const damageDealt = survival.setCurrentHP(survival.currentHP - calulatedDamage);
			if (damageDealt)
				// TODO: Triển khai sau: Nếu nguồn hoặc đích là EID của mình thì mới hiện, không thì thôi
				context
					.getComponent(eID, TextEffectDisplayComponent)
					.textEffects.push(new TextEffect(pos, damageDealt, STATUS_BAR_COLORS.damage, displayType));

			// Lưu damage vào stats history
			const statsHistory = context.getComponent(eID, StatsHistoryComponent, false);
			if (statsHistory) statsHistory.saveDeltaHP(-damageDealt, Date.now());
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
