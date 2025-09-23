// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import ProjectileComponent from '../../../components/combat/objects/com.Projectile.js';

const CleanProjectileSystem = defineSystemFactory([ProjectileComponent])
	.withProcessor((context, eID, [projectile]) => {
		if (projectile.cleanable) context.removeEntity(eID);
	})
	.build();

export default CleanProjectileSystem;
