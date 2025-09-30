import LogicSystemsManager from '../../core/managers/system/mgr.LogicSystem.js';

// Graphic
import SpriteNextFrameSystem from '../../core/systems/graphic/sys.SpriteNextFrame.js';

// Physic
import ApplyMovementSystem from '../../core/systems/physic/movement/sys.ApplyMovement.js';
import TankHeadRotateSystem from '../../core/systems/physic/movement/sys.TankHeadRotate.js';
import TankMovementSystem from '../../core/systems/physic/movement/sys.TankMovement.js';
import TankStopMovementSystem from '../../core/systems/physic/movement/sys.TankStopMovement.js';
import CollisionDetectionSystem from '../../core/systems/physic/collision/sys.CollisionDetection.js';
import CollisionResetSystem from '../../core/systems/physic/collision/sys.CollisionReset.js';

// Network
import TankPositionSyncSystem from '../../core/systems/network/sys.TankPositionSync.js';

// Combat
import SkillExecutionSystem from '../../core/systems/combat/skill/sys.SkillExecution.js';
import SkillActivateSystem from '../../core/systems/combat/skill/sys.SkillActivate.js';
import SkillRequirementSystem from '../../core/systems/combat/skill/sys.SkillRequirement.js';
import ProjectileDistanceChecker from '../../core/systems/combat/projectile/sys.ProjectileDistanceChecker.js';
import CleanProjectileSystem from '../../core/systems/combat/projectile/sys.CleanProjectile.js';
import ProjectileCollisionSystem from '../../core/systems/combat/projectile/sys.ProjectileCollision.js';
import SkillImpactSystem from '../../core/systems/combat/event/sys.SkillImpact.js';
import ReceiveDamageSystem from '../../core/systems/combat/event/sys.ReceiveDamage.js';
import DeadSystem from '../../core/systems/combat/event/sys.Dead.js';

/**
 * @typedef {import('../../core/managers/combat/mgr.Entity.js').default} EntityManager
 */

/**
 * @param {EntityManager} context
 */
export default function setupLogicSystems(context) {
	const logicSystemsManager = new LogicSystemsManager(context);

	// Tank
	logicSystemsManager.registry(TankPositionSyncSystem.create(context));
	logicSystemsManager.registry(TankMovementSystem.create(context));
	logicSystemsManager.registry(TankHeadRotateSystem.create(context));

	// Skill
	logicSystemsManager.registry(SkillActivateSystem.create(context));
	logicSystemsManager.registry(SkillRequirementSystem.create(context));
	logicSystemsManager.registry(SkillExecutionSystem.create(context));

	// Common
	logicSystemsManager.registry(ApplyMovementSystem.create(context));
	logicSystemsManager.registry(CollisionResetSystem.create(context));
	logicSystemsManager.registry(CollisionDetectionSystem.create(context));

	// Tank
	logicSystemsManager.registry(TankStopMovementSystem.create(context));

	// Projectile
	logicSystemsManager.registry(ProjectileDistanceChecker.create(context));
	logicSystemsManager.registry(ProjectileCollisionSystem.create(context));

	// Skill impact
	logicSystemsManager.registry(SkillImpactSystem.create(context), 'Skill_Impact');
	logicSystemsManager.registry(ReceiveDamageSystem.create(context), 'Receive_Damage');

	// Clean projectile sau
	logicSystemsManager.registry(CleanProjectileSystem.create(context), 'Clean_Projectile');

	// Dead
	logicSystemsManager.registry(DeadSystem.create(context), 'Dead_System');

	// Graphic
	logicSystemsManager.registry(SpriteNextFrameSystem.create(context));

	logicSystemsManager.finalize();
	logicSystemsManager.initAll();
	console.log('> [initializer.setupLogicSystem] System groups:', logicSystemsManager.getSystemGroups());

	return logicSystemsManager;
}
