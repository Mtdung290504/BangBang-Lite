export interface ChargeRequirement {
	'require-charge'?: {
		/** Thời gian tối thiểu (Mặc định: 0) */
		'min-duration'?: number;

		/** Thời gian tối đa */
		'max-duration': number;

		/** Lúc đang tụ có thể bị phá không */
		breakable?: boolean;
	};
}
