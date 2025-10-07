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
import DeadHandleSystem from '../../core/systems/combat/event/sys.Dead.js';
import TankStatsSyncSystem from '../../core/systems/network/sys.StatsSync.js';
import UpdateDamagesDisplaySystem from '../../core/systems/combat/state/sys.UpdateDamagesDisplay.js';

/**
 * @typedef {import('../../core/managers/combat/mgr.Entity.js').default} EntityManager
 */

/**
 * @param {EntityManager} context
 */
export default function setupLogicSystems(context) {
	const logicSystemsManager = new LogicSystemsManager(context);

	// Tank
	logicSystemsManager.register(TankPositionSyncSystem.create(context));
	logicSystemsManager.register(TankMovementSystem.create(context));
	logicSystemsManager.register(TankHeadRotateSystem.create(context));

	// Skill
	logicSystemsManager.register(SkillActivateSystem.create(context));
	logicSystemsManager.register(SkillRequirementSystem.create(context));
	logicSystemsManager.register(SkillExecutionSystem.create(context));

	// Common
	logicSystemsManager.register(ApplyMovementSystem.create(context));
	logicSystemsManager.register(CollisionResetSystem.create(context));
	logicSystemsManager.register(CollisionDetectionSystem.create(context));

	// Tank
	logicSystemsManager.register(TankStopMovementSystem.create(context));

	// Projectile
	logicSystemsManager.register(ProjectileDistanceChecker.create(context));
	logicSystemsManager.register(ProjectileCollisionSystem.create(context));

	// Skill impact
	logicSystemsManager.register(SkillImpactSystem.create(context), 'Skill_Impact');
	logicSystemsManager.register(ReceiveDamageSystem.create(context), 'Receive_Damage');
	logicSystemsManager.register(TankStatsSyncSystem.create(context));

	// Clean projectile sau
	logicSystemsManager.register(CleanProjectileSystem.create(context), 'Clean_Projectile');

	// Dead
	logicSystemsManager.register(DeadHandleSystem.create(context), 'Dead_System');

	// Graphic
	logicSystemsManager.register(UpdateDamagesDisplaySystem.create(context));
	logicSystemsManager.register(SpriteNextFrameSystem.create(context));

	logicSystemsManager.finalize();
	logicSystemsManager.initAll();
	console.log('> [initializer.setupLogicSystem] System groups:', logicSystemsManager.getSystemGroups());

	return logicSystemsManager;
}
