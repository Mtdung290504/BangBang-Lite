import { Faction } from '../../../combat/.enums';
import { ActionType } from './.type-components';
import { ChangePhase, EffectAction } from './apply-effect.type-entities';
import { CreateImpactor } from './create-attack.type-entities';

export type SkillCastAction = CreateImpactor | ChangePhase | ActivateSkillAction;

/** Gọi một skill bất kỳ thông qua tên định nghĩa trong SkillManifest */
interface ActivateSkillAction extends ActionType<'do-act', 'activate-skill'> {
	skill: string;
}

export type ImpactAction = {
	/** Mặc định: `['enemy', 'tower']` */
	'affected-faction'?: Faction[];
} & ImpactHandle;

export type ImpactHandle<
	TargetEffect extends object = EffectAction,
	SelfAction extends object = SkillCastAction | EffectAction,
> = {
	/**Effect lên mục tiêu trúng */
	'target-effect'?: TargetEffect | TargetEffect[];

	/**Effect lên bản thân */
	'caster-effect'?: TargetEffect | TargetEffect[];

	/**Có hủy fly object nó đụng không */
	'fly-object-effect'?: 'destroy';

	/**Action của bản thân */
	actions?: SelfAction | SelfAction[];
};
