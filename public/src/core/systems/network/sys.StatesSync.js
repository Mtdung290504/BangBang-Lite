// Builder
import defineSystemFactory from '../../factory/factory_builders/defineSystemFactory.js';

// Components
import TankComponent from '../../components/combat/objects/com.Tank.js';
import NetworkStatsComponent from '../../components/network/com.NetworkStats.js';
import SurvivalComponent from '../../components/combat/stats/com.Survival.js';
import AdditionalAttributesComponent from '../../components/combat/stats/com.AdditionalAttributes.js';

/**
 * System đồng bộ trạng thái chỉ số từ mạng
 */
const TankStatsSyncSystem = defineSystemFactory([TankComponent])
	.withProcessor((context, eID, [_tank]) => {
		const netStat = context.getComponent(eID, NetworkStatsComponent);
		const { currentHP, currentEnergy, timestamp } = netStat;

		if (Date.now() - timestamp <= 1000 / 60) {
			if (currentHP !== null) context.getComponent(eID, SurvivalComponent).setCurrentHP(currentHP);
			if (currentEnergy !== null)
				context.getComponent(eID, AdditionalAttributesComponent).currentEnergyPoint = currentEnergy;
		}

		netStat.currentHP = null;
		netStat.currentEnergy = null;
	})
	.build();

export default TankStatsSyncSystem;
