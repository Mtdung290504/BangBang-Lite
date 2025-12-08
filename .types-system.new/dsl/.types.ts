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

/**
 * Định nghĩa T là Record phải có key thỏa mãn K và value thỏa mãn V
 * @example type Account = PredefinedKeysRecord<'id' | 'password', string, { id: string, password: string }>
 */
export type TypedRecord<K extends PropertyKey, V, T extends Record<K, V>> = T;

/** Chuyển object thành Partial kể cả các object lồng */
export type DeepPartial<T> = T extends any[] ? T : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

export type KeyOfMany<T extends readonly object[]> = keyof T[number];
