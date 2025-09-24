// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import SkillComponent from '../../../components/combat/state/skill/com.SkillComponent.js';

const SkillExecutionSystem = defineSystemFactory([SkillComponent])
	.withProcessor((_context, _eID, [skill]) => {
		if (!skill.usable) return;

		skill.actions.forEach((executor) => executor.exec(skill.ownerEID));
		skill.usable = false;
	})
	.build();

export default SkillExecutionSystem;
