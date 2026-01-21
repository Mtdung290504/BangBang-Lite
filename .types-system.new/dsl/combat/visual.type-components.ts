import { SpriteDeclaration } from './visual.types';

export interface VisualManifest {
	/**Khai báo sprite */
	sprite: SpriteDeclaration;

	/**Góc xoay hình (degrees) mặc định là 0 */
	rotate?: number;

	/**Thời gian tồn tại effect, mặc định: 0 - Tức hiệu ứng sẽ biến mất ngay khi entity biến mất */
	duration?: number;
}

export interface Renderable {
	/**Không khai báo = invisible (dùng cho skill ẩn hoặc chỉ logic) */
	visual?: VisualManifest;
}

export interface TextVisual {
	/**
	 * Quyết định hiển thị số bay lên thẳng hay chéo.
	 * Công thức tính góc dự kiến: 90 + `text-delta-angle` * 15
	 * Mặc định: `0` (bay thẳng lên: 90 + 0 * 15)
	 */
	'text-delta-angle'?: -1 | 0 | 1;
}
