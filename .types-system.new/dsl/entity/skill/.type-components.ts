export interface ChargeRequirement {
	'require-charge'?: {
		/** Thời gian tối thiểu */
		'min-duration': number;

		/** Thời gian tối đa */
		'max-duration': number;
	};
}
