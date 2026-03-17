import { SkillManifest } from '../dsl/entity/skill/skill.manifest';
import { TankStatValueKey } from '../dsl/.types';
import { ModifierContext } from '../dsl/combat/effect.components';

/**
 * VÍ DỤ SKILL 2: NỘI TẠI (PASSIVE) - HỒ LÔ MÁU
 * - Cứ mỗi 5 giây, buff hồi máu cho Tướng đồng minh thấp máu nhất xung quanh (Bán kính 500).
 * - Lượng hồi: 10% Máu tối đa của BẢN THÂN.
 */
export const PassiveSkillExample: SkillManifest = {
	id: 'passive_healing_gourd',
	name: 'Hồ Lô Sinh Lực',
	phases: {
		/** Vòng lặp kích hoạt định kỳ của Nội tại (Engine tự động trigger) */
		'on-periodic': [
			{
				type: 'apply-effect',
				
				// Chọn đồng minh thấp máu nhất trong phạm vi
				target: 'lowest-hp-ally', 

				manifest: {
					type: 'trigger-actuator',
					// lặp lại mỗi 5 giây
					interval: 5.0, 
					
					// Hành động xảy ra mỗi chu kỳ
					'on-interval': {
						type: 'apply-modifier',
						attribute: TankStatValueKey.HP,
						behavior: 'instant',
						// Không có giảm trừ sát thương
						'reduction-policy': 'none',

						// Hàm tính lượng hồi phục (Dấu DƯƠNG)
						valueFn: (ctx: ModifierContext) => {
							const myMaxHp = ctx.caster.stats.MaxHP;
							// Hồi 10% máu tối đa của mình
							return myMaxHp * 0.10; 
						}
					}
				}
			}
		]
	}
};
