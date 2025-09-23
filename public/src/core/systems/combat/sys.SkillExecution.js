// Builder
import defineSystemFactory from '../../factory/factory_builders/defineSystemFactory.js';
import SkillComponent from '../../components/combat/state/skill/com.SkillComponent.js';

const SkillExecutionSystem = defineSystemFactory([SkillComponent])
	.withProcessor((_context, eID, [skill]) => {
		if (!skill.usable) return;

		console.log(`> [sys.SkillExecution] Execute Skill::[${eID}]`, skill);
		skill.actions.forEach((executor) => executor.exec(skill.ownerEID));
		skill.usable = false;
	})
	.build();

export default SkillExecutionSystem;
