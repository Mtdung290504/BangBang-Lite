import { ImpactAction } from '../entity/skill/actions/.types';
import { Renderable, VisualManifest } from './visual.type-components';

export interface LimitedDuration {
	/**
	 * Thời gian kéo dài\
	 * Đơn vị:
	 * - giây (đối với number)
	 * - `frame-time` sẽ được tự động nhận diện và chỉ áp dụng trong 1 frame. *Cần khôn khéo => Áp dụng effect trước các system khác
	 */
	duration?: number | 'frame-time';
}

interface ImpactVisual extends Renderable {
	/**
	 * @override
	 * Hiệu ứng hiển thị khi impact (va chạm)
	 */
	visual?: VisualManifest;
}

export interface Impactable {
	impact: {
		/**
		 * Danh sách các xử lý khi trúng đích, mở rộng hết cỡ để cấu hình xử lý khác nhau tùy vào mục trúng đòn\
		 * Cho phép khai báo đơn lẻ 1 cái khi chỉ có 1 impact action, parser sẽ tự bọc trong []
		 */
		actions: ImpactAction | ImpactAction[];

		/**
		 * Impact diễn ra nhiều lần theo interval, đơn vị: giây
		 * - Nếu khai báo, skill impact nhiều lần theo interval đó
		 * - Nếu không khai báo thì chỉ impact 1 lần
		 */
		interval?: number;
	} & ImpactVisual; // Hiệu ứng khi va chạm
}
