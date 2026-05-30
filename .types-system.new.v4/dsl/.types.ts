/** Unit đo lường chung cho các giá trị */
export type ValueUnit = 'u' | '%';

/**
 * - Generic interface cho giá trị có đơn vị đo
 * - Có thể dùng cho: skill consumption, damage, healing, shield,...
 *
 * Ví dụ: `100%` hay `25u` (với u viết tắt cho unit)
 */
export type ValueWithUnit<Amount extends number = number> = `${Amount}${ValueUnit}`;

export type InheritDeclaration<T extends string> = `inherit:${T}`;

/**
 * Định nghĩa T là Record phải có key thỏa mãn K và value thỏa mãn V
 * @example type Account = PredefinedKeysRecord<'id' | 'password', string, { id: string, password: string }>
 */
export type TypedRecord<K extends PropertyKey, V, T extends Record<K, V>> = T;

/**
 * Định nghĩa object với các key K có cùng type value V
 */
export type RecordSameValueType<K extends PropertyKey, V> = { [P in K]: V };

/** Chuyển object thành Partial kể cả các object lồng */
export type DeepPartial<T> = T extends any[] ? T : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
