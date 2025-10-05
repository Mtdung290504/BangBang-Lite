// Builder
import defineSystemFactory from '../../factory/factory_builders/defineSystemFactory.js';

// Components
import NetworkStatsComponent from '../../components/network/com.NetworkStats.js';
import StatsHistoryComponent from '../../components/network/com.StatsHistory.js';
import TankComponent from '../../components/combat/objects/com.Tank.js';
import SurvivalComponent from '../../components/combat/stats/com.Survival.js';
import AdditionalAttributesComponent from '../../components/combat/stats/com.AdditionalAttributes.js';

/**
 * System đồng bộ trạng thái chỉ số từ mạng
 */
const TankStatsSyncSystem = defineSystemFactory([TankComponent])
	.withProcessor((context, eID, [_tank]) => {
		const netStat = context.getComponent(eID, NetworkStatsComponent);
		if (!netStat.timestamp) return;

		const { currentHP, currentEnergy } = netStat;
		const history = context.getComponent(eID, StatsHistoryComponent);

		// Replay: Cộng tất cả delta HP sau timestamp sync
		if (currentHP !== null) {
			let currentDelta;
			let historyDeltaHP = 0;

			while ((currentDelta = history.deltaHPs.pop())) {
				if (currentDelta.timestamp > netStat.timestamp) {
					historyDeltaHP += currentDelta.deltaHP;
				}
			}

			context.getComponent(eID, SurvivalComponent).setCurrentHP(currentHP + historyDeltaHP);
			netStat.currentHP = null;
		}

		// if (Date.now() - timestamp <= (3 * 1000) / 60) {
		// 	if (currentHP !== null) context.getComponent(eID, SurvivalComponent).setCurrentHP(currentHP);
		// 	if (currentEnergy !== null)
		// 		context.getComponent(eID, AdditionalAttributesComponent).currentEnergyPoint = currentEnergy;
		// }

		netStat.currentEnergy = null;
		netStat.timestamp = null;
	})
	.build();

export default TankStatsSyncSystem;
