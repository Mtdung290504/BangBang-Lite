import { Faction } from './.enums';

export interface LimitedDuration {
	/** Thời gian kéo dài */
	duration?: number;
}

export interface Impactable<TargetHandler extends object, SelfHandler extends object> {
	/**Skill entity có biến mất khi trúng mục tiêu hay không (mặc định: `true`) */
	'dispose-on-impact'?: boolean;
	'on-impact': ({
		/**Mặc định: 'enemy' */
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
}
