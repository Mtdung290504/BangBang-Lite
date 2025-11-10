import { ActionDeclaration, TargetingConfig } from './dsl/combat/action/action.type-component';
import { Collidable } from './dsl/physic/collider/collider.type-conponents';
import { Renderable } from './dsl/combat/visual/visual.type-components';
import { LimitedRange, StraightMovement } from './dsl/physic/movement/movement.type-components';
import { PositionConfig } from './dsl/physic/position/position.type-components';

/**
 * Kỹ năng tạo đạn (projectile)
 * - Bay theo hướng với tốc độ và tầm bay xác định
 * - Va chạm với địch
 */
interface CreateProjectileAction
	extends ActionDeclaration<'create', 'projectile'>,
		PositionConfig<'self-pos' | 'mouse-pos'>,
		TargetingConfig<'direction'>,
		StraightMovement,
		LimitedRange,
		Renderable,
		Collidable {
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
	extends ActionDeclaration<'create', 'area-effect'>,
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
	action: '@create:projectile',
	targeting: { mode: 'direction' },

	// Tầm, hướng bay, xuất phát từ đâu
	'limit-range': 'inherit:fire-range',
	'straight-movement': {},
	from: 'self-pos',

	collision: {
		hitbox: { shape: 'circle', size: { radius: 20 } },
	},
	'projectile-config': {
		'pierce-count': 3,
	},
};

const skill_2: CreateAreaEffectAction = {
	action: '@create:area-effect',

	'limit-range': 528,
	targeting: {
		mode: 'position',
	},
	collision: {
		hitbox: { shape: 'circle', size: { radius: 30 } },
	},
	from: 'mouse-pos',

	'area-effect-config': {
		duration: 5000,
		'tick-interval': 500,
	},
};
