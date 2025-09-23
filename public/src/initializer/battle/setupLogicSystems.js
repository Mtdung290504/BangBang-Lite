import LogicSystemsManager from '../../core/managers/system/mgr.LogicSystem.js';

import SpriteNextFrameSystem from '../../core/systems/graphic/sys.SpriteNextFrame.js';
import ApplyMovementSystem from '../../core/systems/physic/movement/sys.ApplyMovement.js';
import TankHeadRotateSystem from '../../core/systems/physic/movement/sys.TankHeadRotate.js';
import TankMovementSystem from '../../core/systems/physic/movement/sys.TankMovement.js';
import TankPositionSyncSystem from '../../core/systems/network/sys.TankPositionSync.js';
import SkillExecutionSystem from '../../core/systems/combat/sys.SkillExecution.js';
import SkillActivateSystem from '../../core/systems/combat/sys.SkillActivate.js';

/**
 * @typedef {import('../../core/managers/combat/mgr.Entity.js').default} EntityManager
 */

/**
 * @param {EntityManager} context
 */
export default function setupLogicSystems(context) {
	const logicSystemsManager = new LogicSystemsManager(context);

	logicSystemsManager.registry(TankPositionSyncSystem.create(context));
	logicSystemsManager.registry(TankMovementSystem.create(context));
	logicSystemsManager.registry(TankHeadRotateSystem.create(context));
	logicSystemsManager.registry(SkillActivateSystem.create(context));
	logicSystemsManager.registry(SkillExecutionSystem.create(context));
	logicSystemsManager.registry(ApplyMovementSystem.create(context));
	logicSystemsManager.registry(SpriteNextFrameSystem.create(context));

	logicSystemsManager.finalize();
	logicSystemsManager.initAll();

	return logicSystemsManager;
}
