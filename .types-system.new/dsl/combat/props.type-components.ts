export interface Bounceable {
	bounce?: {
		limit: number;
		'bounce-range': number;
	};
}

export interface Pursuitable {
	/**Đạn có đuổi mục tiêu hay không */
	pursuit?: true;
}
