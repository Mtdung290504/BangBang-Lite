// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';
import EntityManager from '../../../managers/combat/mgr.Entity.js';

// Components
import TankComponent from '../../../components/combat/objects/com.Tank.js';
import TankActiveSkillsComponent from '../../../components/combat/state/skill/com.TankActiveSkillsComponent.js';
import InputComponent from '../../../components/input/com.Input.js';
import ShootingComponent from '../../../components/combat/stats/com.Shooting.js';

// Constants
import { ACTIONS_KEYS } from '../../../../../configs/action-keys.js';
import SkillComponent from '../../../components/combat/state/skill/com.SkillComponent.js';

const SkillActivateSystem = defineSystemFactory([TankComponent])
	.withProcessor((context, eID, [_tank]) => {
		// Lấy input manager để đọc trạng thái các phím điều khiển
		const { inputManager } = context.getComponent(eID, InputComponent);
		const skillContainer = context.getComponent(eID, TankActiveSkillsComponent);
		const shootingComponent = context.getComponent(eID, ShootingComponent);

		const { actionState: actions, mouseState: mouse } = inputManager;

		// Toggle auto shoot (Tạm đặt ở đây để tránh vấn đề spam)
		shootingComponent.auto = actions[ACTIONS_KEYS['TOGGLE_AUTO_ATK']];

		// Check normal attack interval (determined from attack speed)
		if (Date.now() - shootingComponent.lastFireTime > shootingComponent.fireRate) {
			if (shootingComponent.auto || mouse.leftMouseDown) {
				getSkillActivator(skillContainer, 'normal-attack')?.(context);
				shootingComponent.lastFireTime = Date.now();
			}
		}

		// Activate skill
		if (actions[ACTIONS_KEYS['SKILL_1']]) getSkillActivator(skillContainer, 's1')?.(context);
		if (actions[ACTIONS_KEYS['SKILL_2']]) getSkillActivator(skillContainer, 's2')?.(context);
		if (actions[ACTIONS_KEYS['SKILL_ULTIMATE']]) getSkillActivator(skillContainer, 'ultimate')?.(context);
		if (actions[ACTIONS_KEYS['SKILL_SP']]) getSkillActivator(skillContainer, 'sp')?.(context);
	})
	.build();

export default SkillActivateSystem;

/**
 * @param {TankActiveSkillsComponent} skillContainer
 * @param {import('.types-system/dsl/tank-manifest').SkillSlot} slot
 */
function getSkillActivator(skillContainer, slot) {
	const skillEID = skillContainer.getSkill(slot);

	if (!skillEID) {
		console.warn(`> [sys.SkillActivate] Skill::[${skillEID}] does not exist`);
		return;
	}

	return /** @param {EntityManager} context */ (context) =>
		(context.getComponent(skillEID, SkillComponent).usable = true);
}
