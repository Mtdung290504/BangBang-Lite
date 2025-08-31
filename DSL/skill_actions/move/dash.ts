interface Dash {
	range: number;
	speed: number;

	/**Mặc định: false */
	'through-wall'?: boolean;

	/**Mặc định: false */
	'through-tank'?: boolean;
}

export type { Dash };
