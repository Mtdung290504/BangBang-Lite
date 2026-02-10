import { StatValue } from '../../../combat/effect.type-components';
import { LimitedDuration } from '../../../combat/state.type-components';
import { Renderable, VisualManifest } from '../../../combat/visual.type-components';
import { SkillCastAction } from './.types';
import { DealtDamage, ModifyEnergy, RecoverHP } from './apply-effect.type-entities';

export type EffectAction = DealtDamage | RecoverHP | ModifyEnergy | SkillCastAction;
export interface EffectManifest extends Renderable, LimitedDuration {
	/** Name để nhận diện effect dùng cho stack và hiển thị */
	name?: string;

	/** Mô tả hiển thị */
	description?: string;

	/**
	 * @override
	 * Icon hiển thị
	 */
	visual?: VisualManifest;

	/**
	 * @override
	 * Thời gian tồn tại.\
	 * Cơ chế: Bồi thêm stack -> Reset thời gian về ban đầu\
	 * Mặc định: 0s (VD gây damage bình thường, không có thêm gì)
	 */
	duration?: number;

	/**
	 * Impact diễn ra nhiều lần theo interval, đơn vị: giây
	 * - Nếu khai báo, skill impact nhiều lần theo interval đó
	 * - Nếu không khai báo thì chỉ impact 1 lần
	 */
	interval?: number;

	/**
	 * Định nghĩa hành vi cho từng stack. Quy định luôn số stack tối đa\
	 * Note: Vì effect đã có ngữ cảnh từ impactor nên chỉ cần khai báo effect lên target và action của bản thân trong này
	 *
	 * - Ví dụ [stack1, stack2, stack...]
	 * - action: Khai báo hành động đốt, hoặc áp effect như làm chậm
	 * - interval: tần suất kích hoạt action
	 * - on-start: khi đạt đến stack này sẽ kích hoạt action gì đó
	 * - on-end: khi effect này kết thúc sẽ kích hoạt action gì đó
	 * - visual: hiệu ứng effect, ví dụ lửa tầng 1 khác tầng 2, 3, 4
	 *
	 */
	impacts: {
		/** Khai báo các trạng thái như tăng/giảm tốc/các chỉ số khác... của effect */
		'modify-stats'?: StatValue[];

		/** Khi effect bắt đầu thì gây ra gì đó */
		'on-start'?: (EffectAction | 'clear')[];

		/** Khi đến interval thì làm gì đó */
		'on-interval'?: EffectAction[];

		/** Khi effect kết thúc thì gây ra gì đó */
		'on-end'?: EffectAction[];

		/**
		 * @override
		 * Hiệu ứng của effect, ví dụ đốt hay độc
		 */
		visual?: VisualManifest;
	}[];
}

// const test: EffectManifest = {
// 	name: 'starlord-passive',
// 	description: 'Địch giảm tốc và chịu ST, bản thân tăng tốc công',
// 	duration: 2,
// 	visual: { sprite: { key: 'starlord-burn' } },
// 	impacts: [1, 2, 3, 4].map((stack) => ({
// 		visual: { sprite: { key: `burn-effect-stack:${stack}` } },
// 		'on-enter': [],
// 		actions: [
// 			{
// 				// Không đốt trụ được nên chỉ enemy
// 				'affected-faction': ['enemy'],

// 				// Tăng tốc đánh bản thân 5% mỗi tầng
// 				'self-action': [
// 					{
// 						action: '@apply:modify-stat',
// 						'value-from': { attribute: 'fire-rate', of: 'self', value: `${5 * stack}%` },
// 					},
// 				],

// 				// Địch giảm tốc chạy 10% và chịu 20% tấn công/s mỗi tầng
// 				'target-effect': [
// 					{
// 						action: '@apply:modify-stat',
// 						'value-from': { attribute: 'movement-speed', of: 'target', value: `${-10 * stack}%` },
// 					},
// 					{
// 						action: '@apply:dealt-damage',
// 						'value-from': { attribute: 'attack-power', of: 'self', value: `${20 * stack}%` },
// 					},
// 				],
// 			},
// 		],
// 	})),
// };
