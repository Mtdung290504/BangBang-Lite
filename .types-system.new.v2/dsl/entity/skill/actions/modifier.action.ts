import { ApplyModifier } from '../../../combat/effect.components';
import { ActionType, UseTargetingStrategy } from './.components';

/**
 * 5. APPLY MODIFIER ACTION (CHỈ SỬ DỤNG TRONG NGỮ CẢNH SKILL/IMPACT)
 * Bao hàm toàn bộ DealtDamage, Heal, ModSpeed... 
 * 
 * Lưu ý: Có Target Strategy vì Action này có thể gọi độc lập từ Phase của skill (cast thẳng lên target)
 * Hoặc nằm trong On-Impact của Impactor.
 */
export interface ApplyModifierAction extends ApplyModifier, Partial<UseTargetingStrategy> {
	type: 'apply-modifier'; // Ghi đè cứng type xuống đây
}
