// Builder
import defineSystemFactory from '../../../factory/factory_builders/defineSystemFactory.js';

// Components
import PositionComponent from '../../../components/physics/com.Position.js';
import ColliderComponent from '../../../components/physics/com.Collider.js';
import MovementComponent from '../../../components/physics/com.Movement.js';

// Fomulars
import { circleCollisionCircle, circleCollisionRectangle } from '../../../fomulars/collision.js';

const DEBUG = false;

/**
 * System nhận diện va chạm\
 * *Note: Chỉ query ColliderComponent nhằm tối ưu số vòng lặp*
 */
export const CollisionDetectionSystem = defineSystemFactory([ColliderComponent])
	.withProcessor((context, eID, [collider]) => {
		const pos = context.getComponent(eID, PositionComponent);

		for (const [checkEID, checkCollider] of context.getEntitiesWithComponent(ColliderComponent)) {
			const checkPos = context.getComponent(checkEID, PositionComponent);
			if (eID >= checkEID) continue;
			if (collider.collisionTargets.has(checkEID) || checkCollider.collisionTargets.has(eID)) continue;
			if (collider.type === 'circle' && checkCollider.type === 'rectangle') {
				const rectAngle = context.getComponent(checkEID, MovementComponent, false)?.angle;
				if (
					circleCollisionRectangle(
						pos,
						/** @type {ColliderComponent<'circle'>} */ (collider),
						checkPos,
						/** @type {ColliderComponent<'rectangle'>} */ (checkCollider),
						rectAngle
					)
				) {
					DEBUG && console.log('Collision:', collider, checkCollider);
					collider.collisionTargets.add(checkEID);
					checkCollider.collisionTargets.add(eID);
				}
			} else if (collider.type === 'rectangle' && checkCollider.type === 'circle') {
				const rectAngle = context.getComponent(eID, MovementComponent, false)?.angle;
				if (
					circleCollisionRectangle(
						checkPos,
						/** @type {ColliderComponent<'circle'>} */ (checkCollider),
						pos,
						/** @type {ColliderComponent<'rectangle'>} */ (collider),
						rectAngle
					)
				) {
					DEBUG && console.log('Collision:', collider, checkCollider);
					collider.collisionTargets.add(checkEID);
					checkCollider.collisionTargets.add(eID);
				}
			} else if (collider.type === 'circle' && checkCollider.type === 'circle') {
				if (
					circleCollisionCircle(
						checkPos,
						/** @type {ColliderComponent<'circle'>} */ (checkCollider),
						pos,
						/** @type {ColliderComponent<'circle'>} */ (collider)
					)
				) {
					DEBUG && console.log('Collision:', collider, checkCollider);
					collider.collisionTargets.add(checkEID);
					checkCollider.collisionTargets.add(eID);
				}
			}
		}
	})
	.build();

/**
 * System clean trạng thái collision sau khi đã xử lý
 */
export const CollisionResetSystem = defineSystemFactory([ColliderComponent])
	.withProcessor((_context, _eID, [collider]) => {
		collider.collisionTargets.clear();
	})
	.build();
