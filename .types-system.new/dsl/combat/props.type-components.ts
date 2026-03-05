import { LimitedDistance } from '../physic/range.type-components';

export type FlyingObjectProps = {
	/**
	 * Nếu không khai báo key này, không phải flying object => Không thể bị cản bởi phản đạn hay xóa sổ
	 */
	'flying-object-props'?: {
		/**Config nảy */
		bounce?: Bounceable;

		/**Config quay lại */
		return?: true;
	};
};

interface Bounceable extends LimitedDistance {
	limit: number;
}
