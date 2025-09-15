import type { SkillConsumption } from './skill-consumption';
import type { SkillCastAction } from './actions/skill-actions';
import type { SkillCast, TargetedSkillCast } from './context/context.casting-methods';
import { SkillEventHandler } from '../events/event-manifest';

/** Thời gian hồi chiêu dùng chung cho mọi skill */
interface SkillTiming {
	/** Thời gian hồi chiêu, đơn vị: giây (Mặc định: 0) */
	cooldown?: number;
}

/** Khai báo tiêu hao và thuộc tính của skill */
interface ActionProps {
	'resource-consumption'?: SkillConsumption;
	property: 'skill' | 'normal-attack';
}

type ActionBased = ActionProps &
	(
		| {
				'casting-method'?: SkillCast;
				actions: SkillCastAction[];
		  }
		| {
				'casting-method'?: TargetedSkillCast;
				actions: SkillEventHandler;
		  }
	);

export type { SkillTiming, ActionBased };
