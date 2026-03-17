import { SkillManifest } from '../dsl/entity/skill/skill.manifest';
import { TankStatValueKey } from '../dsl/.types';
import { PositionDeclaration } from '../dsl/physic/position.enums';
import { ModifierContext } from '../dsl/combat/effect.components';

/**
 * VÍ DỤ SKILL 1: LAZER CHẾT CHÓC
 * - Bắn ra một Lazer thẳng, xuyên vô hạn mục tiêu.
 * - Sát thương: 100 + 50% AP của mình + 8% Máu đã mất của địch.
 * - Hình ảnh lazer chạy 0.5s chờ đến lúc kết thúc ('wait-finish').
 */
export const LazerSkillExample: SkillManifest = {
	id: 'skill_lazer_beam',
	name: 'Tia Lazer Xuyên Thấu',
	'base-cooldown': 8,
	'base-energy-cost': 50,
	phases: {
		/** Ngay khi bấm chiêu (Cast) */
		'on-cast': [
			// 1. Tạo Lazer Sensor
			{
				type: 'create-impactor',
				initPosition: PositionDeclaration.SELF_HEAD,
				direction: 'mouse-pos',

				// Bay 1000 range thì ngưng (Logic range)
				'limit-range': 1000,
				// Không có 'warm-up' => Bay ngay lập tức

				movement: {
					strategy: { speed: 2000 }, // Bay rất nhanh
				},

				collider: {
					shape: { type: 'rect', width: 50, height: 1000 },
					// infinity => Xuyên mọi mục tiêu không bao giờ vỡ
					'impact-capacity': 'infinity',
					// 'all' => Đụng cả lính lẫn tướng đều tính
					'passthrough-targets': 'all',
				},

				visual: {
					sprite: { assetId: 'fx_lazer_beam', loop: false },
					// LOGIC CHẾT TRƯỚC (Ví dụ bay hết 1000u trong 0.5s),
					// nhưng Anim dài 1s => 'wait-finish' sẽ giữ Lazer đứng im thêm 0.5s diễn cho xong
					'on-parent-death': 'wait-finish',
				},

				// Khi va chạm mục tiêu (Impact)
				impact: [
					{
						type: 'apply-modifier',
						attribute: TankStatValueKey.HP,
						behavior: 'instant',
						'reduction-policy': 'magic-armor', // Móc vào giáp phép của mục tiêu
						// Hàm tính sát thương siêu việt (Cần truyền context)
						valueFn: (ctx: ModifierContext) => {
							const baseDmg = 100;
							const apScale = ctx.caster.stats.AP * 0.5;

							// (MaxHP - HP) * 8%
							const lostHp = ctx.target.stats.MaxHP - ctx.target.stats.HP;
							const executeDmg = lostHp * 0.08;

							// Trả về dấu ÂM (-) biểu thị sát thương
							return -(baseDmg + apScale + executeDmg);
						},
					},
				],
			},

			// 2. Chờ 0.5s (Khựng / Delay không cho cast chiêu khác)
			{
				type: 'wait',
				duration: 0.5,
				// cancelable => có thể lách đi để hủy khựng
				'break-policy': ['cancelable', 'interruptible'],
			},
		],
	},
};
