// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import ProjectileComponent from '../../../components/combat/objects/com.Projectile.js';
import PierceComponent from '../../../components/combat/state/skill/projectile/com.Pierce.js';

const ProjectilePierceSystem = defineSystemFactory([ProjectileComponent])
	.withProcessor((context, eID, [projectile]) => {
		const piercing = context.getComponent(eID, PierceComponent, false);
		if (!piercing) return;

		// TODO: Xử lý hit limit & modifier trong tương lai

		projectile.cleanable = false;
	})
	.build();

export default ProjectilePierceSystem;
