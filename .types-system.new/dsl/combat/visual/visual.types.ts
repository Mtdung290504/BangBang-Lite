/** Khai báo sprite để hiển thị */
export type SpriteDeclaration = {
	/** Key của sprite trong asset manifest */
	'sprite-key': string;

	/** Ghi đè kích thước mặc định (pixels). Không khai báo = dùng kích thước gốc */
	'display-size'?: {
		/** Chiều rộng (pixels) */
		width: number;
		/** Chiều cao (pixels) */
		height: number;
	};
};
