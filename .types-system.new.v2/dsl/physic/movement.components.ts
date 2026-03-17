/**
 * Chiến thuật di chuyển theo quỹ đạo mượt (dùng cho flying object: phi tiêu, đạn)
 */
export interface MoveStrategy {
	speed: number;

	/**
	 * Không có offset = bay thẳng mượt mà,
	 * Có offset -> Bay chéo hình sin, chéo cong bezier... hoặc dật lố
	 */
	// offset?: MoveOffsetStrategy; // Để dành mở rộng quỹ đạo
}

export interface StraightMovement {
	/** Khai báo quỹ đạo (Movement Component) */
	movement?: {
		strategy: MoveStrategy;

		/**
		 * Thời gian entity bắt đầu di chuyển (mặc định = 0)
		 * VD: Đạn lơ lửng sạc 0.5s rồi mới phóng đi?
		 */
		'warm-up'?: number;
	};
}
