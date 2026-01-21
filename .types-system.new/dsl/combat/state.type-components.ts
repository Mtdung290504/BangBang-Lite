import { Faction } from './.enums';
import { Renderable } from './visual.type-components';

export interface LimitedDuration {
	/** Thời gian kéo dài, mặc định: `Infinity` */
	duration?: number;
}

export interface Impactable<TargetHandler extends object, SelfHandler extends object> {
	'on-impact': {
		/** Skill entity có biến mất khi trúng mục tiêu hay không (mặc định: `true`) */
		// dispose?: boolean;

		actions: ({
			/** Mặc định: `enemy` */
			'affected-faction'?: Faction;
		} & (
			| {
					'target-effect': TargetHandler;
					'self-action'?: SelfHandler;
			  }
			| {
					'target-effect'?: TargetHandler;
					'self-action': SelfHandler;
			  }
		))[];
	} & Renderable; // Hiệu ứng khi va chạm
}
