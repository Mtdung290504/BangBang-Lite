import { RequireCharge, RequireDelay, SkillCastAction, SkillHitAction } from './actions/.types';
import { CastingMethod, TargetedCast } from './context/casting-methods.type-components';
import { ValueWithUnit } from '../../.types';

/** Tiêu hao cả năng lượng và máu */
type SkillConsumptionBuilder<T extends string[] = []> = Partial<{ [K in T[number]]: ValueWithUnit }>;
type CONSUMPTION_TYPES = ['limit-HP', 'current-HP', 'energy'];

/**
 * Khai báo tiêu hao khi dùng skill
 * *Lý do khai báo riêng mà không cho vào action là do vấn đề gồng. Phải là trừ trước khi gồng, không phải gồng xong mới trừ*
 */
export type SkillConsumption = SkillConsumptionBuilder<CONSUMPTION_TYPES>;

/** Thời gian hồi chiêu dùng chung cho mọi skill */
export interface SkillTiming {
	/** Thời gian hồi chiêu, đơn vị: giây (Mặc định: 0) */
	cooldown?: number;
}

/**
 * Khai báo tiêu hao và các thuộc tính của skill
 */
export interface ActionProps {
	/** Object do skill tạo ra mang tính chất là đánh thường hay skill */
	property?: 'skill' | 'normal-attack';

	/** Skill tiêu hao gì, nếu không đủ, không dùng được, mặc định không tiêu hao */
	'resource-consumption'?: SkillConsumption;

	/** Khai báo cần khựng/gồng, mặc định không cần */
	'activation-require'?: RequireCharge | RequireDelay;
}

export type ActionBased = (
	| {
			'casting-method'?: Exclude<CastingMethod, TargetedCast>;
			actions: SkillCastAction[];
	  }
	| {
			'casting-method': TargetedCast;
			actions: (SkillCastAction | SkillHitAction)[];
	  }
) &
	ActionProps;
