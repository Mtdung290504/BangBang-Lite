import { SkillEffect } from '../../../combat/effect.manifest';
import { ActionType, UseTargetingStrategy } from './.components';

/**
 * 6. APPLY EFFECT ACTION (GẮN BUFF/DEBUFF)
 * Áp dụng một cục Effect Manifesto (Stat, State, hoặc Trigger) lên mục tiêu.
 */
export interface ApplyEffectAction<ActionBase> extends ActionType<'apply-effect'>, Partial<UseTargetingStrategy> {
	/** Chi tiết của hiệu ứng sẽ được áp dụng */
	manifest: SkillEffect<ActionBase>;

	/** Có ghi đè mục tiêu của Effect không hay theo ngữ cảnh hiện tại? Mặc định 'target' (Người bị trúng chiêu) */
	'override-target'?: 'self' | 'parent';
}
