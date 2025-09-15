// Use type only
import EntityManager from '../../managers/combat/mgr.Entity.js';
import parseProjectileManifest from '../parsers/parseProjectileManifest.js';

// Components
import ProjectileComponent from '../../components/combat/objects/com.Projectile.js';
import TankComponent from '../../components/combat/objects/com.Tank.js';
import ShootingComponent from '../../components/combat/stats/com.Shooting.js';
import VelocityComponent from '../../components/physics/com.Velocity.js';
import MovementComponent from '../../components/physics/com.Movement.js';
import PositionComponent from '../../components/physics/com.Position.js';
import ColliderComponent from '../../components/physics/com.Collider.js';
import SpriteComponent from '../../components/graphic/com.Sprite.js';

// Utils / constants
import * as angleFs from '../../fomulars/angle.js';
import {
	PROJECTILE_SPEED_CALCULATION_CONSTANT,
	SKILL_EFFECT_LAYER,
} from '../../../../configs/constants/domain_constants/com.constants.js';

/**
 * Khởi tạo projectile
 *
 * - `renderSize` của projectile mặc định kế thừa từ collider của nó
 * - `flightRange` của projectile mặc định kế thừa từ tầm bắn của tank
 * - `flightSpeed` của projectile mặc định kế thừa từ tốc độ đạn bay của tank
 * - `spriteKey` của projectile mặc định là `normal-attack`
 *
 * @param {EntityManager} context
 * @param {number} tankEID
 * @param {ReturnType<typeof parseProjectileManifest>} parsedProjectileManifest
 */
export default function createProjectile(context, tankEID, parsedProjectileManifest) {
	const tank = context.getComponent(tankEID, TankComponent);
	let { flightRange, flightSpeed, renderSize, enhancements, onDealtDamage, onHit } = parsedProjectileManifest;
	const { collider, spriteKey, hitEffectSprite } = parsedProjectileManifest;

	// Xác định tầm bắn và tốc độ đạn
	const shootingStats = context.getComponent(tankEID, ShootingComponent);
	flightRange = flightRange !== 'inherit' ? flightRange : shootingStats.range;
	flightSpeed = flightSpeed !== 'inherit' ? flightSpeed : shootingStats.flightSpeed;

	// Tính velocity cho đạn
	const { angle } = context.getComponent(tank.tankHeadEID, MovementComponent); // Góc xoay của đầu tank
	const deltaX = Math.cos(angleFs.degToRad(angle)) * flightSpeed * PROJECTILE_SPEED_CALCULATION_CONSTANT;
	const deltaY = Math.sin(angleFs.degToRad(angle)) * flightSpeed * PROJECTILE_SPEED_CALCULATION_CONSTANT;
	const projVel = new VelocityComponent(deltaX, deltaY);

	// Tính vị trí xuất hiện của đạn (Vị trí tương đối của mũi tank)
	const { x: tankX, y: tankY } = context.getComponent(tankEID, PositionComponent);
	const { radius: tankRadius } = context.getComponent(tankEID, ColliderComponent);
	const projX = tankX + tankRadius * Math.cos(angleFs.degToRad(angle));
	const projY = tankY + tankRadius * Math.sin(angleFs.degToRad(angle));
	const projPos = new PositionComponent(projX, projY);

	// Xác định collider
	const projCollider = ColliderComponent.fromDSL(collider);

	// Xác định sprite cho đạn
	const loadedProjSprite = tank.getSprite(spriteKey);

	// Sửa render size và layer config theo mặc định của projectile
	renderSize = renderSize !== 'inherit' ? renderSize : projCollider;
	loadedProjSprite.manifest['render-size'] ??= renderSize;
	loadedProjSprite.manifest['layer-config'] ??= { type: 'static', value: SKILL_EFFECT_LAYER };
	const projSprite = new SpriteComponent(loadedProjSprite);

	const projEID = context.createEntity();
	context.addComponents(projEID, [
		new ProjectileComponent(tankEID, flightRange),
		projVel,
		projPos,
		projCollider,
		projSprite,
	]);
}
