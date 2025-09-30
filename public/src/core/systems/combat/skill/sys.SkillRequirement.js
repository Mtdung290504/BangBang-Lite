// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import SkillComponent from '../../../components/combat/state/skill/com.SkillComponent.js';
import SkillCooldownComponent from '../../../components/combat/state/skill/com.Cooldown.js';

const DEBUG = false;
const SkillRequirementSystem = defineSystemFactory([SkillComponent])
	.withProcessor((context, eID, [skill]) => {
		if (!skill.usable) return;

		const cooldownComponent = context.getComponent(eID, SkillCooldownComponent, false);
		if (!cooldownComponent) return;

		const remainingCD = cooldownComponent.remainingCD;
		if (remainingCD === 0) {
			cooldownComponent.activateCD();
			return;
		}

		// Lock skill if cooldown !== 0
		DEBUG && console.log(`> [sys.SkillCooldown] Skill::[${eID}] is on cooldown (${remainingCD.toFixed(2)})`);
		skill.usable = false;
	})
	.build();

export default SkillRequirementSystem;
