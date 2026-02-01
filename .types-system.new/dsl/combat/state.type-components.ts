import { ImpactAction } from '../entity/skill/actions/.types';
import { Renderable } from './visual.type-components';

export interface LimitedDuration {
	/**
	 * Thời gian kéo dài
	 * - Đơn vị: s
	 * - Mặc định: `Infinity`
	 */
	duration?: number;
}

export interface Impactable {
	impact: {
		actions: ImpactAction[];

		/**
		 * Impact diễn ra nhiều lần theo interval, đơn vị: giây
		 * - Nếu khai báo, skill impact nhiều lần theo interval đó
		 * - Nếu không khai báo thì chỉ impact 1 lần
		 */
		interval?: number;
	} & Renderable; // Hiệu ứng khi va chạm
}
