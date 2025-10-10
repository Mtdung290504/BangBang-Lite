import EntityManager from '../../../../managers/combat/mgr.Entity.js';

// Tank components
import TankComponent from '../../../../components/combat/objects/com.Tank.js';
import SkillContextComponent from '../../../../components/combat/state/skill/com.SkillContext.js';
import ShootingComponent from '../../../../components/combat/stats/com.Shooting.js';

// Projectile components
import ProjectileComponent from '../../../../components/combat/objects/com.Projectile.js';

import OwnerEIDComponent from '../../../../components/combat/state/com.OwnerEID.js';
import TargetFilterComponent from '../../../../components/combat/state/skill/com.TargetFilter.js';
import ImpactTargetsComponent from '../../../../components/combat/state/skill/com.ImpactTargets.js';
import PierceComponent from '../../../../components/combat/state/skill/projectile/com.Pierce.js';
import BounceComponent from '../../../../components/combat/state/skill/projectile/com.Bounce.js';

import VelocityComponent from '../../../../components/physics/com.Velocity.js';
import ColliderComponent from '../../../../components/physics/com.Collider.js';
import PositionComponent from '../../../../components/physics/com.Position.js';
import MovementComponent from '../../../../components/physics/com.Movement.js';

import SpriteComponent from '../../../../components/graphic/com.Sprite.js';

import OnSkillHitManifest from '../../../../components/combat/event_container/skill/com.OnSkillHitManifest.js';
import OnSkillDealtDamageManifest from '../../../../components/combat/event_container/skill/com.OnSkillDealtDamageManifest.js';

// Base & parser
import BaseActionExecutor from '../base/executor.BaseAction.js';
import parseProjectileManifest from './parsers/parseProjectileManifest.js';

// Utils / constants
import * as angleFs from '../../../../fomulars/angle.js';
import {
	PROJECTILE_SPEED_CALCULATION_CONSTANT,
	RANGE_CALCULATION_CONSTANT,
	SKILL_EFFECT_LAYER,
} from '../../../../../../configs/constants/domain_constants/com.constants.js';

export default class CreateProjectileExecutor extends BaseActionExecutor {
	/**
	 * @param {EntityManager} context
	 * @param {import('./parsers/parseProjectileManifest.js').CreateProjectileAction} manifest
	 */
	constructor(context, manifest) {
		if (manifest.action !== '@create:projectile') throw new TypeError('Invalid action manifest');

		super(context);
		this.parsedManifest = parseProjectileManifest(manifest);
	}

	/**
	 * @override
	 * @param {number} selfTankEID
	 */
	exec(selfTankEID) {
		const { context, parsedManifest } = this;
		const tank = context.getComponent(selfTankEID, TankComponent);
		const skillContext = context.getComponent(selfTankEID, SkillContextComponent);

		let { targets, flightRange, flightSpeed, renderSize, enhancements, onDealtDamage, onHit } = parsedManifest;
		const { collider, spriteKey, hitEffectSprite } = parsedManifest;

		// Xác định tầm bắn và tốc độ đạn
		const shootingStats = context.getComponent(selfTankEID, ShootingComponent);
		flightRange = flightRange !== 'inherit' ? flightRange : shootingStats.range * RANGE_CALCULATION_CONSTANT;
		flightSpeed = flightSpeed !== 'inherit' ? flightSpeed : shootingStats.flightSpeed;

		// Tính velocity cho đạn và xác định góc quay của đạn
		const { angle } = skillContext.headAngleRef; // Góc xoay của đầu tank
		const deltaX = Math.cos(angleFs.degToRad(angle)) * flightSpeed * PROJECTILE_SPEED_CALCULATION_CONSTANT;
		const deltaY = Math.sin(angleFs.degToRad(angle)) * flightSpeed * PROJECTILE_SPEED_CALCULATION_CONSTANT;
		const projVel = new VelocityComponent(deltaX, deltaY);
		const projMov = new MovementComponent(flightSpeed * PROJECTILE_SPEED_CALCULATION_CONSTANT, angle);

		// Tính vị trí xuất hiện của đạn (Vị trí tương đối của mũi tank)
		const { x: selfX, y: selfY } = skillContext.selfPosRef;
		const { radius: tankRadius } = context.getComponent(selfTankEID, ColliderComponent);
		const projX = selfX + tankRadius * Math.cos(angleFs.degToRad(angle));
		const projY = selfY + tankRadius * Math.sin(angleFs.degToRad(angle));
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

		// Tạo projectile
		const projEID = context.createEntity();
		const proj = new ProjectileComponent(flightRange);
		context.addComponents(projEID, [proj, projVel, projMov, projPos, projCollider, projSprite]);

		// Lưu event handler và target filter vào projectile
		context.addComponents(projEID, [
			new OwnerEIDComponent(selfTankEID),
			new OnSkillHitManifest(onHit),
			new OnSkillDealtDamageManifest(onDealtDamage),
			new TargetFilterComponent(targets),

			// Trạng thái
			new ImpactTargetsComponent(),
		]);

		// Thêm cường hóa
		context.addComponents(
			projEID,
			enhancements.reduce((acc, enhancement) => {
				switch (enhancement.name) {
					case 'piercing':
						acc.push(PierceComponent.fromDSL(enhancement));
						break;
					case 'tracking':
						// acc.push(TrackingComponent.fromDSL(enhancement));
						break;
					case 'bouncing':
						acc.push(BounceComponent.fromDSL(enhancement));
						break;
					default:
						console.warn('Invalid enhancement, ignore');
						break;
				}
				return acc;
			}, /**@type {object[]} */ ([]))
		);
	}
}
