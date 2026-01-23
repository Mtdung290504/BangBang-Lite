import { Faction } from './.enums';
import { Renderable } from './visual.type-components';

export interface LimitedDuration {
	/** Thời gian kéo dài, mặc định: `Infinity` */
	duration?: number;
}

export interface Impactable<TargetHandler extends object, SelfHandler extends object> {
	impact: {
		/**
		 * Impact diễn ra nhiều lần theo interval, đơn vị: giây
		 * - Nếu khai báo, skill impact nhiều lần theo interval đó
		 * - Nếu không khai báo thì chỉ impact 1 lần
		 */
		interval?: number;

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
