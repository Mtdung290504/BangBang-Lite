// Builder
import defineSystemFactory from '../../factory/factory_builders/defineSystemFactory.js';

// Components
import NetworkStatsComponent from '../../components/network/com.NetworkStats.js';
import StatsHistoryComponent from '../../components/network/com.StatsHistory.js';
import TankComponent from '../../components/combat/objects/com.Tank.js';
import SurvivalComponent from '../../components/combat/stats/com.Survival.js';
import AdditionalAttributesComponent from '../../components/combat/stats/com.AdditionalAttributes.js';

const DEBUG_MODE = false;

/** System đồng bộ trạng thái chỉ số từ mạng */
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
				if (DEBUG_MODE) console.group('Sync-HP');
				let currentDelta;
				let historyDeltaHP = 0;

				while ((currentDelta = history.deltaHPs.pop())) {
					if (currentDelta.timestamp > netStat.timestamp) {
						if (DEBUG_MODE) console.log('Sub delta history:', currentDelta);
						historyDeltaHP += currentDelta.deltaHP;
					}
				}

				const syncHP = currentHP + historyDeltaHP;
				if (historyDeltaHP !== 0 && DEBUG_MODE)
					console.log(`Current-HP:${survival.currentHP} Sync-HP:${syncHP} History-Delta:${historyDeltaHP}`);
				survival.setCurrentHP(syncHP);
				if (DEBUG_MODE) console.groupEnd();
			}
		}

		// if (Date.now() - timestamp <= (3 * 1000) / 60) {
		// 	if (currentHP !== null) context.getComponent(eID, SurvivalComponent).setCurrentHP(currentHP);
		// TODO: Bổ sung cơ chế replay sau
		if (currentEnergy !== null)
			context.getComponent(eID, AdditionalAttributesComponent).currentEnergyPoint = currentEnergy;
		// }

		netStat.currentHP = null;
		netStat.currentEnergy = null;
		netStat.timestamp = null;
	})
	.build();

export default TankStatsSyncSystem;
