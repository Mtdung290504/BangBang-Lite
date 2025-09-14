export type SpriteDeclaration = {
	/** Sprite key của thực thể để render */
	'sprite-key': string;

	/** Nếu không khai báo, mặc định lấy `frame-size` từ `sprite-manifest` */
	'render-size'?: {
		width: number;
		height: number;
	};
};
