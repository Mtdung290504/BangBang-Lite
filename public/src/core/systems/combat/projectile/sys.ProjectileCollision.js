import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

import ProjectileComponent from '../../../components/combat/objects/com.Projectile.js';
import SkillHitComponent from '../../../components/combat/state/com.SkillHit.js';
import SkillContextComponent from '../../../components/combat/state/skill/com.SkillContext.js';
import TargetFilterComponent from '../../../components/combat/state/skill/com.TargetFilter.js';

import ColliderComponent from '../../../components/physics/com.Collider.js';

const ProjectileCollisionSystem = defineSystemFactory([ProjectileComponent])
	.withProcessor((context, eID, [proj]) => {
		const collider = context.getComponent(eID, ColliderComponent);
		const { team: selfTeam } = context.getComponent(proj.ownerEID, SkillContextComponent);
		const targetFilter = context.getComponent(eID, TargetFilterComponent);

		for (const targetEID of collider.collisionTargets) {
			const skillImpactContainer = context.getComponent(targetEID, SkillHitComponent, false);

			if (skillImpactContainer) {
				const { team: targetTeam } = context.getComponent(targetEID, SkillContextComponent);
				const isSelf = proj.ownerEID === targetEID;
				let hit = false;

				// Nếu có thể đánh trúng kẻ địch
				hit ||= targetFilter.enemy && selfTeam !== targetTeam;
				// Nếu có đánh trúng đồng minh
				hit ||= targetFilter.ally && selfTeam === targetTeam && !isSelf;
				// Nếu có thể đánh trúng bản thân
				hit ||= targetFilter.self && isSelf;

				if (hit) {
					console.log(`Hit::[${eID}, ${targetEID}]`);
					skillImpactContainer.skillImpactEIDs.push(eID);
					proj.cleanable = true;
				}
			}
			// TODO: Trong tương lai else if các case đánh trúng tường/object khác
		}
	})
	.build();

export default ProjectileCollisionSystem;
