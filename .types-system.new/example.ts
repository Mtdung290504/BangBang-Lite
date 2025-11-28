import { ActionType, TargetingConfig } from './dsl/combat/action/action.type-component';
import { Collidable } from './dsl/physic/collider/collider.type-conponents';
import { Renderable } from './dsl/combat/visual/visual.type-components';
import { Movement } from './dsl/physic/movement/movement.type-components';
import { PositionConfig } from './dsl/physic/position/position.type-components';
import { LimitedRange } from './dsl/physic/range/range.type-components';

/**
 * Kỹ năng tạo đạn (projectile)
 * - Bay theo hướng với tốc độ và tầm bay xác định
 * - Va chạm với địch
 */
interface CreateProjectileAction
	extends ActionType<'create'>,
		PositionConfig<'self-pos' | 'mouse-pos'>,
		TargetingConfig<'direction'>,
		LimitedRange,
		Renderable,
		Collidable,
		Movement {
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
interface CreateAreaEffectAction
	extends ActionType<'create'>,
		PositionConfig<'self-pos' | 'mouse-pos'>,
		TargetingConfig<'position'>,
		LimitedRange,
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

const skill_1: CreateProjectileAction = {
	action: '@create',
	targeting: { require: 'direction', strategy: null },

	// Tầm, hướng bay, xuất phát từ đâu
	'limit-range': 'inherit:fire-range',
	movement: { type: 'straight', speed: 17.5 },
	from: 'self-pos',

	collider: { shape: 'circle', size: { radius: 20 } },

	'projectile-config': {
		'pierce-count': 3,
	},
};

const skill_2: CreateAreaEffectAction = {
	action: '@create',

	'limit-range': 528,
	targeting: { require: 'position', strategy: null },
	collider: { shape: 'circle', size: { radius: 30 } },

	from: 'mouse-pos',

	'area-effect-config': {
		duration: 5000,
		'tick-interval': 500,
	},
};
