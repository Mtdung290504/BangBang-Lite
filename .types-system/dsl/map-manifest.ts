interface MapManifest {
	'other-save'?: any;
	size: { width: number; height: number };

	/**
	 * Mảng 3 chiều, chiểu đầu tiên là 2 team
	 * Chiều tiếp theo chứa 5 vị trí xuất hiện
	 * Chiều cuối cùng chứa tọa độ [x, y]
	 */
	'appear-coords': number[][][];
}

export type { MapManifest };
