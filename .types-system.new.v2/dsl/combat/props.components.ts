import { ColliderShape } from '../physic/collider.types';

/**
 * Thuộc tính của vật thể bay (Đạn, Lazer, etc.)
 */
export type FlyingObjectProps = {
	/**
	 * Nếu không khai báo key này, không phải flying object => Không thể bị cản bởi phản đạn hay phản đòn
	 */
	'flying-object-props'?: {
		/** Config nảy. Giới hạn số lần nảy phụ thuộc vào `impact-capacity` của Collider. */
		bounce?: true;

		/** Config quay lại (như boomerang) */
		return?: true;
	};
};
