/**Thuộc tính tank - Vật lý hay năng lượng */
export type TankDamageType = 'physical' | 'energy';

/**Loại sát thương tạo ra - Vật lý, năng lượng hoặc chuẩn */
export type DamageType = 'true' | TankDamageType;

export type BonusStatStateEnum = `${'current' | 'lost'}${'-HP' | '-energy-point'}`;

export type FireRateEnum = 60 | 90 | 120;
export type CritDamageEnum = 150 | 200;
export type EnergyAmountEnum = 100 | 150 | 200;
