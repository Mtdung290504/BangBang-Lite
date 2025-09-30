// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import SurvivalComponent from '../../../components/combat/stats/com.Survival.js';

const DeadSystem = defineSystemFactory([SurvivalComponent])
	.withProcessor((_context, eID, [survival]) => {
		if (survival.currentHP < 1) {
			console.log(`Entity::[${eID}] dead`);
			// Giả định hồi sinh
			survival.setCurrentHP(100000000);
		}
	})
	.build();

export default DeadSystem;
