import { SpriteDeclaration } from './visual.types';

export interface VisualManifest {
	/**Khai báo sprite */
	sprite: SpriteDeclaration;

	/**Góc xoay hình (degrees) mặc định là 0 */
	rotate?: number;

	/**
	 * Cách xử lý Sprite khi Entity cha bị Logic yêu cầu tiêu diệt (ví dụ: đạn trúng đích, hoặc hết limited distance).
	 * - `vanish`: (Mặc định) Sprite biến mất ngay lập tức cùng Entity. Dùng cho Đạn bay (bị nổ vỡ).
	 * - `wait-finish`: Entity bị vô hiệu hóa logic (không va chạm, không di chuyển), nhưng vẫn chịu treo trên map cho đến khi Sprite diễn xong 1 vòng lặp hiện tại rồi mới bị xóa. Dùng cho Lazer, chém kiếm...
	 */
	'on-parent-death'?: 'vanish' | 'wait-finish';

	/**
	 * Khi sprite hết thì có lặp không
	 */
	loop?: true;
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
