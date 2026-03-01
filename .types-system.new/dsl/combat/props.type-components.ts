export type FlyingObjectProps = {
	/**
	 * Nếu không khai báo key này, không phải flying object => Không thể bị cản bởi phản đạn hay xóa sổ
	 */
	'flying-object-props'?: Bounceable;
};

interface Bounceable {
	bounce?: {
		limit: number;
		'bounce-range': number;
	};
}
