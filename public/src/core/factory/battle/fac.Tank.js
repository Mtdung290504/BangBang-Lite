import { storage } from '../../../network/assets_managers/index.js';

import TankComponent from '../../components/combat/objects/com.Tank.js';
import TankHeadComponent from '../../components/combat/objects/com.TankHead.js';

import AdditionalAttributesComponent from '../../components/combat/stats/com.AdditionalAttributes.js';
import MovementComponent from '../../components/combat/stats/com.Movement.js';
import ShootingComponent from '../../components/combat/stats/com.Shooting.js';
import SurvivalComponent from '../../components/combat/stats/com.Survival.js';

import ShadowComponent from '../../components/graphic/com.Shadow.js';
import SpriteComponent from '../../components/graphic/com.Sprite.js';

import ColliderComponent from '../../components/physics/com.Collider.js';
import PositionComponent from '../../components/physics/com.Position.js';
import VelocityComponent from '../../components/physics/com.Velocity.js';

import InputComponent from '../../components/input/com.Input.js';
import BattleInputManager from '../../managers/input/mgr.BattleInput.js';
import { TANK_DEFAULT_SIZE } from '../../../../configs/constants/domain_constants/com.constants.js';

/**
 * @typedef {import('../../managers/combat/mgr.Entity.js').default} EntityManager
 */

/**
 * - Thực chất là khởi tạo tank body
 *
 * @param {EntityManager} context
 * @param {import('models/Player.js').default} player
 * @param {BattleInputManager} [inputManager]
 */
export default function createTank(context, player, inputManager) {
	const { tankID, skinID } = player.using;
	const { stats: tankManifest } = storage.getTankManifests(tankID);
	const { 'stat-components': stats } = tankManifest;

	// Create tank entity
	const tankEID = context.createEntity();
	inputManager = inputManager ?? new BattleInputManager();

	// Add tank/input components
	context.addComponents(tankEID, [
		new TankComponent(tankID, skinID),
		new InputComponent(inputManager), // Input để đọc, nếu không phải tank của mình thì tạo mới
	]);

	// Tank physics components
	context.addComponents(tankEID, [
		// Hitbox
		ColliderComponent.fromDSL({
			type: 'circle',
			size: { radius: tankManifest['hitbox-size'] ?? TANK_DEFAULT_SIZE },
		}),

		// Di chuyển
		new MovementComponent(stats['movement-speed'], 0),
		new VelocityComponent(),

		// TODO: Đọc vị trí xuất hiện từ map manifest
		new PositionComponent(0, 0),
	]);

	// Tank stats components
	context.addComponents(tankEID, [
		SurvivalComponent.fromDSL(stats.survival),
		ShootingComponent.fromDSL(stats.shooting),
	]);
	stats.additional && context.addComponent(tankEID, AdditionalAttributesComponent.fromDSL(stats.additional));

	// Đặt render size cho sprite của tank
	const bodySprite = new SpriteComponent(storage.getSprite(tankID, skinID, 'body'));
	let renderRadius = tankManifest['render-size'] ?? TANK_DEFAULT_SIZE;
	const renderSize = { width: renderRadius * 2, height: renderRadius * 2 };

	// *Note: Thay đổi sprite manifest lên tham chiếu gốc tiết kiệm và không gây bug
	bodySprite.resource.manifest['render-size'] = renderSize;

	// Tank graphic components
	context.addComponents(tankEID, [
		bodySprite,
		new ShadowComponent(),

		// TODO: Bổ sung StatusBar sau này nếu cần
	]);

	return { tankEID, tankHeadEID: createTankHead(context, tankEID, renderSize), inputManager };
}

/**
 * @param {EntityManager} context
 * @param {number} tankEID
 * @param {{ width: number, height: number }} renderSize
 */
function createTankHead(context, tankEID, renderSize) {
	const tankHeadEID = context.createEntity();

	const { tankID, skinID } = context.getComponent(tankEID, TankComponent);
	const getParentLayer = context.getComponent(tankEID, SpriteComponent).getLayer;

	context.addComponent(tankHeadEID, new TankHeadComponent(tankEID));
	context.addComponent(tankHeadEID, new MovementComponent(0));

	// Đặt render size cho sprite, tương tự với body
	const headSprite = new SpriteComponent(storage.getSprite(tankID, skinID, 'head'), getParentLayer);
	headSprite.resource.manifest['render-size'] = renderSize;

	context.addComponents(tankHeadEID, [
		headSprite,
		// TODO: Bổ sung shadow nếu cần
	]);

	return tankHeadEID;
}
