import ColliderComponent from '../../../components/physics/com.Collider.js';
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

const CollisionResetSystem = defineSystemFactory([ColliderComponent])
	.withProcessor((_context, _eID, [collider]) => {
		collider.collisionTargets.clear();
	})
	.build();

export default CollisionResetSystem;
