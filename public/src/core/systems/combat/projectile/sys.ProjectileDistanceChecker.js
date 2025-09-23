// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import ProjectileComponent from '../../../components/combat/objects/com.Projectile.js';
import VelocityComponent from '../../../components/physics/com.Velocity.js';

const ProjectileDistanceChecker = defineSystemFactory([ProjectileComponent])
	.withProcessor((context, eID, [projectile]) => {
		const { dx, dy } = context.getComponent(eID, VelocityComponent);

		if (projectile.outOfRange) projectile.cleanable = true;
		projectile.traveledDistance += Math.hypot(dx, dy);
	})
	.build();

export default ProjectileDistanceChecker;
