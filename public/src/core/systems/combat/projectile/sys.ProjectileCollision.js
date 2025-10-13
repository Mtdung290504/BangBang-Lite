import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

import ProjectileComponent from '../../../components/combat/objects/com.Projectile.js';
import ColliderComponent from '../../../components/physics/com.Collider.js';

/**
 * System xác định đạn có thực sự va chạm với gì đó và đánh dấu để clean nó
 */
const ProjectileCollisionSystem = defineSystemFactory([ProjectileComponent])
	.withProcessor((context, eID, [proj]) => {
		const collider = context.getComponent(eID, ColliderComponent);
		if (collider.collisionTargets.size > 0) proj.cleanable = true;
	})
	.build();

export default ProjectileCollisionSystem;
