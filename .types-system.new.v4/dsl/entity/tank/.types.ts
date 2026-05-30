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
	 * Kháng hiệu ứng\
	 * Đơn vị: %
	 * @default 0
	 */
	resistance?: number;

	/**
	 * Miễn thương sát thương công thường\
	 * Đơn vị: %
	 * @default 0
	 */
	'na-damage-immunity'?: number;

	/**
	 * Miễn thương sát thương skill\
	 * Đơn vị: %
	 * @default 0
	 */
	'skill-damage-immunity'?: number;

	/**
	 * Hút máu công thường\
	 * Đơn vị: %
	 * @default 0
	 */
	'na-life-steal'?: number;

	/**
	 * Hút máu skill\
	 * Đơn vị: %
	 * @default 0
	 */
	'skill-life-steal'?: number;

	/**
	 * Hấp thụ sát thương công thường (Hồi máu theo % ST công thường phải chịu)\
	 * Đơn vị: %
	 * @default 0
	 */
	'na-thorns-heal'?: number;

	/**
	 * Hấp thụ sát thương skill (Hồi máu theo % ST skill phải chịu)\
	 * Đơn vị: %
	 * @default 0
	 */
	'skill-thorns-heal'?: number;
}

export interface AttackPowerStats {
	'attack-power': number;

	/**
	 * Điểm xuyên giáp
	 */
	'penetration-unit': number;

	/**
	 * Khả năng bỏ qua giáp. Tức không phải xuyên theo điểm mà là bỏ qua x% giáp khi gây ST\
	 * Đơn vị: %
	 * @default 0
	 */
	'penetration-percent'?: number;

	/**
	 * Đơn vị: %
	 * @default 0
	 */
	'crit-rate'?: number;

	/**
	 * @default 200
	 */
	'crit-damage': CritDamageEnum;
}

export interface AdditionalStats {
	/**
	 * Note: Có thể dùng skill nội tại,
	 * không cần cấu hình riêng khả năng hồi phục nên chỉ cần khai báo giá trị
	 */
	'energy-point': EnergyAmountEnum;
}
