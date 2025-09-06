import LogicSystemsManager from '../../core/managers/system/mgr.LogicSystem.js';

import ApplyMovementSystem from '../../core/systems/physic/movement/sys.ApplyMovement.js';
import TankHeadRotateSystem from '../../core/systems/physic/movement/sys.TankHeadRotate.js';
import TankMovementSystem from '../../core/systems/physic/movement/sys.TankMovement.js';
import TankPositionSyncSystem from '../../core/systems/physic/network/sys.TankPositionSync.js';

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
	logicSystemsManager.registry(ApplyMovementSystem.create(context));
	logicSystemsManager.registry(TankHeadRotateSystem.create(context));

	logicSystemsManager.finalize();
	logicSystemsManager.initAll();

	return logicSystemsManager;
}
