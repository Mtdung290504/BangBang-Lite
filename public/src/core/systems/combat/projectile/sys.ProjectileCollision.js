import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

import ProjectileComponent from '../../../components/combat/objects/com.Projectile.js';
import SkillImpactComponent from '../../../components/combat/state/com.SkillImpact.js';
import SkillContextComponent from '../../../components/combat/state/skill/com.SkillContext.js';
import TargetFilterComponent from '../../../components/combat/state/skill/com.TargetFilter.js';

import ColliderComponent from '../../../components/physics/com.Collider.js';
import OwnerEIDComponent from '../../../components/combat/state/com.OwnerEID.js';

const DEBUG = false;
const ProjectileCollisionSystem = defineSystemFactory([ProjectileComponent])
	.withProcessor((context, eID, [proj]) => {
		const collider = context.getComponent(eID, ColliderComponent);
		const { ownerEID: projOwnerEID } = context.getComponent(eID, OwnerEIDComponent);
		const { team: selfTeam } = context.getComponent(projOwnerEID, SkillContextComponent);
		const targetFilter = context.getComponent(eID, TargetFilterComponent);

		for (const targetEID of collider.collisionTargets) {
			const skillImpactContainer = context.getComponent(targetEID, SkillImpactComponent, false);

			if (skillImpactContainer) {
				const { team: targetTeam } = context.getComponent(targetEID, SkillContextComponent);
				const isSelf = projOwnerEID === targetEID;

				// Nếu có thể đánh trúng kẻ địch
				if (targetFilter.enemy && selfTeam !== targetTeam) {
					DEBUG && console.log(`Projectile::[${eID}] hit enemy::[${targetEID}]`);
					skillImpactContainer.addImpact(eID, 'enemy');
					proj.cleanable = true;
				}

				// Nếu có đánh trúng đồng minh
				else if (targetFilter.ally && selfTeam === targetTeam && !isSelf) {
					DEBUG && console.log(`Projectile::[${eID}] hit ally::[${targetEID}]`);
					skillImpactContainer.addImpact(eID, 'ally');
					proj.cleanable = true;
				}

				// Nếu có thể đánh trúng bản thân
				else if (targetFilter.self && isSelf) {
					DEBUG && console.log(`Projectile::[${eID}] hit owner::[${targetEID}]`);
					skillImpactContainer.addImpact(eID, 'self');
					proj.cleanable = true;
				}
			}
			// TODO: Trong tương lai else if các case đánh trúng tường/object khác
		}
	})
	.build();

export default ProjectileCollisionSystem;
