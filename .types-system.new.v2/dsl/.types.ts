export type ValueWithUnit<RequireUnit extends boolean = true, ExtraEnumType extends string = never> = RequireUnit extends true
	? `${number}${ExtraEnumType extends never ? '' : ExtraEnumType}`
	: number | `${number}${ExtraEnumType extends never ? '' : ExtraEnumType}`;

/**
 * Các loại chỉ số có thể gán cho một Entity
 */
export enum TankStatValueKey {
	/** Hit point */
	HP = 'HP',
	MaxHP = 'MaxHP',
	/** Năng lượng */
	Energy = 'Energy',
	MaxEnergy = 'MaxEnergy',

	/** Movement speed */
	Speed = 'Speed',

	/** Tỉ lệ hồi máu mỗi nhịp/s */
	HP_Regen = 'HP_Regen',
	/** Tỉ lệ hồi Năng lượng mỗi nhịp/s */
	Energy_Regen = 'Energy_Regen',

	/** Thời gian chờ trước khi có thể gắn/hồi một đơn vị đạn/nội năng vào nòng */
	ReloadTime = 'ReloadTime',
	/** Thời gian chờ giữa 2 lần tấn công liên tiếp */
	AttackSpeed = 'AttackSpeed',

	/** Thể hiện % sát thương gây ra bị triệt tiêu */
	Armor = 'Armor',
	/** Kháng hiệu ứng (%) */
	Resistance = 'Resistance',

	/** Sát thương vật lý (tương tác với Armor) */
	AD = 'AD',
	/** Sát thương phép (tương tác với Magic_Armor) */
	AP = 'AP',
}

/** Tốc độ cố định */
export type SpeedEnum = 'u/s';

/**
 * Định dạng:
 * - 0% (với 0 = current level)
 * - % theo stat (VD: 10% HP)
 * - +-value cứng
 */
export type StatValueString = ValueWithUnit<false, '%' | `% ${TankStatValueKey}` | `+${number}` | `-${number}`>;
