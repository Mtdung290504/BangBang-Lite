/** Unit đo lường chung cho các giá trị */
type ValueUnit = 'unit' | '%';

/**
 * - Generic interface cho giá trị có đơn vị đo
 * - Có thể dùng cho: skill consumption, damage, healing, shield,...
 */
export interface ValueWithUnit {
	amount: number;

	/**
	 * Default: `unit`
	 * (Dùng unit khi muốn sử dụng đơn vị mặc định của ngữ cảnh, ví dụ điểm với năng lượng, giây với thời gian CD)
	 */
	unit?: ValueUnit;
}

export type InheritDeclaration<T extends string> = `inherit:${T}`;

/** Đảm bảo T là Record có key và value thỏa mãn K, V */
export type EnsureRecordType<K extends PropertyKey, V, T extends Record<K, V>> = T;
