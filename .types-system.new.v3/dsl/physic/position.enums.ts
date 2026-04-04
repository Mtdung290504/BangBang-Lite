export type PositionDeclaration =
	/** Vị trí hiện tại của bản thân (tọa độ tâm tank) */
	| 'self-pos'

	/** Vị trí phần đầu tank (tâm tank + bán kính tank theo hướng chuột + 3px) */
	| 'self-head'

	/** Vị trí của mục tiêu (target đang chọn) */
	| 'target-pos'

	/**
	 * Vị trí được xác định từ logic của skill trước (nếu skill này được khai báo trong self action trong on impact).
	 * Nếu không có skill parent, fallback về `self-pos`
	 */
	| 'parent-pos'

	/** Vị trí con trỏ chuột (input trực tiếp từ người chơi) */
	| 'mouse-pos';
