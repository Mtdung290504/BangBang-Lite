export type LayerConfig =
	| {
			type: 'static';
			value: number;
	  }
	| {
			type: 'relative';
			value: number;
	  };

export type SpriteManifest = {
	/**Các frame có thể có padding */
	'padding-ratio'?: number;

	/**Kích thước gốc của từng frame */
	'frame-size': { width: number; height: number };

	/**Kích thước render, mặc định bằng `frame-size` */
	'render-size'?: { width: number; height: number };

	/**Danh sách các vị trí của các frame trong sprite */
	'frames-position': { x: number; y: number }[];

	/**Thời gian hiển thị, mặc định là vô hạn */
	duration?: number;

	/** Delta layer relative to player layer, mặc định bằng với tank = 0 */
	'layer-config'?: LayerConfig;
};

export type Renderable = {
	layer: number;
	render: () => void;
};
