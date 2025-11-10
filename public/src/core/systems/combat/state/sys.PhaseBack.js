import TankActiveSkillsComponent from '../../../components/combat/state/skill/com.TankActiveSkillsComponent.js';
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

/**
 * Sửa lại phase khi hết thời gian
 */
const PhaseBackSystem = defineSystemFactory([TankActiveSkillsComponent])
	.withProcessor((_context, _eID, [tankActiveSkills]) => {
		const now = Date.now();

		for (let i = 0; i < tankActiveSkills.timers.length; ) {
			const timer = tankActiveSkills.timers[i];
			if (timer.at <= now) {
				tankActiveSkills.setPhase(`to-phase:${timer.backToPhase}`);
				tankActiveSkills.timers.splice(i, 1); // xóa ngay timer đã dùng
			} else {
				i++;
			}
		}
	})
	.build();

export default PhaseBackSystem;
