import { SpriteDeclaration } from './visual.types';

/** Component visual - Render sprite */
export interface Renderable {
	/**Không khai báo = invisible (dùng cho skill ẩn hoặc chỉ logic) */
	visual?: {
		/**Khai báo sprite */
		sprite: SpriteDeclaration;

		/**Góc xoay hình (degrees) mặc định là 0 */
		rotate?: number;
	};
}
