// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import SurvivalComponent from '../../../components/combat/stats/com.Survival.js';
import PositionComponent from '../../../components/physics/com.Position.js';
import AdditionalAttributesComponent from '../../../components/combat/stats/com.AdditionalAttributes.js';

const DeadHandleSystem = defineSystemFactory([SurvivalComponent])
	.withProcessor((context, eID, [survival]) => {
		if (survival.currentHP < 1) {
			console.log(`Entity::[${eID}] dead`);

			// Giả định hồi sinh
			const pos = context.getComponent(eID, PositionComponent);
			pos.x = pos.initX;
			pos.y = pos.initY;
			survival.setCurrentHP(survival.limitHP);

			const additional = context.getComponent(eID, AdditionalAttributesComponent);
			additional.currentEnergyPoint = Infinity;
		}
	})
	.build();

export default DeadHandleSystem;
