// System manager
import LogicSystemsManager from '../../core/managers/system/mgr.LogicSystem.js';

// Graphic
import SpriteNextFrameSystem from '../../core/systems/graphic/sys.SpriteNextFrame.js';

// Physic
import ApplyMovementSystem from '../../core/systems/physic/movement/sys.ApplyMovement.js';
import TankHeadRotateSystem from '../../core/systems/physic/movement/sys.TankHeadRotate.js';
import { TankMovementSystem, TankStopMovementSystem } from '../../core/systems/physic/movement/sys.TankMovement.js';
import {
	CollisionDetectionSystem,
	CollisionResetSystem,
} from '../../core/systems/physic/collision/sys.CollisionDetection.pack.js';

// Network
import TankPositionSyncSystem from '../../core/systems/network/sys.TankPositionSync.js';
import TankStatsSyncSystem from '../../core/systems/network/sys.StatsSync.js';

// Combat systems:
// Skill
import SkillExecutionSystem from '../../core/systems/combat/skill/sys.SkillExecution.js';
import SkillActivateSystem from '../../core/systems/combat/skill/sys.SkillActivate.js';
import SkillRequirementSystem from '../../core/systems/combat/skill/sys.SkillRequirement.js';
// Projectile
import ProjectileCollisionSystem from '../../core/systems/combat/projectile/sys.ProjectileCollision.js';
import ProjectilePierceSystem from '../../core/systems/combat/projectile/sys.ProjectilePierce.js';
import ProjectileBounceSystem from '../../core/systems/combat/projectile/sys.ProjectileBounce.js';
import CheckProjectileDistanceSystem from '../../core/systems/combat/projectile/sys.ProjectileDistanceChecker.js';
import CleanProjectileSystem from '../../core/systems/combat/projectile/sys.CleanProjectile.js';
// Event
import {
	SkillImpactHandleSystem,
	CleanImpactorsSystem,
	SkillImpactDetectionSystem,
} from '../../core/systems/combat/event/sys.SkillImpact.pack.js';
import ReceiveDamageSystem from '../../core/systems/combat/event/sys.ReceiveDamage.js';
import DeadHandleSystem from '../../core/systems/combat/event/sys.Dead.js';
import UpdateDamagesDisplaySystem from '../../core/systems/combat/state/sys.UpdateDamagesDisplay.js';

// Use type only
import EntityManager from '../../core/managers/combat/mgr.Entity.js';

// Utils
import { createPrefixer } from '../../../utils/utils.js';
import DoTeleportSystem from '../../core/systems/combat/action/sys.DoTeleport.js';
import RecoverHPSystem from '../../core/systems/combat/event/sys.RecoverHP.js';
import PhaseBackSystem from '../../core/systems/combat/state/sys.PhaseBack.js';

const prefixMsg = createPrefixer('> [initializer.setupLogicSystem]');

/**
 * **Note**:
 * - Hover vào các system để biết nó làm gì
 * - *Quan trọng:* Thứ tự register system là cực quan trọng, nó quyết định thứ tự chạy của system
 *
 * @param {EntityManager} context
 */
export default function setupLogicSystems(context) {
	const logicSystemsManager = new LogicSystemsManager(context);

	// Tank
	logicSystemsManager.register(TankPositionSyncSystem.create(context));
	logicSystemsManager.register(TankMovementSystem.create(context));
	logicSystemsManager.register(TankHeadRotateSystem.create(context));
	logicSystemsManager.register(DoTeleportSystem.create(context));

	// Skill
	logicSystemsManager.register(SkillActivateSystem.create(context));
	logicSystemsManager.register(SkillRequirementSystem.create(context));
	logicSystemsManager.register(SkillExecutionSystem.create(context));

	// Common
	logicSystemsManager.register(ApplyMovementSystem.create(context));
	logicSystemsManager.register(CollisionResetSystem.create(context)); // Reset chạy trước để clean dữ liệu từ frame trước
	logicSystemsManager.register(CollisionDetectionSystem.create(context)); // Chạy sau thì các system phía sau mới xử lý được
	logicSystemsManager.register(SkillImpactDetectionSystem.create(context));

	// Tank
	logicSystemsManager.register(TankStopMovementSystem.create(context));

	// Projectile
	logicSystemsManager.register(ProjectileCollisionSystem.create(context));

	// Skill impact
	logicSystemsManager.register(SkillImpactHandleSystem.create(context), 'Skill_Impact');
	logicSystemsManager.register(ReceiveDamageSystem.create(context), 'Receive_Damage');
	logicSystemsManager.register(RecoverHPSystem.create(context), 'Recover_HP');
	logicSystemsManager.register(TankStatsSyncSystem.create(context));
	logicSystemsManager.register(PhaseBackSystem.create(context), 'Phase_Back');

	// Projectile
	logicSystemsManager.register(ProjectilePierceSystem.create(context), 'Piercing');
	logicSystemsManager.register(ProjectileBounceSystem.create(context), 'Bouncing');
	logicSystemsManager.register(CheckProjectileDistanceSystem.create(context)); // Check tầm bay sau các xử lý trên
	logicSystemsManager.register(CleanProjectileSystem.create(context), 'Clean_Projectile'); // Clean projectile sau cùng

	// Skill impact
	logicSystemsManager.register(CleanImpactorsSystem.create(context), 'Clean_Impactors');

	// Dead
	logicSystemsManager.register(DeadHandleSystem.create(context), 'Dead_Handle');

	// Graphic
	logicSystemsManager.register(UpdateDamagesDisplaySystem.create(context));
	logicSystemsManager.register(SpriteNextFrameSystem.create(context));

	logicSystemsManager.finalize();
	logicSystemsManager.initAll();

	console.log(
		prefixMsg('Logic system manager initiated successfully, using system groups:', 'INFO'),
		logicSystemsManager.getSystemGroups()
	);

	return logicSystemsManager;
}
