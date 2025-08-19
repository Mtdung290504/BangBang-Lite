/** Unit đo lường chung cho các giá trị */
type ValueUnit = 'point' | 'percent';

/**
 * - Generic interface cho giá trị có đơn vị đo
 * - Có thể dùng cho: skill consumption, damage, healing, shield,...
 */
interface ValueWithUnit {
	amount: number;
	unit: ValueUnit;
}

export type { ValueWithUnit };
