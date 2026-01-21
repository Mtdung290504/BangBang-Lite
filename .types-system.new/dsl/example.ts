import { ActionType, TargetingConfig } from './combat/action.type-components';
import { Collidable } from './physic/collider.type-conponents';
import { Renderable } from './combat/visual.type-components';
import { Movable } from './physic/movement.type-components';
import { RequireInitPositionMethod } from './physic/position.type-components';
import { LimitedDistance } from './physic/range.type-components';

/**
 * Kỹ năng tạo đạn (projectile)
 * - Bay theo hướng với tốc độ và tầm bay xác định
 * - Va chạm với địch
 */
interface CreateProjectile
	extends ActionType<'create-entity'>,
		RequireInitPositionMethod<'self-pos' | 'mouse-pos'>,
		TargetingConfig<'direction'>,
		LimitedDistance,
		Renderable,
		Collidable,
		Movable {
	/** Cấu hình đặc biệt cho projectile, cập nhật sau... */
	'projectile-config'?: {
		// enhancements: any[];
	};
}

/**
 * Kỹ năng tạo vùng hiệu ứng (AOE)
 * - Đặt tại vị trí cụ thể
 * - Tồn tại một khoảng thời gian
 * - Gây damage liên tục cho kẻ địch trong vùng
 */
interface CreateAreaEffect
	extends ActionType<'create-entity'>,
		RequireInitPositionMethod<'self-pos' | 'mouse-pos'>,
		TargetingConfig<'position'>,
		LimitedDistance,
		Renderable,
		Collidable {
	/** Cấu hình đặc biệt cho area effect */
	'area-effect-config'?: {
		/** Thời gian tồn tại (milliseconds) */
		duration?: number;

		/** Khoảng thời gian giữa mỗi lần gây damage (milliseconds) */
		'tick-interval'?: number;
	};
}

// Examples

const skill_1: CreateProjectile = {
	action: '@create-entity',
	targeting: { require: 'direction', strategy: null },

	// Tầm, hướng bay, xuất phát từ đâu
	'limit-range': { amount: 100, unit: '%' },
	movement: { 'move-type': 'straight', speed: 17.5 },
	from: 'self-pos',

	collider: { shape: { type: 'circle', size: { radius: 20 } } },

	'projectile-config': {
		'pierce-count': 3,
	},
};

const skill_2: CreateAreaEffect = {
	action: '@create-entity',

	'limit-range': { amount: 528 },
	targeting: { require: 'position', strategy: null },
	collider: { shape: { type: 'circle', size: { radius: 30 } } },

	from: 'mouse-pos',

	'area-effect-config': {
		duration: 5000,
		'tick-interval': 500,
	},
};
