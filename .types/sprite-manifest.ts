export type SpriteManifest = {
	/** Sprite sẽ được render trên hay dưới model tank bao nhiêu layer, mặc định 0 - tức cùng layer */
	'delta-layer'?: number;

	/**Các frame có thể có padding */
	'padding-ratio'?: number;

	/**Kích thước gốc của từng frame */
	'frame-size': { width: number; height: number };

	/**Danh sách các vị trí của các frame trong sprite */
	'frames-position': { x: number; y: number }[];
};
