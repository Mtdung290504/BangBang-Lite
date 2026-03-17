export interface SpriteDeclaration {
	assetId: string;
	
	/** 
	 * Hình ảnh có lặp lại liên tục không? 
	 * - true (ví dụ: đạn bay lửa cuộn): Nếu Entity sống lâu hơn Animation, nó sẽ chạy lại từ đầu.
	 * - false (ví dụ: Lazer xẹt, kiếm đâm): Nếu Anim chạy xong mà Entity vẫn sống, nó khựng tại frame cuối (hoặc biến mất tùy asset).
	 * Mặc định: false
	 */
	loop?: boolean;
}

export interface VisualManifest {
	sprite: SpriteDeclaration;
	rotate?: number;

	/** 
	 * Cách xử lý Sprite khi Entity cha bị Logic yêu cầu tiêu diệt (ví dụ: đạn trúng đích, hoặc hết limited distance).
	 * - `vanish`: (Mặc định) Sprite biến mất ngay lập tức cùng Entity. Dùng cho Đạn bay (bị nổ vỡ).
	 * - `wait-finish`: Entity bị vô hiệu hóa logic (không va chạm, không di chuyển), nhưng vẫn chịu treo trên map cho đến khi Sprite diễn xong 1 vòng lặp hiện tại rồi mới bị xóa. Dùng cho Lazer, chém kiếm...
	 */
	'on-parent-death'?: 'vanish' | 'wait-finish';
}

export interface Renderable {
	visual?: VisualManifest;
}
