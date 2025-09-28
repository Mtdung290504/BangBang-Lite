// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import ProjectileComponent from '../../../components/combat/objects/com.Projectile.js';
import PositionComponent from '../../../components/physics/com.Position.js';
import ColliderComponent from '../../../components/physics/com.Collider.js';

const ProjectileCollisionSystem = defineSystemFactory([ProjectileComponent])
	.withProcessor((context, eID, [projectile]) => {
		const { x, y } = context.getComponent(eID, PositionComponent);

		for (const [eID, [pos, collider]] of context.getEntitiesWithComponents([
			PositionComponent,
			ColliderComponent,
		])) {
		}

		// if (projectile.outOfRange) projectile.cleanable = true;
	})
	.build();

export default ProjectileCollisionSystem;
