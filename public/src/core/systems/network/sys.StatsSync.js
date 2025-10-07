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
		if (netStat.timestamp === null) return;

		const { currentHP, currentEnergy } = netStat;
		const history = context.getComponent(eID, StatsHistoryComponent);

		// Replay: Cộng tất cả delta HP sau timestamp sync
		if (currentHP !== null) {
			const survival = context.getComponent(eID, SurvivalComponent);
			if (survival.currentHP !== netStat.currentHP) {
				let currentDelta;
				let historyDeltaHP = 0;

				while ((currentDelta = history.deltaHPs.pop())) {
					console.log(netStat.timestamp - currentDelta.timestamp);
					if (currentDelta.timestamp >= netStat.timestamp) {
						console.log(currentDelta);
						historyDeltaHP += currentDelta.deltaHP;
					}
				}

				if (historyDeltaHP !== 0) console.log(survival.currentHP, currentHP + historyDeltaHP);
				survival.setCurrentHP(currentHP + historyDeltaHP);
			}
		}

		// if (Date.now() - timestamp <= (3 * 1000) / 60) {
		// 	if (currentHP !== null) context.getComponent(eID, SurvivalComponent).setCurrentHP(currentHP);
		// 	if (currentEnergy !== null)
		// 		context.getComponent(eID, AdditionalAttributesComponent).currentEnergyPoint = currentEnergy;
		// }

		netStat.currentHP = null;
		netStat.currentEnergy = null;
		netStat.timestamp = null;
	})
	.build();

export default TankStatsSyncSystem;
