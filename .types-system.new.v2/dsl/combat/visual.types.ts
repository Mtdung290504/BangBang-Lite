import { SpriteKey } from './visual.enums';

/** Khai báo sprite để hiển thị */
export type SpriteDeclaration = {
	/** Key của sprite trong asset manifest */
	key: SpriteKey;

	/** Ghi đè kích thước gốc của sprite (pixels). Không khai báo = dùng kích thước gốc */
	'display-size'?: { width: number; height: number };
};
