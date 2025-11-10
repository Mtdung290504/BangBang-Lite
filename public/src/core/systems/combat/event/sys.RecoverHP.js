// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import AttackPowerComponent from '../../../components/combat/stats/com.AttackPower.js';
import SurvivalComponent from '../../../components/combat/stats/com.Survival.js';
import HealsComponent from '../../../components/combat/state/com.Heals.js';
import TextEffectDisplayComponent from '../../../components/combat/state/com.DamagesDisplay.js';
import PositionComponent from '../../../components/physics/com.Position.js';
import StatsHistoryComponent from '../../../components/network/com.StatsHistory.js';

// Constants / Models
import TextEffect from '../../../../../../models/public/TextEffect.js';
import { STATUS_BAR_COLORS } from '../../../../../configs/constants/domain_constants/sys.constants.js';

/**
 * System xử lý trừ HP và thêm hiển thị damage khi chịu ST
 */
const RecoverHPSystem = defineSystemFactory([HealsComponent])
	.withProcessor((context, eID, [{ heals }]) => {
		const survival = context.getComponent(eID, SurvivalComponent, false);
		if (!survival) return (heals.length = 0);
		const pos = context.getComponent(eID, PositionComponent);

		// TODO: Trong tương lai bổ sung giảm hồi máu
		heals.forEach(({ value, displayType }) => {
			// Lượng ST thực sự gây ra, nếu > 0, hiển thị
			const healed = survival.setCurrentHP(survival.currentHP + value);
			if (healed)
				// TODO: Triển khai sau: Nếu nguồn hoặc đích là EID của mình thì mới hiện, không thì thôi
				context
					.getComponent(eID, TextEffectDisplayComponent)
					.textEffects.push(new TextEffect(pos, `+${-healed}`, STATUS_BAR_COLORS.self, displayType));

			// Lưu heal vào stats history
			const statsHistory = context.getComponent(eID, StatsHistoryComponent, false);
			if (statsHistory) statsHistory.saveDeltaHP(healed, Date.now());
		});

		// Xóa ST đã xử lý
		heals.length = 0;
	})
	.build();

export default RecoverHPSystem;
