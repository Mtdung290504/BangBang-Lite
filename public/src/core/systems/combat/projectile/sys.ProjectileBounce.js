// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import TankComponent from '../../../components/combat/objects/com.Tank.js';
import ProjectileComponent from '../../../components/combat/objects/com.Projectile.js';

import BounceComponent from '../../../components/combat/state/skill/projectile/com.Bounce.js';
import TargetFilterComponent from '../../../components/combat/state/skill/com.TargetFilter.js';
import OwnerEIDComponent from '../../../components/combat/state/com.OwnerEID.js';
import ImpactTargetsComponent from '../../../components/combat/state/skill/com.ImpactTargets.js';
import SkillContextComponent from '../../../components/combat/state/skill/com.SkillContext.js';

import PositionComponent from '../../../components/physics/com.Position.js';
import VelocityComponent from '../../../components/physics/com.Velocity.js';
import MovementComponent from '../../../components/physics/com.Movement.js';

// Fomulars
import { degToRad, radToDeg } from '../../../fomulars/angle.js';

const ProjectileBounceSystem = defineSystemFactory([ProjectileComponent])
	.withProcessor((context, eID, [projectile]) => {
		const bouncing = context.getComponent(eID, BounceComponent, false);
		if (!bouncing) return;
		if (bouncing.hitRemaining === 0) return; // Hết lượt nảy

		// Targets
		const targets = context.getComponent(eID, TargetFilterComponent);
		const impactTarget = context.getComponent(eID, ImpactTargetsComponent);

		// Source tank
		const { ownerEID: sourceEID } = context.getComponent(eID, OwnerEIDComponent);
		const { team: sourceTeam } = context.getComponent(sourceEID, SkillContextComponent);

		// Note: Có thể nguy hiểm trong tương lai, xóa sạch impactTarget trừ cái cuối cùng
		for (let i = 0; i < impactTarget.targetEIDs.length - 1; i++)
			impactTarget.targetEIDsSet.delete(impactTarget.targetEIDs[i]);
		impactTarget.targetEIDs = impactTarget.targetEIDs.slice(-1);

		// Target tank
		const lastTargetEID = impactTarget.targetEIDs.at(-1);
		if (!lastTargetEID) return;

		// Nếu đạn đánh trúng mục tiêu target, xóa target để cập nhật target
		if (lastTargetEID === bouncing.currentTargetEID) bouncing.currentTargetEID = null;

		// Đang hướng đến target, không xử lý nữa nhưng chặn xóa đạn
		if (bouncing.currentTargetEID !== null) return (projectile.cleanable = false);

		const lastTargetPos = context.getComponent(lastTargetEID, PositionComponent);
		let nearestTargetPos = null;
		let nearestTarget = null;
		let minDistSq = Infinity;

		// TODO: Xử lý hit limit & modifier trong tương lai
		for (const [checkTargetEID, checkTargetPos] of context.getEntitiesWithComponent(PositionComponent)) {
			// Ignore the target that was just hit
			if (checkTargetEID === lastTargetEID) continue;

			// Make sure Position is of a valid target.
			// *Currently only Tank is the only valid target
			const tank = context.getComponent(checkTargetEID, TankComponent, false);
			if (!tank) continue;

			// Ignore unacceptable targets
			const { team: checkTargetTeam } = context.getComponent(checkTargetEID, SkillContextComponent);
			if (targets.ally && sourceTeam !== checkTargetTeam) continue;
			if (targets.enemy && sourceTeam === checkTargetTeam) continue;
			if (targets.self && checkTargetEID === sourceEID) continue;

			// Use squared distance to optimize, calculate the distance between the targetPos and hittedTankPos
			const dx = checkTargetPos.x - lastTargetPos.x;
			const dy = checkTargetPos.y - lastTargetPos.y;
			const distSq = dx * dx + dy * dy;

			// Update latest target
			if (distSq < minDistSq) {
				minDistSq = distSq;
				nearestTargetPos = checkTargetPos;
				nearestTarget = checkTargetEID;
			}
		}

		// If no nearest target is found within the `bounceRange` radius, remove the component
		if (
			nearestTarget === null ||
			nearestTargetPos === null ||
			(nearestTarget !== null && minDistSq >= bouncing.bounceRange * bouncing.bounceRange)
		) {
			context.removeComponent(eID, BounceComponent);
			return;
		}

		console.log(`> [ProjectileBounceSystem] Projectile:[${eID}] bounce to Target:[${nearestTarget}]`);
		// Set target and subtract bounce times
		bouncing.currentTargetEID = nearestTarget;
		bouncing.hitRemaining -= 1;

		// Set the flight distance to bounce distance
		projectile.traveledDistance = projectile.flightRange - bouncing.bounceRange;

		// Calculate new flight angle from hitTankPos to nearestTargetPos
		const projPos = context.getComponent(eID, PositionComponent);
		const projVel = context.getComponent(eID, VelocityComponent);
		const projMov = context.getComponent(eID, MovementComponent);

		// Tính lại angle
		const dx = nearestTargetPos.x - projPos.x;
		const dy = nearestTargetPos.y - projPos.y;
		projMov.angle = radToDeg(Math.atan2(dy, dx));
		const radMovAngle = degToRad(projMov.angle);

		// Tính lại velocity
		projVel.dx = Math.cos(radMovAngle) * projMov.speed;
		projVel.dy = Math.sin(radMovAngle) * projMov.speed;

		// Không cho clean
		projectile.cleanable = false;
	})
	.build();

export default ProjectileBounceSystem;
