import { CritDamageEnum, EnergyAmountEnum, FireRateEnum } from './.enums';
import { FlightSpeedEnum } from '../../physic/movement.enums';
import { RangeEnum } from '../../physic/range.enums';

export interface ShootingStats {
	'fire-rate': FireRateEnum;
	'fire-range': RangeEnum;
	'flight-speed': FlightSpeedEnum;
}

export interface SurvivalStats {
	'limit-HP': number;
	'physical-armor': number;
	'energy-shield': number;

	/**
	 * Đơn vị: %
	 * @default 0
	 */
	resistance?: number;

	/**
	 * Đơn vị: %
	 * @default 0
	 */
	'damage-reduction'?: number;

	/**
	 * Đơn vị: %
	 * @default 0
	 */
	'life-steal'?: number;
}

export interface AttackPowerStats {
	'attack-power': number;

	'penetration-unit': number;
	'penetration-percent': number;

	/**
	 * Đơn vị: %
	 * @default 0
	 */
	'crit-rate'?: number;
	'crit-damage': CritDamageEnum;
}

export interface AdditionalStats {
	/**
	 * Note: Có thể dùng skill nội tại,
	 * không cần cấu hình riêng khả năng hồi phục nên chỉ cần khai báo giá trị
	 */
	'energy-point': EnergyAmountEnum;
}
