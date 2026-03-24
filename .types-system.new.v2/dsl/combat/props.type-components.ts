import { LimitedDistance } from '../physic/range.type-components';

export type FlyingObjectProps = {
	/**
	 * Nếu không khai báo key này, không phải flying object => Không thể bị cản bởi phản đạn hay xóa sổ
	 */
	'flying-object-props'?: {
		/**
		 * Config nảy\
		 * Nếu field trống -> không nảy
		 */
		bounce?: LimitedDistance;

		/**Config quay lại */
		return?: true;

		/** Lôi theo TẤT CẢ các mục tiêu mà nó đánh trúng (khả năng đâm trúng quy định bởi filter / capacity) */
		'drag-targets'?: boolean;
	};
};
