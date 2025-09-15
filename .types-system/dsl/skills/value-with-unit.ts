/** Unit đo lường chung cho các giá trị */
type ValueUnit = 'unit' | '%';

/**
 * - Generic interface cho giá trị có đơn vị đo
 * - Có thể dùng cho: skill consumption, damage, healing, shield,...
 */
interface ValueWithUnit {
	amount: number;

	/**
	 * Default: `unit`
	 * (Dùng unit khi muốn sử dụng đơn vị mặc định của ngữ cảnh, ví dụ điểm với năng lượng, giây với thời gian CD)
	 */
	unit?: ValueUnit;
}

export type { ValueWithUnit };
