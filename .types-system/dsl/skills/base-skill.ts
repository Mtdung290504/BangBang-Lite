import type { SkillConsumption } from './skill-consumption';
import type { SkillCastAction } from './actions/skill-actions';
import type { SkillCast, SkillCastingMethods, TargetedSkillCast } from './context/context.casting-methods';

/** Thời gian hồi chiêu dùng chung cho mọi skill */
interface SkillTiming {
	/** Thời gian hồi chiêu, đơn vị: giây (Mặc định: 0) */
	cooldown?: number;
}

/**
 * Helper type để tạo skill với casting method cụ thể
 */
type WithCasting<T, CastMethod extends SkillCastingMethods> = T & {
	'casting-method'?: CastMethod;
	'resource-consumption'?: SkillConsumption;
	property: 'skill' | 'normal-attack';
	actions: SkillCastAction<CastMethod>[];
};

/**
 * Helper để tạo ActionBased với tất cả casting methods
 */
type ActionBased<T = {}> = WithCasting<T, SkillCast> | WithCasting<T, TargetedSkillCast>;

export type { SkillTiming, WithCasting, ActionBased };
