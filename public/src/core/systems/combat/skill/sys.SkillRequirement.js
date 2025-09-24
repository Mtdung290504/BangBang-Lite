// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import SkillComponent from '../../../components/combat/state/skill/com.SkillComponent.js';
import SkillCooldownComponent from '../../../components/combat/state/skill/com.Cooldown.js';

const SkillRequirementSystem = defineSystemFactory([SkillComponent])
	.withProcessor((context, eID, [skill]) => {
		if (!skill.usable) return;

		const cooldownComponent = context.getComponent(eID, SkillCooldownComponent, false);
		if (!cooldownComponent) return;

		if (cooldownComponent.remainingCD === 0) {
			cooldownComponent.activateCD();
			return;
		}

		// Lock skill if cooldown !== 0
		console.log(
			`> [sys.SkillCooldown] Skill::[${eID}] is on cooldown (${cooldownComponent.remainingCD.toFixed(2)})`
		);
		skill.usable = false;
	})
	.build();

export default SkillRequirementSystem;
