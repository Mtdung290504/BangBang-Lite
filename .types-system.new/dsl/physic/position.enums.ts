// export type PositionDeclaration = 'self-pos' | 'self-head' | 'target-pos' | 'skill-pos' | 'mouse-pos';

export enum PositionDeclaration {
	/** Vị trí hiện tại của bản thân (tọa độ tâm tank) */
	SELF_POS = 'self-pos',

	/** Vị trí phần đầu tank (tâm tank + bán kính tank theo hướng chuột) */
	SELF_HEAD = 'self-head',

	/** Vị trí của mục tiêu (target đang chọn) */
	TARGET_POS = 'target-pos',

	/**
	 * - Vị trí được xác định từ logic của skill trước (nếu skill này được khai báo trong self action trong on impact)
	 * - Nếu không có skill parent, fallback về `self-pos`
	 */
	PARENT_POS = 'parent-pos',

	/** Vị trí con trỏ chuột (input trực tiếp từ người chơi) */
	MOUSE_POS = 'mouse-pos',
}
