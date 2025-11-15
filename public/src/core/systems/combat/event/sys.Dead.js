// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import SurvivalComponent from '../../../components/combat/stats/com.Survival.js';
import PositionComponent from '../../../components/physics/com.Position.js';
import AdditionalAttributesComponent from '../../../components/combat/stats/com.AdditionalAttributes.js';
import TankActiveSkillsComponent from '../../../components/combat/state/skill/com.TankActiveSkillsComponent.js';

const DeadHandleSystem = defineSystemFactory([SurvivalComponent])
	.withProcessor((context, eID, [survival]) => {
		if (survival.currentHP < 1) {
			console.log(`Entity::[${eID}] dead`);

			// Hồi đầy HP
			survival.setCurrentHP(survival.limitHP);

			// Đặt lại vị trí
			const pos = context.getComponent(eID, PositionComponent);
			pos.x = pos.initX;
			pos.y = pos.initY;

			// Hồi đầy năng lượng, nếu có
			const additional = context.getComponent(eID, AdditionalAttributesComponent, false);
			if (additional) additional.currentEnergyPoint = additional.limitEnergyPoint;

			// Đặt lại phase skill về phase gốc
			context.getComponent(eID, TankActiveSkillsComponent, false)?.resetPhase();
		}
	})
	.build();

export default DeadHandleSystem;
