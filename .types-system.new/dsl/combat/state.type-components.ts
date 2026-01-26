import { Faction } from './.enums';
import { Renderable } from './visual.type-components';

export interface LimitedDuration {
	/** Thời gian kéo dài, mặc định: `Infinity` */
	duration?: number;
}

export interface Impactable<TargetEffect extends object, SelfAction extends object> {
	impact: {
		/**
		 * Impact diễn ra nhiều lần theo interval, đơn vị: giây
		 * - Nếu khai báo, skill impact nhiều lần theo interval đó
		 * - Nếu không khai báo thì chỉ impact 1 lần
		 */
		interval?: number;

		actions: ({
			/** Mặc định: `['enemy', 'neutral']` */
			'affected-faction'?: Faction[];
		} & (
			| {
					'target-effect': TargetEffect[];
					'self-action'?: SelfAction[];
			  }
			| {
					'target-effect'?: TargetEffect[];
					'self-action': SelfAction[];
			  }
		))[];
	} & Renderable; // Hiệu ứng khi va chạm
}
