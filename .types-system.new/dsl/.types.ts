/** Unit đo lường chung cho các giá trị */
export type ValueUnit = 'u' | '%';

/**
 * - Generic interface cho giá trị có đơn vị đo
 * - Có thể dùng cho: skill consumption, damage, healing, shield,...
 *
 * Ví dụ:
 * - Amount không charge scalable: `100%` hay `25u` (với u viết tắt cho unit)
 * - Amount charge scalable: `100% *0.5` hay `25u *1`
 * 	- Sau dấu * là hệ số nhân với charge time hoặc có thể xem là `mức tăng/s`
 * 	- Ví dụ `100% +*0.5/s` và thời gian charge là `3s` thì Value = 100% * (1 + 0.5 * 3) = 250% (*Cộng thêm 1 để 0s charge không bị 0 value*)
 */
export type ValueWithUnit<
	ChargeScalable extends boolean = false,
	Amount extends number = number,
> = `${Amount}${ValueUnit}${ChargeScalable extends true ? ` ${'+' | '-'}*${number}/s` | '' : ''}`;

export type InheritDeclaration<T extends string> = `inherit:${T}`;

/**
 * Định nghĩa T là Record phải có key thỏa mãn K và value thỏa mãn V
 * @example type Account = PredefinedKeysRecord<'id' | 'password', string, { id: string, password: string }>
 */
export type TypedRecord<K extends PropertyKey, V, T extends Record<K, V>> = T;

/** Chuyển object thành Partial kể cả các object lồng */
export type DeepPartial<T> = T extends any[] ? T : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
